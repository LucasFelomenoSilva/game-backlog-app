import { readFileSync } from 'node:fs';
import { after, beforeEach, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const [host = '127.0.0.1', port = '8080'] = String(
  process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080',
).split(':');

const testEnv = await initializeTestEnvironment({
  projectId: 'demo-xplog-rules',
  firestore: {
    host,
    port: Number(port),
    rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'),
  },
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

async function seed(path, data) {
  await testEnv.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), path), data);
  });
}

test('dados privados pertencem somente ao próprio usuário', async () => {
  const ownerDb = testEnv.authenticatedContext('user-a').firestore();
  const otherDb = testEnv.authenticatedContext('user-b').firestore();
  const guestDb = testEnv.unauthenticatedContext().firestore();

  await assertSucceeds(setDoc(doc(ownerDb, 'users/user-a'), { gamesData: [] }));
  await assertSucceeds(setDoc(doc(ownerDb, 'users/user-a/games/game-1'), { nome: 'Zelda' }));
  await assertFails(getDoc(doc(otherDb, 'users/user-a')));
  await assertFails(getDoc(doc(guestDb, 'users/user-a')));
  await assertFails(setDoc(doc(otherDb, 'users/user-a/games/game-2'), { nome: 'Mario' }));
});

test('perfil público é legível por visitantes e gravável apenas pelo dono', async () => {
  const ownerDb = testEnv.authenticatedContext('user-a').firestore();
  const otherDb = testEnv.authenticatedContext('user-b').firestore();
  const guestDb = testEnv.unauthenticatedContext().firestore();
  const profile = {
    username: 'player_one',
    displayName: 'Player One',
    photoURL: '',
    level: 1,
    uid: 'user-a',
    gamesData: [],
    updatedAt: serverTimestamp(),
  };

  await assertSucceeds(setDoc(doc(ownerDb, 'publicProfiles/user-a'), profile));
  await assertSucceeds(getDoc(doc(guestDb, 'publicProfiles/user-a')));
  await assertFails(updateDoc(doc(otherDb, 'publicProfiles/user-a'), { displayName: 'Invadido' }));
});

test('pedido de amizade só pode identificar o usuário autenticado', async () => {
  await seed('socialProfiles/user-a', {
    uid: 'user-a',
    displayName: 'A',
    userCode: 'PLAYER#0001',
    friends: [],
    friendRequests: [],
  });
  await seed('socialProfiles/user-b', {
    uid: 'user-b',
    displayName: 'B',
    userCode: 'PLAYER#0002',
    friends: [],
    friendRequests: [],
  });

  const userADb = testEnv.authenticatedContext('user-a').firestore();
  const target = doc(userADb, 'socialProfiles/user-b');
  await assertSucceeds(updateDoc(target, {
    friendRequests: [{ fromUid: 'user-a', fromName: 'A' }],
  }));

  await seed('socialProfiles/user-b', {
    uid: 'user-b',
    displayName: 'B',
    userCode: 'PLAYER#0002',
    friends: [],
    friendRequests: [],
  });
  await assertFails(updateDoc(target, {
    friendRequests: [{ fromUid: 'user-c', fromName: 'C' }],
  }));
});

test('chat é restrito aos participantes', async () => {
  const userADb = testEnv.authenticatedContext('user-a').firestore();
  const userBDb = testEnv.authenticatedContext('user-b').firestore();
  const outsiderDb = testEnv.authenticatedContext('user-c').firestore();
  const chatData = {
    participants: ['user-a', 'user-b'],
    lastMessage: 'Oi',
    lastMessageAt: serverTimestamp(),
  };

  await assertSucceeds(setDoc(doc(userADb, 'chats/user-a_user-b'), chatData));
  await assertSucceeds(setDoc(doc(userBDb, 'chats/user-a_user-b/messages/message-1'), {
    senderUid: 'user-b',
    senderName: 'B',
    senderPhoto: null,
    text: 'Olá',
    createdAt: serverTimestamp(),
  }));
  await assertSucceeds(getDoc(doc(userADb, 'chats/user-a_user-b/messages/message-1')));
  await assertFails(getDoc(doc(outsiderDb, 'chats/user-a_user-b')));
  await assertFails(setDoc(doc(outsiderDb, 'chats/user-a_user-b/messages/message-2'), {
    senderUid: 'user-c',
    senderName: 'C',
    senderPhoto: null,
    text: 'Intrusão',
    createdAt: serverTimestamp(),
  }));

  // Participantes podem atualizar metadados de notificação e leitura
  await assertSucceeds(updateDoc(doc(userADb, 'chats/user-a_user-b'), {
    lastMessage: 'Tudo bem?',
    lastMessageAt: serverTimestamp(),
    lastSenderUid: 'user-a',
    recipientUid: 'user-b',
    unread: true,
  }));
  await assertSucceeds(updateDoc(doc(userBDb, 'chats/user-a_user-b'), {
    unread: false,
  }));
  await assertFails(updateDoc(doc(outsiderDb, 'chats/user-a_user-b'), {
    unread: false,
  }));

  // Participante pode ler mensagens de um chat novo mesmo antes de existir documento pai
  const emptyUserXDb = testEnv.authenticatedContext('user-x').firestore();
  const emptyOutsiderDb = testEnv.authenticatedContext('user-z').firestore();
  await assertSucceeds(getDoc(doc(emptyUserXDb, 'chats/user-x_user-y/messages/fake-msg')));
  await assertFails(getDoc(doc(emptyOutsiderDb, 'chats/user-x_user-y/messages/fake-msg')));

  const qOwner = query(collection(emptyUserXDb, 'chats/user-x_user-y/messages'));
  const qOutsider = query(collection(emptyOutsiderDb, 'chats/user-x_user-y/messages'));
  await assertSucceeds(getDocs(qOwner));
  await assertFails(getDocs(qOutsider));
});

test('lista colaborativa é restrita aos membros', async () => {
  await seed('collabLists/list-1', {
    name: 'Co-op',
    createdBy: 'user-a',
    members: ['user-a', 'user-b'],
    games: [],
  });

  const memberDb = testEnv.authenticatedContext('user-b').firestore();
  const outsiderDb = testEnv.authenticatedContext('user-c').firestore();
  await assertSucceeds(getDoc(doc(memberDb, 'collabLists/list-1')));
  await assertSucceeds(updateDoc(doc(memberDb, 'collabLists/list-1'), {
    games: [{ id: '1', name: 'It Takes Two', votes: [] }],
  }));
  await assertFails(getDoc(doc(outsiderDb, 'collabLists/list-1')));
  await assertFails(updateDoc(doc(outsiderDb, 'collabLists/list-1'), { games: [] }));
});
