// src/shared/services/gameService.js
//
// Camada de serviço — abstrai TODAS as operações de dados.
// Para migrar para Java Spring Boot: troque cada função por fetch() para a API REST.
// Os componentes importam daqui e NUNCA sabem qual backend está sendo usado.
//
// ── MAPEAMENTO FIREBASE → JAVA ─────────────────────────────────────────────
//  getUserData(uid)              → GET  /api/users/me
//  createUserData(uid, data)     → POST /api/users
//  saveUserData(uid, data)       → PUT  /api/users/me
//  updateUserAvatar(uid, base64) → PATCH /api/users/me/avatar
//  getPublicProfile(username)    → GET  /api/profiles/{username}
//  savePushSubscription(uid, sub)→ POST /api/push-subscriptions

import { db } from '../../firebase';
import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs,
} from 'firebase/firestore';

// ── Para migrar para Java, descomente e use: ──────────────────────────────
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ── USUÁRIO ────────────────────────────────────────────────────────────────

export async function getUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function createUserData(uid, initialData) {
  await setDoc(doc(db, 'users', uid), initialData);
}

export async function saveUserData(uid, { gamesData, achievements, gameHistory, photoBase64 }) {
  await updateDoc(doc(db, 'users', uid), {
    gamesData:    JSON.parse(JSON.stringify(gamesData)),
    achievements,
    gameHistory:  JSON.parse(JSON.stringify(gameHistory)),
    photoBase64:  photoBase64 || null,
  });
}

export async function updateUserAvatar(uid, photoBase64) {
  await updateDoc(doc(db, 'users', uid), { photoBase64 });
}

// ── PERFIL PÚBLICO ─────────────────────────────────────────────────────────

export async function getPublicProfile(username) {
  const q    = query(collection(db, 'publicProfiles'), where('username', '==', username));
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const profile  = snap.docs[0].data();
  const userDoc  = await getDoc(doc(db, 'users', profile.uid));
  const gamesData = userDoc.exists() ? (userDoc.data().gamesData || []) : [];

  return { profile, gamesData };
}

// ── NOTIFICAÇÕES PUSH ──────────────────────────────────────────────────────

export async function savePushSubscription(uid, subscription) {
  await setDoc(doc(db, 'pushSubs', uid), { subscription: JSON.stringify(subscription) });
}
