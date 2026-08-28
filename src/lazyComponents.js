// src/lazyComponents.js
// Centraliza todos os lazy imports do projeto.
//
// COMO USAR NO App.jsx:
//   import { LazyWrappedScreen, LazyGameRecommender, ... } from './lazyComponents';
//   Envolva cada um com <Suspense fallback={<ModalLoader />}>
//
// GANHO DE BUNDLE ESTIMADO:
//   html2canvas (WrappedScreen + GameList) .............. ~830 KB
//   GameRecommender (lógica IA + listas) ............... ~45 KB
//   FriendsScreen (Firebase listeners pesados) ......... ~40 KB
//   ProgressScreen + EnhancedAchievements + recharts ... ~120 KB
//   Restante dos modais ................................ ~80 KB
//   Total estimado fora do bundle inicial .............. ~1.1 MB

import { lazy } from 'react';

// ── Modais / Overlays ────────────────────────────────────────────────────────
export const LazyWrappedScreen      = lazy(() => import('./components/WrappedScreen'));
export const LazyGameRecommender    = lazy(() => import('./components/GameRecommender'));
export const LazyBackupRestore      = lazy(() => import('./components/BackupRestore'));
export const LazyWeeklyMissions     = lazy(() => import('./components/WeeklyMissions'));
export const LazySurpriseMe         = lazy(() => import('./components/SurpriseMe'));
export const LazyCollabList         = lazy(() => import('./components/CollabList'));
export const LazyFriendCompare      = lazy(() => import('./components/FriendCompare'));
export const LazySettingsModal      = lazy(() => import('./components/SettingsModal'));
export const LazyLevelUpOverlay     = lazy(() => import('./components/LevelUpOverlay'));

// ── Telas de abas (carregam só quando o utilizador navega) ───────────────────
export const LazyProgressScreen     = lazy(() => import('./components/ProgressScreen'));
export const LazyProfileScreen      = lazy(() => import('./components/ProfileScreen'));
export const LazyEnhancedAchievements = lazy(() => import('./components/EnhancedAchievements'));
export const LazyFriendsScreen      = lazy(() => import('./components/FriendsScreen'));
