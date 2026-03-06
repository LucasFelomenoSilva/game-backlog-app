// src/components/WeeklyMissions.jsx — Sistema de missões semanais
import React, { useState, useEffect, useMemo } from 'react';
import { Target, Zap, CheckCircle, Lock, Trophy, Star, Clock, X, Gamepad2, Flame } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

function getMondayKey() {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().split('T')[0];
}

function generateMissions(seed) {
  const pool = [
    { id: 'finish_one', icon: '✅', title: 'Primeira Vitória', desc: 'Marque 1 jogo como zerado esta semana', xp: 150, type: 'finish', target: 1 },
    { id: 'finish_two', icon: '🏆', title: 'Dupla Eliminação', desc: 'Zere 2 jogos esta semana', xp: 300, type: 'finish', target: 2 },
    { id: 'rate_game', icon: '⭐', title: 'Crítico da Semana', desc: 'Avalie 1 jogo com nota', xp: 100, type: 'rate', target: 1 },
    { id: 'add_game', icon: '➕', title: 'Colecionador', desc: 'Adicione 3 jogos à coleção', xp: 120, type: 'add', target: 3 },
    { id: 'platinum', icon: '💎', title: 'Caçador de Platina', desc: 'Consiga uma platina esta semana', xp: 400, type: 'platinum', target: 1 },
    { id: 'play_rpg', icon: '⚔️', title: 'Amante de RPG', desc: 'Zere um jogo do gênero RPG', xp: 200, type: 'genre', genre: 'RPG', target: 1 },
    { id: 'play_action', icon: '💥', title: 'Herói de Ação', desc: 'Zere um jogo do gênero Ação', xp: 200, type: 'genre', genre: 'Ação', target: 1 },
    { id: 'wishlist', icon: '🌟', title: 'Sonhador', desc: 'Adicione 2 jogos à lista de desejos', xp: 80, type: 'wishlist', target: 2 },
    { id: 'long_game', icon: '🕰️', title: 'Maratonista', desc: 'Zere um jogo com 30h+ de duração', xp: 350, type: 'long', target: 1 },
    { id: 'review', icon: '📝', title: 'Jornalista Gamer', desc: 'Escreva uma review de um jogo', xp: 180, type: 'review', target: 1 },
  ];
  // Seleciona 3 missões baseadas no seed da semana
  const rng = seed.split('-').reduce((a, b) => a + parseInt(b), 0);
  const shuffled = [...pool].sort((a, b) => ((rng * (pool.indexOf(a) + 1)) % 10) - ((rng * (pool.indexOf(b) + 1)) % 10));
  return shuffled.slice(0, 3);
}

function computeProgress(mission, gamesData, weeklyChanges) {
  const weekStart = new Date(getMondayKey() + 'T00:00:00');
  const weekGames = gamesData.filter(g => {
    if (!g.finishedDate) return false;
    return new Date(g.finishedDate) >= weekStart;
  });
  const weekZerados = gamesData.filter(g => g.status === 'zerados' && g.finishedDate && new Date(g.finishedDate) >= weekStart);

  switch (mission.type) {
    case 'finish': return Math.min(weekZerados.length, mission.target);
    case 'rate': return Math.min(weekZerados.filter(g => g.rating > 0).length, mission.target);
    case 'platinum': return Math.min(weekZerados.filter(g => g.isPlatinum).length, mission.target);
    case 'genre': return Math.min(weekZerados.filter(g => g.genre === mission.genre).length, mission.target);
    case 'long': return Math.min(weekZerados.filter(g => (parseInt(g.timeToBeat) || 0) >= 30).length, mission.target);
    case 'review': return Math.min(weekZerados.filter(g => g.reviewText?.trim()).length, mission.target);
    case 'add': return Math.min(weeklyChanges?.added || 0, mission.target);
    case 'wishlist': return Math.min(weeklyChanges?.wishlisted || 0, mission.target);
    default: return 0;
  }
}

