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
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs, serverTimestamp,
} from 'firebase/firestore';

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
  return snap.data();
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
export async function saveUserData(uid, { gamesData, achievements, gameHistory, photoBase64 }) {
  await setDoc(doc(db, 'users', uid), {
    gamesData: JSON.parse(JSON.stringify(gamesData)),
    achievements,
    gameHistory: JSON.parse(JSON.stringify(gameHistory)),
    photoBase64: photoBase64 || null,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Atualiza apenas o avatar do usuário.
 * Java: PATCH /api/users/{uid}/avatar
 */
export async function updateUserAvatar(uid, photoBase64) {
  await updateDoc(doc(db, 'users', uid), { photoBase64 });
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

  const profile  = snap.docs[0].data();
  const userDoc  = await getDoc(doc(db, 'users', profile.uid));
  const gamesData = userDoc.exists() ? (userDoc.data().gamesData || []) : [];

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
