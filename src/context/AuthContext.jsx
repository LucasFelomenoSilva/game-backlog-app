// src/context/AuthContext.jsx
// Responsabilidade: autenticação + expor dados iniciais do Firestore.
// Expõe: user, loading, loadingTip, firestoreData, signIn, signOut, updateAvatar

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { auth, db, googleProvider } from '../firebase';
import { initUserSocialProfile } from '../services/socialService';
import { getUserData, updateUserAvatar } from '../services/gameService';

const AuthContext = createContext(null);

const LOADING_TIPS = [
  'Carregando texturas...',
  'Spawnando NPCs...',
  'Is it dangerous to go alone? Take this app!',
  'Limpando o cartucho...',
  'Gerando mundos procedurais...',
  'A princesa está em outro castelo...',
  'Recarregando mana...',
  'Conectando ao servidor social...',
];

export function AuthProvider({ children }) {
  const [user,          setUser]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [firestoreData, setFirestoreData] = useState(null);
  const [loadingTip]                      = useState(
    () => LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          let data = await getUserData(currentUser.uid);
          if (!data) {
            const initialData = { gamesData: [], achievements: [], gameHistory: [] };
            await setDoc(userDocRef, initialData);
            data = initialData;
          }

          setFirestoreData(data);
          setUser({
            ...currentUser,
            photoBase64: data.photoBase64 || null,
            favorites:   data.favorites   || [],
          });

          initUserSocialProfile(currentUser.uid, currentUser.displayName, currentUser.photoURL);
        } else {
          setUser(null);
          setFirestoreData(null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setUser(null);
        setFirestoreData(null);
        toast.error('Não foi possível carregar seus dados do Firestore.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Player 1 Connected!');
    } catch {
      toast.error('Erro ao conectar controle (Login).');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Player 1 Disconnected.');
    } catch {
      toast.error('Erro ao fazer logout.');
    }
  }, []);

  const updateAvatar = useCallback(async (file) => {
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 200, useWebWorker: true });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setUser(prev => ({ ...prev, photoBase64: base64 }));
        if (user) {
          await updateUserAvatar(user.uid, base64);
          toast.success('Avatar atualizado!');
        }
      };
      reader.readAsDataURL(compressed);
    } catch {
      toast.error('Erro ao atualizar avatar.');
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, loadingTip, firestoreData, signIn, signOut, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
