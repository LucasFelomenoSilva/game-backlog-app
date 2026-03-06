// src/components/BacklogAge.jsx — Tempo no backlog e badges de vergonha
import React, { useMemo, useState } from 'react';
import { Clock, AlertTriangle, Skull, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function getAgeDays(game) {
  if (!game.addedAt) return 0;
  const added = new Date(game.addedAt?.toDate?.() || game.addedAt);
  return Math.floor((Date.now() - added.getTime()) / (1000 * 60 * 60 * 24));
}

function getShameBadge(days) {
  if (days < 30)  return null;
  if (days < 90)  return { label: 'Esquecido',  emoji: '😴', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  if (days < 180) return { label: 'Empoeirado', emoji: '🌿', color: '#84cc16', bg: 'rgba(132,204,22,0.12)' };
  if (days < 365) return { label: 'Abandonado', emoji: '👻', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' };
  return               { label: 'Fóssil',      emoji: '💀', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' };
}

function formatAge(days) {
  if (days < 7)   return `${days}d`;
  if (days < 30)  return `${Math.floor(days / 7)}sem`;
  if (days < 365) return `${Math.floor(days / 30)}m`;
  return `${(days / 365).toFixed(1)}a`;
}

export default function BacklogAge({ gamesData }) {
  const { theme: V } = useTheme();
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState('oldest'); // oldest | newest | name

  const backlogGames = useMemo(() => {
    return gamesData
      .filter(g => g.status !== 'zerados' && g.status !== 'lista_desejos')
      .map(g => ({ ...g, days: getAgeDays(g), badge: getShameBadge(getAgeDays(g)) }))
      .sort((a, b) => {
        if (sortBy === 'oldest') return b.days - a.days;
        if (sortBy === 'newest') return a.days - b.days;
        return a.nome?.localeCompare(b.nome || '');
      });
  }, [gamesData, sortBy]);

  const shameful = backlogGames.filter(g => g.badge);
  const displayed = showAll ? backlogGames : backlogGames.slice(0, 5);

  if (backlogGames.length === 0) return null;

  const avgDays = Math.floor(backlogGames.reduce((s, g) => s + g.days, 0) / backlogGames.length);

  return (
    <div className="rounded-3xl p-5" style={{ background: V.card, border: `1px solid ${V.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: V.primary }} />
          <p className="text-sm font-black" style={{ color: V.text }}>Tempo no Backlog</p>
        </div>
        <div className="flex items-center gap-2">
          {shameful.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}>
              <Skull className="w-3 h-3" /> {shameful.length} vergonhosos
            </span>
          )}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="text-[10px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer"
            style={{ background: V.faint, border: `1px solid ${V.border}`, color: V.muted }}>
            <option value="oldest">Mais antigos</option>
            <option value="newest">Mais novos</option>
            <option value="name">Nome</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'no backlog', value: backlogGames.length, color: V.primary },
          { label: 'tempo médio', value: formatAge(avgDays), color: V.accent },
          { label: 'vergonhosos', value: shameful.length, color: '#f43f5e' },
        ].map(s => (
          <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: V.faint, border: `1px solid ${V.border}` }}>
            <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px]" style={{ color: V.low }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {displayed.map(game => {
          const badge = game.badge;
          return (
            <div key={game.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
              style={{ background: badge ? badge.bg : V.faint, border: `1px solid ${badge ? `${badge.color}30` : V.border}` }}>
              {game.imageBase64
                ? <img src={game.imageBase64} className="w-8 h-10 rounded-lg object-cover flex-shrink-0" alt={game.nome} />
                : <div className="w-8 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: V.card }}><span className="text-xs">🎮</span></div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: V.text }}>{game.nome}</p>
                <p className="text-[9px]" style={{ color: V.muted }}>{game.platform}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {badge && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                    style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}40` }}>
                    {badge.emoji} {badge.label}
                  </span>
                )}
                <span className="text-[10px] font-black" style={{ color: badge ? badge.color : V.muted }}>
                  {formatAge(game.days)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {backlogGames.length > 5 && (
        <button onClick={() => setShowAll(s => !s)}
          className="w-full mt-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
          style={{ background: V.faint, border: `1px solid ${V.border}`, color: V.muted }}>
          {showAll ? <><ChevronUp className="w-3 h-3" /> Mostrar menos</> : <><ChevronDown className="w-3 h-3" /> Ver todos {backlogGames.length}</>}
        </button>
      )}
    </div>
  );
}