// src/services/gameService.js
//
// Camada de serviço que abstrai TODAS as operações de dados do jogo.
// Hoje usa Firebase diretamente. Para migrar para Java Spring Boot,
// basta trocar a implementação de cada função — os componentes não mudam.
//
// ── PLANO DE MIGRAÇÃO PARA JAVA SPRING BOOT ────────────────────────────────
//
//  ATUAL (Firebase):                 FUTURO (Java REST API):
//  ─────────────────────────────     ───────────────────────────────────────
//  getDoc(doc(db, 'users', uid))  →  GET  /api/users/{uid}
//  updateDoc(..., { gamesData })  →  PUT  /api/users/{uid}/games
//  getDocs(q publicProfiles)      →  GET  /api/profiles?username={username}
//  setDoc(doc(db, 'pushSubs'))    →  POST /api/push-subscriptions
//
//  Para trocar: mude BASE_URL e substitua os blocos Firebase por fetch().
//  Os componentes importam daqui e nunca precisam saber qual backend é usado.
// ──────────────────────────────────────────────────────────────────────────

import { db } from '../firebase';
import {
  doc, getDoc, setDoc, updateDoc, deleteField, writeBatch,
  collection, query, where, getDocs, serverTimestamp,
} from 'firebase/firestore';

const MAX_BATCH_OPERATIONS = 450;
const saveQueues = new Map();

function cleanPublicText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

export function toPublicGames(gamesData = []) {
  if (!Array.isArray(gamesData)) return [];

  return gamesData.map((game, index) => {
    let sourceImage = String(game?.imageUrl || game?.imageBase64 || '').trim();
    if (sourceImage.startsWith('LOADING_URL:')) {
      sourceImage = sourceImage.replace('LOADING_URL:', '').trim();
    }
    if (sourceImage.startsWith('//')) {
      sourceImage = 'https:' + sourceImage;
    }

    let imageUrl = '';
    if (/^https?:\/\//i.test(sourceImage)) {
      imageUrl = sourceImage.slice(0, 2048);
    } else if (sourceImage.startsWith('data:image/')) {
      // Para capas Base64, preserva para jogos visíveis no perfil (zerados, playing, jogando)
      const isVisible = game?.status === 'zerados' || game?.status === 'playing' || game?.status === 'jogando';
      if (isVisible) {
        imageUrl = sourceImage.length <= 350_000 ? sourceImage : '';
      }
    }

    return {
      id: cleanPublicText(game?.id ?? index, 100),
      nome: cleanPublicText(game?.nome, 160),
      status: cleanPublicText(game?.status, 40),
      platform: cleanPublicText(game?.platform, 160),
      rating: Math.max(0, Math.min(10, Number(game?.rating) || 0)),
      isPlatinum: Boolean(game?.isPlatinum),
      finishedDate: cleanPublicText(game?.finishedDate, 40),
      imageUrl,
      imageBase64: imageUrl.startsWith('data:image/') ? imageUrl : '',
    };
  });
}

function gameDocumentId(game, index) {
  const rawId = String(game?.id ?? index);
  return `game_${encodeURIComponent(rawId).slice(0, 1000)}`;
}

async function commitOperations(operations) {
  for (let index = 0; index < operations.length; index += MAX_BATCH_OPERATIONS) {
    const batch = writeBatch(db);
    operations.slice(index, index + MAX_BATCH_OPERATIONS).forEach(operation => operation(batch));
    await batch.commit();
  }
}

export async function getUserGames(uid, legacyGamesData = []) {
  let gamesSnapshot;
  try {
    gamesSnapshot = await getDocs(collection(db, 'users', uid, 'games'));
  } catch (error) {
    // Durante a atualização das regras, usuários ainda no formato antigo devem
    // continuar conseguindo entrar e acessar os dados do documento principal.
    if (error?.code === 'permission-denied' && Array.isArray(legacyGamesData)) {
      return legacyGamesData;
    }
    throw error;
  }
  if (gamesSnapshot.empty) return Array.isArray(legacyGamesData) ? legacyGamesData : [];

  return gamesSnapshot.docs
    .map(gameDoc => gameDoc.data())
    .sort((a, b) => (a._storageOrder ?? 0) - (b._storageOrder ?? 0))
    .map(({ _storageOrder, ...game }) => game);
}

// ── Quando migrar para Java, defina a URL base aqui ───────────────────────
// const BASE_URL = 'https://api.seubackend.com';

