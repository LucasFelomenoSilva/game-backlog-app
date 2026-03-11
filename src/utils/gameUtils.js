// src/utils/gameUtils.js
// Funções utilitárias centralizadas — extraídas de:
// GameList, GameDetail, FriendProfileModal, FriendProfileScreen,
// GameTooltip, GlobalSearch, BacklogAge, NextGameSuggestion, ReviewGameModal

// ─────────────────────────────────────────────────────────────────────────────
// CORES E GRADIENTES DE RATING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classe Tailwind de gradiente para um rating.
 * Substitui getRatingColor em: GameDetail, FriendProfileModal, FriendProfileScreen
 */
export function getRatingGradient(rating) {
  if (rating >= 9) return 'from-emerald-500 to-teal-500';
  if (rating >= 7) return 'from-cyan-500 to-blue-500';
  if (rating >= 5) return 'from-yellow-500 to-orange-500';
  return 'from-red-500 to-pink-500';
}

/**
 * Cor hex para um rating.
 * Substitui getRatingHex em: GameList, GameTooltip, GlobalSearch
 */
export function getRatingHex(rating) {
  if (rating >= 9) return '#10b981';
  if (rating >= 7) return '#06b6d4';
  if (rating >= 5) return '#f59e0b';
  return '#ef4444';
}

/**
 * Label descritivo do rating.
 * Substitui getRatingLabel em: GameDetail
 */
export function getRatingLabel(rating) {
  if (rating >= 9) return 'Obra-prima';
  if (rating >= 7) return 'Muito bom';
  if (rating >= 5) return 'Razoável';
  return 'Decepcionante';
}

// ─────────────────────────────────────────────────────────────────────────────
// DURAÇÃO DE JOGO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Info completa de duração (label + classes Tailwind + cores CSS).
 * Substitui getGameLengthLabel em: GameDetail, NextGameSuggestion
 */
export function getGameLengthInfo(hours) {
  if (!hours || hours === 0) return null;
  if (hours <= 5)
    return { label: 'Rapidinho', tailwindColor: 'text-green-400', tailwindBar: 'bg-green-500', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)' };
  if (hours <= 15)
    return { label: 'Curto',     tailwindColor: 'text-blue-400',  tailwindBar: 'bg-blue-500',  color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.2)' };
  if (hours <= 40)
    return { label: 'Médio',     tailwindColor: 'text-purple-400',tailwindBar: 'bg-purple-500',color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' };
  return   { label: 'Épico',     tailwindColor: 'text-orange-400',tailwindBar: 'bg-orange-500',color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' };
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMATADORES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formata dias para exibição curta: 3d · 2sem · 4m · 1.2a
 * Substitui lógica inline em: BacklogAge
 */
export function formatAge(days) {
  if (days < 7)   return `${days}d`;
  if (days < 30)  return `${Math.floor(days / 7)}sem`;
  if (days < 365) return `${Math.floor(days / 30)}m`;
  return `${(days / 365).toFixed(1)}a`;
}

/**
 * Remove caracteres especiais e parênteses de um nome de categoria.
 * Substitui cleanCategoryName em: GameDetail, ReviewGameModal
 */
export function cleanCategoryName(name) {
  if (!name) return '';
  return name
    .replace(/\(.*?\)/g, '')
    .replace(/[^\w\u00C0-\u00FF\s]/g, '')
    .trim();
}