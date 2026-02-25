// src/services/socialService.js
import { db } from '../firebase';
import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, addDoc, onSnapshot,
  orderBy, serverTimestamp, arrayUnion, arrayRemove,
  deleteDoc
} from 'firebase/firestore';

// Gera um código único tipo Discord (ex: GAMER#4821)
export function generateUserCode() {
  const adjectives = ['NEON', 'PIXEL', 'CYBER', 'ULTRA', 'HYPER', 'TURBO', 'MEGA', 'EPIC', 'VOID', 'DARK'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}#${num}`;
}

// Inicializa o perfil social do usuário no Firestore
export async function initUserSocialProfile(uid, displayName, photoURL) {
  const socialRef = doc(db, 'socialProfiles', uid);
  const snap = await getDoc(socialRef);

  if (!snap.exists()) {
    const code = generateUserCode();
    await setDoc(socialRef, {
      uid,
      displayName,
      photoURL: photoURL || null,
      userCode: code,
      friends: [],       // array de UIDs
      friendRequests: [], // array de { fromUid, fromName, fromCode, fromPhoto }
      createdAt: serverTimestamp(),
    });
    return code;
  }
  return snap.data().userCode;
}

// Busca perfil social pelo código único
export async function findUserByCode(code) {
  const q = query(
    collection(db, 'socialProfiles'),
    where('userCode', '==', code.toUpperCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// Envia pedido de amizade
export async function sendFriendRequest(fromUser, toUid) {
  const toRef = doc(db, 'socialProfiles', toUid);
  await updateDoc(toRef, {
    friendRequests: arrayUnion({
      fromUid: fromUser.uid,
      fromName: fromUser.displayName,
      fromCode: fromUser.userCode,
      fromPhoto: fromUser.photoURL || null,
      sentAt: new Date().toISOString(),
    })
  });
}

// Aceita pedido de amizade
export async function acceptFriendRequest(myUid, fromUid) {
  const myRef = doc(db, 'socialProfiles', myUid);
  const theirRef = doc(db, 'socialProfiles', fromUid);

  const mySnap = await getDoc(myRef);
  const myData = mySnap.data();

  // Remove o request
  const updatedRequests = (myData.friendRequests || []).filter(r => r.fromUid !== fromUid);

  // Adiciona como amigo em ambos
  await updateDoc(myRef, {
    friends: arrayUnion(fromUid),
    friendRequests: updatedRequests,
  });
  await updateDoc(theirRef, {
    friends: arrayUnion(myUid),
  });
}

// Rejeita pedido de amizade
export async function rejectFriendRequest(myUid, fromUid) {
  const myRef = doc(db, 'socialProfiles', myUid);
  const mySnap = await getDoc(myRef);
  const myData = mySnap.data();
  const updatedRequests = (myData.friendRequests || []).filter(r => r.fromUid !== fromUid);
  await updateDoc(myRef, { friendRequests: updatedRequests });
}

// Remove amigo
export async function removeFriend(myUid, friendUid) {
  const myRef = doc(db, 'socialProfiles', myUid);
  const theirRef = doc(db, 'socialProfiles', friendUid);
  await updateDoc(myRef, { friends: arrayRemove(friendUid) });
  await updateDoc(theirRef, { friends: arrayRemove(myUid) });
}

// Busca perfil social por UID
export async function getSocialProfile(uid) {
  const ref = doc(db, 'socialProfiles', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

// Busca dados de jogo públicos do amigo (salvo em users/{uid}/gamesData)
export async function getFriendGamesData(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  return snap.data().gamesData || [];
}

// ---- CHAT ----

// Gera ID de conversa determinístico entre dois usuários
export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

// Envia mensagem
export async function sendMessage(chatId, senderUid, senderName, senderPhoto, text) {
  const chatRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(chatRef, {
    senderUid,
    senderName,
    senderPhoto: senderPhoto || null,
    text,
    createdAt: serverTimestamp(),
  });

  // Atualiza metadados da conversa
  const metaRef = doc(db, 'chats', chatId);
  await setDoc(metaRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    participants: [senderUid],
  }, { merge: true });
}

// Listener de mensagens em tempo real
export function subscribeToChat(chatId, callback) {
  const chatRef = collection(db, 'chats', chatId, 'messages');
  const q = query(chatRef, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(messages);
  });
}

// Listener do perfil social em tempo real
export function subscribeToSocialProfile(uid, callback) {
  const ref = doc(db, 'socialProfiles', uid);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}