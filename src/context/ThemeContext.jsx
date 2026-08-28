// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  violet: {
    id: 'violet',
    name: 'Roxo',
    emoji: '💜',
    bg: '#09060f',
    card: '#130e22',
    card2: '#1a1330',
    border: 'rgba(139,92,246,0.18)',
    faint: 'rgba(139,92,246,0.08)',
    primary: '#8b5cf6',
    secondary: '#6366f1',
    accent: '#ec4899',
    soft: '#a78bfa',
    glow: 'rgba(139,92,246,0.35)',
    text: '#f5f0ff',
    muted: 'rgba(245,240,255,0.50)',
    low: 'rgba(245,240,255,0.22)',
    grad: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    gradHot: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    tw: { grad: 'from-violet-500 to-indigo-600', gradHot: 'from-violet-500 to-pink-600' },
  },
  cyan: {
    id: 'cyan',
    name: 'Azul',
    emoji: '🔵',
    bg: '#050d14',
    card: '#091622',
    card2: '#0e1f30',
    border: 'rgba(6,182,212,0.18)',
    faint: 'rgba(6,182,212,0.08)',
    primary: '#06b6d4',
    secondary: '#3b82f6',
    accent: '#8b5cf6',
    soft: '#67e8f9',
    glow: 'rgba(6,182,212,0.35)',
    text: '#f0fbff',
    muted: 'rgba(240,251,255,0.50)',
    low: 'rgba(240,251,255,0.22)',
    grad: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    gradHot: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    tw: { grad: 'from-cyan-500 to-blue-600', gradHot: 'from-cyan-500 to-violet-600' },
  },
  emerald: {
    id: 'emerald',
    name: 'Verde',
    emoji: '💚',
    bg: '#030d09',
    card: '#071a10',
    card2: '#0c2418',
    border: 'rgba(16,185,129,0.18)',
    faint: 'rgba(16,185,129,0.08)',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#06b6d4',
    soft: '#6ee7b7',
    glow: 'rgba(16,185,129,0.35)',
    text: '#f0fdf8',
    muted: 'rgba(240,253,248,0.50)',
    low: 'rgba(240,253,248,0.22)',
    grad: 'linear-gradient(135deg, #10b981, #059669)',
    gradHot: 'linear-gradient(135deg, #10b981, #06b6d4)',
    tw: { grad: 'from-emerald-500 to-green-600', gradHot: 'from-emerald-500 to-cyan-600' },
  },
  rose: {
    id: 'rose',
    name: 'Vermelho',
    emoji: '❤️',
    bg: '#0f0508',
    card: '#1e0a10',
    card2: '#2a0e17',
    border: 'rgba(244,63,94,0.18)',
    faint: 'rgba(244,63,94,0.08)',
    primary: '#f43f5e',
    secondary: '#e11d48',
    accent: '#fb923c',
    soft: '#fda4af',
    glow: 'rgba(244,63,94,0.35)',
    text: '#fff1f3',
    muted: 'rgba(255,241,243,0.50)',
    low: 'rgba(255,241,243,0.22)',
    grad: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    gradHot: 'linear-gradient(135deg, #f43f5e, #fb923c)',
    tw: { grad: 'from-rose-500 to-red-600', gradHot: 'from-rose-500 to-orange-500' },
  },
  amber: {
    id: 'amber',
    name: 'Laranja',
    emoji: '🟠',
    bg: '#0f0900',
    card: '#1e1400',
    card2: '#2a1c00',
    border: 'rgba(245,158,11,0.18)',
    faint: 'rgba(245,158,11,0.08)',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#ef4444',
    soft: '#fcd34d',
    glow: 'rgba(245,158,11,0.35)',
    text: '#fffbf0',
    muted: 'rgba(255,251,240,0.50)',
    low: 'rgba(255,251,240,0.22)',
    grad: 'linear-gradient(135deg, #f59e0b, #d97706)',
    gradHot: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    tw: { grad: 'from-amber-500 to-orange-600', gradHot: 'from-amber-500 to-red-500' },
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    try { return localStorage.getItem('gamebacklog_theme') || 'violet'; } catch { return 'violet'; }
  });

  const theme = THEMES[themeId] || THEMES.violet;

  const setTheme = (id) => {
    setThemeId(id);
    try { localStorage.setItem('gamebacklog_theme', id); }
    catch (error) { console.warn('Não foi possível salvar o tema localmente.', error); }
  };

  // Aplica variáveis CSS no root
  useEffect(() => {
  const r = document.documentElement;
  r.style.setProperty('--color-primary', theme.primary);
  r.style.setProperty('--color-secondary', theme.secondary);
  r.style.setProperty('--color-bg', theme.bg);
  r.style.setProperty('--color-glow', theme.glow);
  r.style.setProperty('--color-card', theme.card);
  r.style.setProperty('--color-card-2', theme.card2);
  r.style.setProperty('--color-border', theme.border);
  r.style.setProperty('--color-faint', theme.faint);
  r.style.setProperty('--color-text', theme.text);
  r.style.setProperty('--color-muted', theme.muted);
  r.style.setProperty('--color-low', theme.low);
  r.style.setProperty('--color-soft', theme.soft);

  // Adicione esta linha:
  document.body.style.backgroundColor = theme.bg;
}, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