// ─────────────────────────────────────────────────────────────────────────────
// USUÁRIO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Busca os dados do usuário no Firestore.
 * Java: GET /api/users/{uid}
 */
export async function getUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  const gamesData = await getUserGames(uid, data.gamesData);
  return { ...data, gamesData };
}

/**
 * Cria o documento inicial do usuário.
 * Java: POST /api/users
 */
export async function createUserData(uid, initialData) {
  await setDoc(doc(db, 'users', uid), initialData);
}

/**
 * Salva todos os dados do usuário (games, achievements, history, avatar).
 * Java: PUT /api/users/{uid}
 */
export async function saveUserData(uid, { gamesData, achievements, gameHistory, photoBase64, photoURL }) {
  const persist = async () => {
    const cleanGames = JSON.parse(JSON.stringify(gamesData));
    const gamesCollection = collection(db, 'users', uid, 'games');
    const publicProfileRef = doc(db, 'publicProfiles', uid);
    const [existingGames, publicProfile] = await Promise.all([
      getDocs(gamesCollection),
      getDoc(publicProfileRef),
    ]);
    const nextDocumentIds = new Set();
    const operations = [];

    cleanGames.forEach((game, index) => {
      const documentId = gameDocumentId(game, index);
      nextDocumentIds.add(documentId);
      const gameRef = doc(gamesCollection, documentId);
      operations.push(batch => batch.set(gameRef, { ...game, _storageOrder: index }));
    });

    existingGames.docs.forEach(gameDoc => {
      if (!nextDocumentIds.has(gameDoc.id)) {
        operations.push(batch => batch.delete(gameDoc.ref));
      }
    });

    const userRef = doc(db, 'users', uid);
    operations.push(batch => batch.set(userRef, {
      gamesData: deleteField(),
      achievements,
      gameHistory: JSON.parse(JSON.stringify(gameHistory)),
      photoBase64: photoBase64 || null,
      updatedAt: serverTimestamp(),
    }, { merge: true }));

    if (publicProfile.exists()) {
      const publicUpdates = {
        gamesData: toPublicGames(cleanGames),
        updatedAt: serverTimestamp(),
      };
      const avatar = photoBase64 || photoURL;
      if (avatar) {
        publicUpdates.photoURL = avatar;
      }
      operations.push(batch => batch.set(publicProfileRef, publicUpdates, { merge: true }));
    }

    await commitOperations(operations);
  };

  const previousSave = saveQueues.get(uid) || Promise.resolve();
  const nextSave = previousSave.catch(() => undefined).then(persist);
  saveQueues.set(uid, nextSave);

  try {
    await nextSave;
  } finally {
    if (saveQueues.get(uid) === nextSave) saveQueues.delete(uid);
  }
}

/**
 * Atualiza apenas o avatar do usuário e sincroniza com o perfil público se existir.
 * Java: PATCH /api/users/{uid}/avatar
 */
export async function updateUserAvatar(uid, photoBase64) {
  await updateDoc(doc(db, 'users', uid), { photoBase64 });
  try {
    const publicProfileRef = doc(db, 'publicProfiles', uid);
    const publicSnap = await getDoc(publicProfileRef);
    if (publicSnap.exists()) {
      await setDoc(publicProfileRef, {
        photoURL: photoBase64 || '',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Não foi possível sincronizar avatar com publicProfile:', err);
  }
}

/**
 * Sincroniza explicitamente o perfil público com os dados e avatar atuais.
 */
export async function syncPublicProfile(uid, user, gamesData) {
  const publicProfileRef = doc(db, 'publicProfiles', uid);
  const snap = await getDoc(publicProfileRef);
  if (!snap.exists()) return false;

  const currentData = snap.data();
  const photoURL = user?.photoBase64 || user?.photoURL || currentData.photoURL || '';
  await setDoc(publicProfileRef, {
    photoURL,
    gamesData: toPublicGames(gamesData),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFIL PÚBLICO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Busca perfil público por username.
 * Java: GET /api/profiles?username={username}
 */
export async function getPublicProfile(username) {
  const q    = query(collection(db, 'publicProfiles'), where('username', '==', username));
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const profile = snap.docs[0].data();
  const gamesData = Array.isArray(profile.gamesData) ? profile.gamesData : [];
  return { profile, gamesData };
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICAÇÕES PUSH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Salva a subscription de push do usuário.
 * Java: POST /api/push-subscriptions
 */
export async function savePushSubscription(uid, subscription) {
  await setDoc(doc(db, 'pushSubs', uid), { subscription: JSON.stringify(subscription) });
}
