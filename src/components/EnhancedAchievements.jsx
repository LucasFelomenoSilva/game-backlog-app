// src/components/EnhancedAchievements.jsx
import React, { useMemo } from 'react';
import {
  Trophy, Star, Crown, CheckCircle, Lock, Gamepad, List, Zap,
  Target, Flame, Clock, Heart, Award, Shield, Rocket, Ghost,
  Swords, Brain, Sparkles, TrendingUp, BookOpen, Medal,
  ChevronUp, Package
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // <-- Importado

export function computeAchievements(gamesData = []) {
  const zerados = gamesData.filter(g => g.status === 'zerados');
  const playing = gamesData.filter(g => g.status === 'playing');
  const backlog = gamesData.filter(g => g.status === 'backlog');
  const installed = gamesData.filter(g => g.status === 'installed');
  const desired = gamesData.filter(g => g.status === 'desejados');
  const totalGames = gamesData.length;
  const rated = zerados.filter(g => g.rating > 0);
  const avgRating = rated.length > 0 ? rated.reduce((s, g) => s + parseFloat(g.rating), 0) / rated.length : 0;
  const genreCounts = {};
  zerados.forEach(g => { if (g.genre) genreCounts[g.genre] = (genreCounts[g.genre] || 0) + 1; });
  const maxGenreCount = Math.max(0, ...Object.values(genreCounts));
  const platformCounts = {};
  zerados.forEach(g => {
    if (g.platform) g.platform.split(' | ').forEach(p => { if (p.trim()) platformCounts[p.trim()] = (platformCounts[p.trim()] || 0) + 1; });
  });
  const platformsUsed = Object.keys(platformCounts).length;
  const platinas = zerados.filter(g => g.isPlatinum).length;
  const perfect10 = zerados.filter(g => parseInt(g.rating) === 10).length;
  const totalHours = zerados.reduce((s, g) => s + (parseInt(g.timeToBeat) || 0), 0);
  const lowRated = zerados.filter(g => g.rating > 0 && parseInt(g.rating) <= 4).length;
  const rpgCount = zerados.filter(g => g.genre === 'RPG').length;
  const actionCount = zerados.filter(g => g.genre === 'Ação').length;
  const fpsCount = zerados.filter(g => g.genre === 'FPS').length;
  const queueCount = backlog.length + installed.length;

  return { zeradosCount: zerados.length, totalGames, playing, backlog, installed, desired, avgRating, maxGenreCount, platformsUsed, platinas, perfect10, totalHours, lowRated, rpgCount, actionCount, fpsCount, queueCount, zerados, rated };
}

const ACHIEVEMENTS = [
  { id: 'first_game', tier: 'bronze', title: 'Primeira Vitória', description: 'Marque o seu primeiro jogo como zerado.', icon: CheckCircle, check: (d) => d.zeradosCount >= 1, points: 100 },
  { id: 'first_backlog', tier: 'bronze', title: 'Começo de Coleção', description: 'Adicione 5 jogos ao seu backlog.', icon: List, check: (d) => d.totalGames >= 5, points: 50 },
  { id: 'first_review', tier: 'bronze', title: 'Crítico Iniciante', description: 'Avalie seu primeiro jogo com uma nota.', icon: Star, check: (d) => d.rated.length >= 1, points: 75 },
  { id: 'five_games', tier: 'silver', title: 'Colecionador Nível 1', description: 'Zere 5 jogos no total.', icon: Crown, check: (d) => d.zeradosCount >= 5, points: 300 },
  { id: 'ten_games', tier: 'silver', title: 'Veterano', description: 'Zere 10 jogos no total.', icon: Medal, check: (d) => d.zeradosCount >= 10, points: 500 },
  { id: 'twenty_five_games', tier: 'gold', title: 'Caçador de Finais', description: 'Zere 25 jogos no total.', icon: Trophy, check: (d) => d.zeradosCount >= 25, points: 1000 },
  { id: 'fifty_games', tier: 'platinum', title: 'Lendário', description: 'Zere 50 jogos. Uma lenda viva.', icon: Sparkles, check: (d) => d.zeradosCount >= 50, points: 2500 },
  { id: 'full_backlog', tier: 'silver', title: 'Backlog Cheio', description: 'Tenha 15 ou mais jogos listados.', icon: Package, check: (d) => d.totalGames >= 15, points: 150 },
  { id: 'wishlist_10', tier: 'bronze', title: 'Sonhador', description: 'Adicione 10 jogos à lista de desejos.', icon: Heart, check: (d) => d.desired.length >= 10, points: 100 },
  { id: 'queue_buster', tier: 'gold', title: 'Destruidor de Filas', description: 'Tenha 20+ jogos entre backlog e instalados.', icon: BookOpen, check: (d) => d.queueCount >= 20, points: 250 },
  { id: 'multi_platform', tier: 'silver', title: 'Gamer Multiplataforma', description: 'Zere jogos em 3 plataformas diferentes.', icon: Rocket, check: (d) => d.platformsUsed >= 3, points: 400 },
  { id: 'first_platinum', tier: 'gold', title: 'Completista', description: 'Consiga sua primeira platina.', icon: Trophy, check: (d) => d.platinas >= 1, points: 500 },
  { id: 'five_platinums', tier: 'platinum', title: 'Caçador de Platinas', description: 'Consiga 5 platinas.', icon: Award, check: (d) => d.platinas >= 5, points: 2000 },
  { id: 'ten_platinums', tier: 'platinum', title: 'Mestre do 100%', description: 'Consiga 10 platinas. Absolutamente insano.', icon: Crown, check: (d) => d.platinas >= 10, points: 5000 },
  { id: 'perfect_score', tier: 'gold', title: 'Obra-Prima', description: 'Dê nota 10 para um jogo.', icon: Star, check: (d) => d.perfect10 >= 1, points: 300 },
  { id: 'three_perfect', tier: 'gold', title: 'Crítico Exigente', description: 'Dê nota 10 para 3 jogos.', icon: Sparkles, check: (d) => d.perfect10 >= 3, points: 600 },
  { id: 'average_8', tier: 'gold', title: 'Bom Gosto', description: 'Mantenha nota média ≥ 8 com 5+ jogos avaliados.', icon: TrendingUp, check: (d) => d.rated.length >= 5 && d.avgRating >= 8, points: 500 },
  { id: 'honest_critic', tier: 'silver', title: 'Crítico Honesto', description: 'Dê uma nota ≤ 4 para um jogo.', icon: Ghost, check: (d) => d.lowRated >= 1, points: 150 },
  { id: 'rpg_master', tier: 'silver', title: 'Mestre dos RPGs', description: 'Zere 3 jogos do gênero RPG.', icon: Swords, check: (d) => d.rpgCount >= 3, points: 300 },
  { id: 'action_hero', tier: 'silver', title: 'Herói de Ação', description: 'Zere 3 jogos do gênero Ação.', icon: Flame, check: (d) => d.actionCount >= 3, points: 250 },
  { id: 'fps_soldier', tier: 'silver', title: 'Soldado FPS', description: 'Zere 3 jogos do gênero FPS.', icon: Target, check: (d) => d.fpsCount >= 3, points: 250 },
  { id: 'genre_master', tier: 'gold', title: 'Especialista de Gênero', description: 'Zere 5 jogos do mesmo gênero.', icon: Brain, check: (d) => d.maxGenreCount >= 5, points: 600 },
  { id: 'fifty_hours', tier: 'bronze', title: 'Dedicado', description: 'Acumule 50 horas nos jogos zerados.', icon: Clock, check: (d) => d.totalHours >= 50, points: 200 },
  { id: 'two_hundred_hours', tier: 'silver', title: 'Maratonista', description: 'Acumule 200 horas nos jogos zerados.', icon: Zap, check: (d) => d.totalHours >= 200, points: 600 },
  { id: 'five_hundred_hours', tier: 'gold', title: 'No-Lifer', description: 'Acumule 500 horas nos jogos zerados.', icon: Shield, check: (d) => d.totalHours >= 500, points: 1500 },
  { id: 'one_thousand_hours', tier: 'platinum', title: 'O Escolhido', description: 'Acumule 1000 horas. Você é diferente.', icon: ChevronUp, check: (d) => d.totalHours >= 1000, points: 3000 },
];

const TIER_CONFIG = {
  bronze:   { label: 'Bronze',   color: '#d97706', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.3)' },
  silver:   { label: 'Prata',    color: '#cbd5e1', bg: 'rgba(203,213,225,0.1)', border: 'rgba(203,213,225,0.3)' },
  gold:     { label: 'Ouro',     color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.3)' },
  platinum: { label: 'Platina',  color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)' },
};

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum'];

function AchievementCard({ achievement, isUnlocked, V }) {
  const Icon = achievement.icon;
  const tierCfg = TIER_CONFIG[achievement.tier];

  return (
    <div className="group relative">
      {isUnlocked && (
        <div className="absolute -inset-0.5 rounded-2xl blur opacity-25 group-hover:opacity-45 transition duration-300" 
             style={{ background: `linear-gradient(to right, ${V.primary}, ${V.secondary})` }} />
      )}

      <div className={`relative rounded-2xl p-4 border transition-all duration-300 ${isUnlocked ? 'hover:scale-[1.01]' : 'opacity-55'}`}
           style={{ background: `${V.card}e6`, borderColor: isUnlocked ? `${V.border}80` : `${V.border}4d` }}>
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isUnlocked ? 'shadow-lg' : ''}`}
                 style={{ background: isUnlocked ? `linear-gradient(to bottom right, ${V.primary}, ${V.secondary})` : V.faint }}>
              <Icon className={`w-7 h-7`} style={{ color: isUnlocked ? '#fff' : V.muted }} />
            </div>
            {isUnlocked && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2" style={{ borderColor: V.bg }}>
                <CheckCircle className="w-3.5 h-3.5" style={{ color: V.primary }} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-sm" style={{ color: isUnlocked ? V.text : V.muted }}>{achievement.title}</h3>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border" style={{ background: tierCfg.bg, color: tierCfg.color, borderColor: tierCfg.border }}>{tierCfg.label}</span>
            </div>
            <p className="text-xs leading-relaxed mb-2" style={{ color: isUnlocked ? V.muted : V.low }}>{achievement.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {isUnlocked ? (
                <>
                  <div className="px-2 py-0.5 rounded-full flex items-center gap-1 border" style={{ background: 'rgba(250,204,21,0.1)', borderColor: 'rgba(250,204,21,0.2)' }}>
                    <Zap className="w-2.5 h-2.5" style={{ color: '#facc15' }} />
                    <span className="text-[10px] font-bold" style={{ color: '#facc15' }}>+{achievement.points} XP</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-full flex items-center gap-1 border" style={{ background: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.2)' }}>
                    <CheckCircle className="w-2.5 h-2.5" style={{ color: '#4ade80' }} />
                    <span className="text-[10px] font-bold" style={{ color: '#4ade80' }}>Desbloqueada</span>
                  </div>
                </>
              ) : (
                <div className="px-2 py-0.5 rounded-full flex items-center gap-1 border" style={{ background: V.faint, borderColor: V.border }}>
                  <Lock className="w-2.5 h-2.5" style={{ color: V.muted }} />
                  <span className="text-[10px] font-semibold" style={{ color: V.muted }}>Bloqueada</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnhancedAchievements({ achievements = [], gamesData = [] }) {
  const { theme: V } = useTheme(); // <-- Usando as cores do tema
  const derived = useMemo(() => computeAchievements(gamesData), [gamesData]);
  const unlockedSet = useMemo(() => {
    const set = new Set(achievements);
    ACHIEVEMENTS.forEach(ach => { if (ach.check && ach.check(derived)) set.add(ach.id); });
    return set;
  }, [achievements, derived]);

  const unlockedCount = unlockedSet.size;
  const totalPoints = ACHIEVEMENTS.filter(a => unlockedSet.has(a.id)).reduce((s, a) => s + a.points, 0);
  const byTier = useMemo(() => TIER_ORDER.map(tier => ({ tier, cfg: TIER_CONFIG[tier], items: ACHIEVEMENTS.filter(a => a.tier === tier) })), []);

  return (
    <div className="min-h-screen pb-24 pt-6" style={{ background: V.bg }}>
      <div className="max-w-md mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl shadow-lg" style={{ background: `linear-gradient(to bottom right, #eab308, #f97316)`, boxShadow: `0 4px 14px rgba(234,179,8,0.3)` }}>
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: V.text }}>Conquistas</h1>
              <p className="text-sm" style={{ color: V.muted }}>Desbloqueie todas as {ACHIEVEMENTS.length} conquistas</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" style={{ background: `linear-gradient(to right, #eab308, #f97316)` }} />
            <div className="relative rounded-2xl p-4 border" style={{ background: `${V.card}e6`, borderColor: V.border }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg" style={{ background: `linear-gradient(to bottom right, #eab308, #f97316)` }}>
                  <Trophy className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: V.muted }}>Desbloqueadas</span>
              </div>
              <div className="text-3xl font-bold" style={{ color: '#facc15' }}>
                {unlockedCount}<span className="text-xl" style={{ color: V.low }}>/{ACHIEVEMENTS.length}</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" style={{ background: `linear-gradient(to right, ${V.primary}, ${V.secondary})` }} />
            <div className="relative rounded-2xl p-4 border" style={{ background: `${V.card}e6`, borderColor: V.border }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg" style={{ background: `linear-gradient(to bottom right, ${V.primary}, ${V.secondary})` }}>
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: V.muted }}>Total XP</span>
              </div>
              <div className="text-3xl font-bold" style={{ color: V.primary }}>
                {totalPoints.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="relative group mb-6">
          <div className="absolute -inset-0.5 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300" style={{ background: `linear-gradient(to right, ${V.accent}, ${V.primary})` }} />
          <div className="relative rounded-2xl p-4 border" style={{ background: `${V.card}e6`, borderColor: V.border }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: V.accent }} />
                <span className="text-sm font-semibold" style={{ color: V.muted }}>Progresso Geral</span>
              </div>
              <span className="text-xl font-bold" style={{ color: V.primary }}>
                {Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden border" style={{ background: V.faint, borderColor: V.border }}>
              <div className="h-full transition-all duration-700 relative" style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`, background: `linear-gradient(to right, ${V.primary}, ${V.accent})` }}>
                <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)' }} />
              </div>
            </div>
            {unlockedCount === ACHIEVEMENTS.length ? (
              <p className="text-center text-xs mt-2 font-bold" style={{ color: '#facc15' }}>🎉 Todas as conquistas desbloqueadas!</p>
            ) : (
              <p className="text-center text-xs mt-2" style={{ color: V.low }}>Faltam {ACHIEVEMENTS.length - unlockedCount} conquistas</p>
            )}
          </div>
        </div>

        {byTier.map(({ tier, cfg, items }) => {
          const unlockedInTier = items.filter(a => unlockedSet.has(a.id)).length;
          return (
            <div key={tier} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5`} style={{ background: cfg.bg, borderColor: cfg.border }}>
                  <Medal className={`w-3.5 h-3.5`} style={{ color: cfg.color }} />
                  <span className={`text-xs font-black uppercase tracking-wider`} style={{ color: cfg.color }}>{cfg.label}</span>
                </div>
                <span className="text-xs" style={{ color: V.muted }}>{unlockedInTier}/{items.length}</span>
                <div className="flex-1 h-px" style={{ background: V.border }} />
              </div>
              <div className="space-y-2">
                {items.map(ach => (
                  <AchievementCard key={ach.id} achievement={ach} isUnlocked={unlockedSet.has(ach.id)} V={V} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}