export default function WeeklyMissions({ gamesData, onClose }) {
  const { theme: V } = useTheme();
  const weekKey = getMondayKey();
  const missions = useMemo(() => generateMissions(weekKey), [weekKey]);

  const [claimedXP, setClaimedXP] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`missions_claimed_${weekKey}`) || '[]'); } catch { return []; }
  });

  const [weeklyChanges] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`missions_changes_${weekKey}`) || '{"added":0,"wishlisted":0}'); } catch { return { added: 0, wishlisted: 0 }; }
  });

  const totalXP = useMemo(() => missions.filter(m => claimedXP.includes(m.id)).reduce((s, m) => s + m.xp, 0), [claimedXP, missions]);

  const claimMission = (mission, progress) => {
    if (progress < mission.target || claimedXP.includes(mission.id)) return;
    const newClaimed = [...claimedXP, mission.id];
    setClaimedXP(newClaimed);
    localStorage.setItem(`missions_claimed_${weekKey}`, JSON.stringify(newClaimed));
    toast.success(`+${mission.xp} XP conquistado! ${mission.icon}`, {
      style: { background: V.card, color: V.text, border: `1px solid ${V.border}` },
      duration: 4000,
    });
  };

  // Dias restantes da semana
  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const daysLeft = 8 - dayOfWeek;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(16px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl" style={{ background: V.card, border: `1px solid ${V.border}`, boxShadow: `0 0 60px ${V.glow}` }}>

        {/* Header */}
        <div className="px-6 py-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${V.card2}, ${V.bg})`, borderBottom: `1px solid ${V.border}` }}>
          <div className="absolute inset-0 opacity-5" style={{ background: V.grad }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: V.grad, boxShadow: `0 4px 16px ${V.glow}` }}>
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black" style={{ color: V.text }}>Missões da Semana</h2>
                <p className="text-xs" style={{ color: V.muted }}>Renova em {daysLeft} dia{daysLeft !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-lg font-black" style={{ color: V.primary }}>{totalXP} XP</p>
                <p className="text-[10px]" style={{ color: V.low }}>esta semana</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: V.faint, border: `1px solid ${V.border}` }}>
                <X className="w-4 h-4" style={{ color: V.muted }} />
              </button>
            </div>
          </div>
        </div>

        {/* Missions */}
        <div className="p-5 space-y-4">
          {missions.map((mission, i) => {
            const progress = computeProgress(mission, gamesData, weeklyChanges);
            const completed = progress >= mission.target;
            const claimed = claimedXP.includes(mission.id);
            const pct = Math.min((progress / mission.target) * 100, 100);

            return (
              <div key={mission.id} className="rounded-2xl p-4 transition-all" style={{
                background: claimed ? `${V.primary}12` : completed ? `${V.primary}08` : V.faint,
                border: `1px solid ${claimed ? V.primary : completed ? `${V.primary}40` : V.border}`,
                boxShadow: claimed ? `0 0 20px ${V.glow}` : 'none',
              }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{mission.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-black" style={{ color: claimed ? V.soft : V.text }}>{mission.title}</p>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0" style={{ background: claimed ? `${V.primary}25` : V.card, color: claimed ? V.primary : V.muted, border: `1px solid ${V.border}` }}>
                        <Zap className="w-2.5 h-2.5" />+{mission.xp}
                      </span>
                    </div>
                    <p className="text-xs mb-3" style={{ color: V.muted }}>{mission.desc}</p>

                    {/* Barra de progresso */}
                    <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: V.card }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: claimed ? V.grad : completed ? `linear-gradient(to right, #10b981, #34d399)` : V.grad }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: V.low }}>{progress}/{mission.target}</span>
                      {completed && !claimed && (
                        <button onClick={() => claimMission(mission, progress)}
                          className="text-xs font-black px-3 py-1 rounded-full text-white animate-pulse"
                          style={{ background: V.grad }}>
                          Resgatar! ✨
                        </button>
                      )}
                      {claimed && (
                        <span className="text-xs font-black flex items-center gap-1" style={{ color: '#10b981' }}>
                          <CheckCircle className="w-3 h-3" /> Resgatado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <div className="p-3 rounded-2xl flex items-center gap-3" style={{ background: V.faint, border: `1px solid ${V.border}` }}>
            <Flame className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} />
            <p className="text-xs" style={{ color: V.muted }}>
              Missões renovam toda segunda-feira. Complete todas para bônus de XP!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}