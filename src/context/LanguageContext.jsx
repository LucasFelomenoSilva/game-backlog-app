// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const LanguageContext = createContext(null);

export const TRANSLATIONS = {
  'pt-BR': {
    // Navigation / Tabs
    'tab.backlog': 'Backlog',
    'tab.stats': 'Stats',
    'tab.social': 'Social',
    'tab.trophies': 'Troféus',
    'tab.profile': 'Perfil',

    // Main Columns / Categories
    'col.playing': 'Jogando agora',
    'col.backlog': 'Na Fila',
    'col.installed': 'Instalados',
    'col.completed': 'Zerados',
    'col.wishlist': 'Lista de Desejos',
    'col.dropped': 'Abandonados',
    'col.paused': 'Pausados',

    // Settings
    'settings.title': 'Configurações',
    'settings.subtitle': 'Personalize sua experiência',
    'settings.theme': 'Tema de Cores',
    'settings.language': 'Idioma',
    'settings.lang_pt': 'Português (Brasil)',
    'settings.lang_en': 'English',
    'settings.preview': 'Preview',
    'settings.preview_desc': 'Assim vai ficar o seu app',
    'settings.apply_theme': 'Aplicar Tema',

    // Profile & Public Profile
    'profile.my_profile': 'Meu perfil',
    'profile.back': 'Voltar',
    'profile.edit': 'Editar perfil',
    'profile.save_changes': 'Salvar Alterações',
    'profile.logout': 'Sair',
    'profile.public_title': 'Perfil Público',
    'profile.public_subtitle': 'Compartilhe seu backlog',
    'profile.your_username': 'Seu username',
    'profile.copy_link': 'Copiar link',
    'profile.copied': 'Copiado!',
    'profile.view_widget': 'Ver widget',
    'profile.auto_saved': 'Salvo automaticamente',
    'profile.saving': 'Salvando...',
    'profile.username_short': 'Username muito curto (mín. 3 chars)',
    'profile.username_taken': 'Esse username já está em uso.',
    'profile.stats_completed': 'Zerados',
    'profile.stats_platinums': 'Platinas',
    'profile.stats_avg_rating': 'Nota média',
    'profile.stats_hours': 'Horas jogadas',
    'profile.stats_completion': 'Taxa de conclusão',
    'profile.favorites': 'Favoritos',
    'profile.badges': 'Conquistas',
    'profile.playing_now': 'Jogando agora',
    'profile.recent_completed': 'Últimos zerados',
    'profile.no_playing': 'Nenhum jogo em andamento no momento.',
    'profile.no_completed': 'Nenhum jogo concluído ainda.',
    'profile.not_found': 'Perfil não encontrado',
    'profile.not_found_desc': 'O usuário que você procura não existe ou alterou o nome.',
    'profile.create_backlog_cta': 'Crie seu Backlog também',
    'profile.level': 'Nível',

    // Common actions
    'action.save': 'Salvar',
    'action.cancel': 'Cancelar',
    'action.close': 'Fechar',
    'action.search': 'Buscar jogos...',
    'action.add_game': 'Adicionar Jogo',
    'action.filter': 'Filtrar',
  },
  'en': {
    // Navigation / Tabs
    'tab.backlog': 'Backlog',
    'tab.stats': 'Stats',
    'tab.social': 'Social',
    'tab.trophies': 'Trophies',
    'tab.profile': 'Profile',

    // Main Columns / Categories
    'col.playing': 'Playing now',
    'col.backlog': 'Backlog',
    'col.installed': 'Installed',
    'col.completed': 'Completed',
    'col.wishlist': 'Wishlist',
    'col.dropped': 'Dropped',
    'col.paused': 'Paused',

    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Customize your experience',
    'settings.theme': 'Color Theme',
    'settings.language': 'Language',
    'settings.lang_pt': 'Português (Brasil)',
    'settings.lang_en': 'English',
    'settings.preview': 'Preview',
    'settings.preview_desc': 'This is how your app will look',
    'settings.apply_theme': 'Apply Theme',

    // Profile & Public Profile
    'profile.my_profile': 'My Profile',
    'profile.back': 'Back',
    'profile.edit': 'Edit profile',
    'profile.save_changes': 'Save Changes',
    'profile.logout': 'Sign Out',
    'profile.public_title': 'Public Profile',
    'profile.public_subtitle': 'Share your backlog',
    'profile.your_username': 'Your username',
    'profile.copy_link': 'Copy link',
    'profile.copied': 'Copied!',
    'profile.view_widget': 'View widget',
    'profile.auto_saved': 'Saved automatically',
    'profile.saving': 'Saving...',
    'profile.username_short': 'Username too short (min. 3 chars)',
    'profile.username_taken': 'This username is already taken.',
    'profile.stats_completed': 'Completed',
    'profile.stats_platinums': 'Platinums',
    'profile.stats_avg_rating': 'Avg Rating',
    'profile.stats_hours': 'Hours played',
    'profile.stats_completion': 'Completion rate',
    'profile.favorites': 'Favorites',
    'profile.badges': 'Badges',
    'profile.playing_now': 'Playing now',
    'profile.recent_completed': 'Recently Completed',
    'profile.no_playing': 'No games in progress right now.',
    'profile.no_completed': 'No completed games yet.',
    'profile.not_found': 'Profile not found',
    'profile.not_found_desc': 'The user you are looking for does not exist or changed their name.',
    'profile.create_backlog_cta': 'Create your Backlog too',
    'profile.level': 'Level',

    // Common actions
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.close': 'Close',
    'action.search': 'Search games...',
    'action.add_game': 'Add Game',
    'action.filter': 'Filter',
  }
};

const STORAGE_KEY = 'xplog_language';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local === 'en' || local === 'pt-BR') return local;
    } catch {
      // ignore
    }
    return 'pt-BR';
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u?.uid) {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) {
            const userLang = snap.data()?.language;
            if (userLang && (userLang === 'pt-BR' || userLang === 'en')) {
              setLanguageState(userLang);
              try {
                localStorage.setItem(STORAGE_KEY, userLang);
              } catch {
                // ignore
              }
            }
          }
        } catch (err) {
          console.warn('Erro ao carregar preferência de idioma do Firestore:', err);
        }
      }
    });
    return () => unsub();
  }, []);

  const changeLanguage = useCallback(async (newLang) => {
    if (newLang !== 'pt-BR' && newLang !== 'en') return;
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }

    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      try {
        await updateDoc(doc(db, 'users', currentUid), {
          language: newLang,
        });
      } catch (err) {
        console.warn('Não foi possível salvar a preferência de idioma no Firestore:', err);
      }
    }
  }, []);

  const t = useCallback((key) => {
    return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS['pt-BR']?.[key] ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: 'pt-BR',
      setLanguage: () => {},
      t: (k) => TRANSLATIONS['pt-BR']?.[k] ?? k,
    };
  }
  return ctx;
}
