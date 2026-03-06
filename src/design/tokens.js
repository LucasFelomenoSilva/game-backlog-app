// src/design/tokens.js
// Sistema de Design Unificado — Tema Roxo/Violeta

export const T = {
  // ── Cores Base ──────────────────────────────────────────────────────────────
  bg:       '#09060f',           // fundo ultra-dark com toque roxo
  bgMid:    '#0e0a19',           // fundo secundário
  surface:  '#130e22',           // superfície elevada
  surface2: '#1a1330',           // superfície alternativa
  border:   'rgba(139,92,246,0.18)',
  border2:  'rgba(139,92,246,0.08)',

  // ── Roxo Principal ──────────────────────────────────────────────────────────
  violet:   '#8b5cf6',           // violeta base
  violet2:  '#7c3aed',           // violeta escuro
  violet3:  '#a78bfa',           // violeta claro (texto accent)
  indigo:   '#6366f1',           // índigo complementar
  pink:     '#ec4899',           // rosa para gradientes

  // ── Gradientes ──────────────────────────────────────────────────────────────
  grad:     'linear-gradient(135deg, #8b5cf6, #6366f1)',
  gradHot:  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  gradCool: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  gradGlow: 'rgba(139,92,246,0.35)',
  gradFaint:'rgba(139,92,246,0.08)',

  // ── Texto ──────────────────────────────────────────────────────────────────
  text:     '#f5f0ff',           // branco com toque violeta
  textMid:  'rgba(245,240,255,0.65)',
  textLow:  'rgba(245,240,255,0.30)',

  // ── Status / Semântico ─────────────────────────────────────────────────────
  green:    '#10b981',
  greenBg:  'rgba(16,185,129,0.12)',
  red:      '#f43f5e',
  redBg:    'rgba(244,63,94,0.12)',
  yellow:   '#f59e0b',
  yellowBg: 'rgba(245,158,11,0.12)',
  blue:     '#3b82f6',
  blueBg:   'rgba(59,130,246,0.12)',

  // ── Categorias (padronizadas roxo) ─────────────────────────────────────────
  categories: {
    playing:   { from: '#8b5cf6', to: '#6366f1', emoji: '🎮' },
    installed: { from: '#7c3aed', to: '#4f46e5', emoji: '💾' },
    backlog:   { from: '#a855f7', to: '#8b5cf6', emoji: '⏳' },
    zerados:   { from: '#10b981', to: '#059669', emoji: '✅' },
    desejados: { from: '#f59e0b', to: '#d97706', emoji: '🌟' },
  },
};

// Tailwind classes padronizadas (para usar onde tokens JS não se aplicam)
export const TW = {
  bg:        'bg-[#09060f]',
  surface:   'bg-[#130e22]',
  surface2:  'bg-[#1a1330]',
  border:    'border-purple-500/20',
  grad:      'from-violet-500 to-indigo-600',
  gradHot:   'from-violet-500 to-pink-600',
  text:      'text-purple-50',
  textMid:   'text-purple-200/60',
  textLow:   'text-purple-300/30',
  accent:    'text-violet-400',
  accentBg:  'bg-violet-500/10',
  glow:      'shadow-violet-500/30',
};