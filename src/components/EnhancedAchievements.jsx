// src/components/EnhancedAchievements.jsx
import React, { useMemo } from 'react';
import {
  Trophy, Star, Crown, CheckCircle, Lock, Gamepad, List, Zap,
  Target, Flame, Clock, Heart, Award, Shield, Rocket, Ghost,
  Swords, Brain, Sparkles, TrendingUp, BookOpen, Medal,
  ChevronUp, Package
} from 'lucide-react';

// ── Definição de todas as conquistas ──────────────────────────────────────────
// Cada conquista tem:
//   id, title, description, icon, color, points, tier, check(gamesData)
// O campo `check` recebe os dados e retorna true se desbloqueada automaticamente.
// Para conquistas que dependem de dados históricos e são salvas manualmente, `check` pode ser null.

export function computeAchievements(gamesData = []) {
  const zerados = gamesData.filter(g => g.status === 'zerados');
  const playing = gamesData.filter(g => g.status === 'playing');
  const backlog = gamesData.filter(g => g.status === 'backlog');
  const installed = gamesData.filter(g => g.status === 'installed');
  const desired = gamesData.filter(g => g.status === 'desejados');
  const totalGames = gamesData.length;
  const rated = zerados.filter(g => g.rating > 0);
  const avgRating = rated.length > 0
    ? rated.reduce((s, g) => s + parseFloat(g.rating), 0) / rated.length
    : 0;

  // Contagem por gênero
  const genreCounts = {};
  zerados.forEach(g => { if (g.genre) genreCounts[g.genre] = (genreCounts[g.genre] || 0) + 1; });
  const maxGenreCount = Math.max(0, ...Object.values(genreCounts));

  // Contagem por plataforma
  const platformCounts = {};
  zerados.forEach(g => {
    if (g.platform) {
      g.platform.split(' | ').forEach(p => {
        if (p.trim()) platformCounts[p.trim()] = (platformCounts[p.trim()] || 0) + 1;
      });
    }
  });
  const platformsUsed = Object.keys(platformCounts).length;

  // Platinas
  const platinas = zerados.filter(g => g.isPlatinum).length;

  // Notas 10
  const perfect10 = zerados.filter(g => parseInt(g.rating) === 10).length;

  // Total de horas
  const totalHours = zerados.reduce((s, g) => s + (parseInt(g.timeToBeat) || 0), 0);

  // Jogos com notas baixas (≤4)
  const lowRated = zerados.filter(g => g.rating > 0 && parseInt(g.rating) <= 4).length;

  // RPGs zerados
  const rpgCount = zerados.filter(g => g.genre === 'RPG').length;

  // Ação zerados
  const actionCount = zerados.filter(g => g.genre === 'Ação').length;

  // FPS zerados
  const fpsCount = zerados.filter(g => g.genre === 'FPS').length;

  // Total na fila (backlog + installed)
  const queueCount = backlog.length + installed.length;

  return {
    zeradosCount: zerados.length,
    totalGames,
    playing,
    backlog,
    installed,
    desired,
    avgRating,
    maxGenreCount,
    platformsUsed,
    platinas,
    perfect10,
    totalHours,
    lowRated,
    rpgCount,
    actionCount,
    fpsCount,
    queueCount,
    zerados,
    rated,
  };
}

const ACHIEVEMENTS = [
  // ── INICIANTE ──────────────────────────────────────────────────────────────
  {
    id: 'first_game',
    tier: 'bronze',
    title: 'Primeira Vitória',
    description: 'Marque o seu primeiro jogo como zerado.',
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-500',
    points: 100,
    check: (d) => d.zeradosCount >= 1,
  },
  {
    id: 'first_backlog',
    tier: 'bronze',
    title: 'Começo de Coleção',
    description: 'Adicione 5 jogos ao seu backlog.',
    icon: List,
    color: 'from-blue-500 to-cyan-500',
    points: 50,
    check: (d) => d.totalGames >= 5,
  },
  {
    id: 'first_review',
    tier: 'bronze',
    title: 'Crítico Iniciante',
    description: 'Avalie seu primeiro jogo com uma nota.',
    icon: Star,
    color: 'from-yellow-500 to-amber-500',
    points: 75,
    check: (d) => d.rated.length >= 1,
  },

  // ── PROGRESSO ──────────────────────────────────────────────────────────────
  {
    id: 'five_games',
    tier: 'silver',
    title: 'Colecionador Nível 1',
    description: 'Zere 5 jogos no total.',
    icon: Crown,
    color: 'from-yellow-500 to-orange-500',
    points: 300,
    check: (d) => d.zeradosCount >= 5,
  },
  {
    id: 'ten_games',
    tier: 'silver',
    title: 'Veterano',
    description: 'Zere 10 jogos no total.',
    icon: Medal,
    color: 'from-cyan-500 to-blue-500',
    points: 500,
    check: (d) => d.zeradosCount >= 10,
  },
  {
    id: 'twenty_five_games',
    tier: 'gold',
    title: 'Caçador de Finais',
    description: 'Zere 25 jogos no total.',
    icon: Trophy,
    color: 'from-orange-500 to-red-500',
    points: 1000,
    check: (d) => d.zeradosCount >= 25,
  },
  {
    id: 'fifty_games',
    tier: 'platinum',
    title: 'Lendário',
    description: 'Zere 50 jogos. Uma lenda viva.',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    points: 2500,
    check: (d) => d.zeradosCount >= 50,
  },

  // ── COLEÇÃO ────────────────────────────────────────────────────────────────
  {
    id: 'full_backlog',
    tier: 'silver',
    title: 'Backlog Cheio',
    description: 'Tenha 15 ou mais jogos listados.',
    icon: Package,
    color: 'from-indigo-500 to-blue-500',
    points: 150,
    check: (d) => d.totalGames >= 15,
  },
  {
    id: 'wishlist_10',
    tier: 'bronze',
    title: 'Sonhador',
    description: 'Adicione 10 jogos à lista de desejos.',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    points: 100,
    check: (d) => d.desired.length >= 10,
  },
  {
    id: 'queue_buster',
    tier: 'gold',
    title: 'Destruidor de Filas',
    description: 'Tenha 20+ jogos entre backlog e instalados.',
    icon: BookOpen,
    color: 'from-purple-600 to-violet-600',
    points: 250,
    check: (d) => d.queueCount >= 20,
  },
  {
    id: 'multi_platform',
    tier: 'silver',
    title: 'Gamer Multiplataforma',
    description: 'Zere jogos em 3 plataformas diferentes.',
    icon: Rocket,
    color: 'from-blue-500 to-indigo-500',
    points: 400,
    check: (d) => d.platformsUsed >= 3,
  },

  // ── PLATINAS ───────────────────────────────────────────────────────────────
  {
    id: 'first_platinum',
    tier: 'gold',
    title: 'Completista',
    description: 'Consiga sua primeira platina.',
    icon: Trophy,
    color: 'from-yellow-400 to-yellow-600',
    points: 500,
    check: (d) => d.platinas >= 1,
  },
  {
    id: 'five_platinums',
    tier: 'platinum',
    title: 'Caçador de Platinas',
    description: 'Consiga 5 platinas.',
    icon: Award,
    color: 'from-amber-400 to-yellow-500',
    points: 2000,
    check: (d) => d.platinas >= 5,
  },
  {
    id: 'ten_platinums',
    tier: 'platinum',
    title: 'Mestre do 100%',
    description: 'Consiga 10 platinas. Absolutamente insano.',
    icon: Crown,
    color: 'from-yellow-300 to-orange-400',
    points: 5000,
    check: (d) => d.platinas >= 10,
  },

  // ── AVALIADOR ──────────────────────────────────────────────────────────────
  {
    id: 'perfect_score',
    tier: 'gold',
    title: 'Obra-Prima',
    description: 'Dê nota 10 para um jogo.',
    icon: Star,
    color: 'from-yellow-500 to-amber-400',
    points: 300,
    check: (d) => d.perfect10 >= 1,
  },
  {
    id: 'three_perfect',
    tier: 'gold',
    title: 'Crítico Exigente',
    description: 'Dê nota 10 para 3 jogos.',
    icon: Sparkles,
    color: 'from-orange-400 to-yellow-400',
    points: 600,
    check: (d) => d.perfect10 >= 3,
  },
  {
    id: 'average_8',
    tier: 'gold',
    title: 'Bom Gosto',
    description: 'Mantenha nota média ≥ 8 com 5+ jogos avaliados.',
    icon: TrendingUp,
    color: 'from-emerald-500 to-green-400',
    points: 500,
    check: (d) => d.rated.length >= 5 && d.avgRating >= 8,
  },
  {
    id: 'honest_critic',
    tier: 'silver',
    title: 'Crítico Honesto',
    description: 'Dê uma nota ≤ 4 para um jogo (honestidade é virtude).',
    icon: Ghost,
    color: 'from-gray-500 to-slate-500',
    points: 150,
    check: (d) => d.lowRated >= 1,
  },

  // ── GÊNEROS ────────────────────────────────────────────────────────────────
  {
    id: 'rpg_master',
    tier: 'silver',
    title: 'Mestre dos RPGs',
    description: 'Zere 3 jogos do gênero RPG.',
    icon: Swords,
    color: 'from-purple-500 to-pink-500',
    points: 300,
    check: (d) => d.rpgCount >= 3,
  },
  {
    id: 'action_hero',
    tier: 'silver',
    title: 'Herói de Ação',
    description: 'Zere 3 jogos do gênero Ação.',
    icon: Flame,
    color: 'from-orange-500 to-red-500',
    points: 250,
    check: (d) => d.actionCount >= 3,
  },
  {
    id: 'fps_soldier',
    tier: 'silver',
    title: 'Soldado FPS',
    description: 'Zere 3 jogos do gênero FPS.',
    icon: Target,
    color: 'from-green-600 to-emerald-500',
    points: 250,
    check: (d) => d.fpsCount >= 3,
  },
  {
    id: 'genre_master',
    tier: 'gold',
    title: 'Especialista de Gênero',
    description: 'Zere 5 jogos do mesmo gênero.',
    icon: Brain,
    color: 'from-violet-500 to-purple-500',
    points: 600,
    check: (d) => d.maxGenreCount >= 5,
  },

  // ── HORAS ──────────────────────────────────────────────────────────────────
  {
    id: 'fifty_hours',
    tier: 'bronze',
    title: 'Dedicado',
    description: 'Acumule 50 horas nos jogos zerados.',
    icon: Clock,
    color: 'from-blue-400 to-cyan-400',
    points: 200,
    check: (d) => d.totalHours >= 50,
  },
  {
    id: 'two_hundred_hours',
    tier: 'silver',
    title: 'Maratonista',
    description: 'Acumule 200 horas nos jogos zerados.',
    icon: Zap,
    color: 'from-cyan-500 to-blue-500',
    points: 600,
    check: (d) => d.totalHours >= 200,
  },
  {
    id: 'five_hundred_hours',
    tier: 'gold',
    title: 'No-Lifer (orgulhoso)',
    description: 'Acumule 500 horas nos jogos zerados.',
    icon: Shield,
    color: 'from-indigo-500 to-violet-500',
    points: 1500,
    check: (d) => d.totalHours >= 500,
  },
  {
    id: 'one_thousand_hours',
    tier: 'platinum',
    title: 'O Escolhido',
    description: 'Acumule 1000 horas. Você é diferente.',
    icon: ChevronUp,
    color: 'from-violet-400 to-purple-400',
    points: 3000,
    check: (d) => d.totalHours >= 1000,
  },
];

// ── Helpers de tier ──────────────────────────────────────────────────────────
const TIER_CONFIG = {
  bronze:   { label: 'Bronze',   color: 'text-amber-600',   bg: 'bg-amber-600/10',   border: 'border-amber-600/30' },
  silver:   { label: 'Prata',    color: 'text-gray-300',    bg: 'bg-gray-400/10',    border: 'border-gray-400/30' },
  gold:     { label: 'Ouro',     color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30' },
  platinum: { label: 'Platina',  color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30' },
};

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum'];

// ── Componente Card ───────────────────────────────────────────────────────────
function AchievementCard({ achievement, isUnlocked }) {
  const Icon = achievement.icon;
  const tierCfg = TIER_CONFIG[achievement.tier];

  return (
    <div className="group relative">
      {isUnlocked && (
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${achievement.color} rounded-2xl blur opacity-25 group-hover:opacity-45 transition duration-300`} />
      )}

      <div className={`relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-4 border transition-all duration-300 ${
        isUnlocked
          ? 'border-white/15 hover:border-white/25 hover:scale-[1.01]'
          : 'border-gray-800/50 opacity-55'
      }`}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="relative flex-shrink-0">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isUnlocked
                ? `bg-gradient-to-br ${achievement.color} shadow-lg`
                : 'bg-gray-800/50'
            }`}>
              <Icon className={`w-7 h-7 ${isUnlocked ? 'text-white' : 'text-gray-600'}`} />
            </div>
            {isUnlocked && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-white/90 to-white/70 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-gray-900" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                {achievement.title}
              </h3>
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${tierCfg.bg} ${tierCfg.color} ${tierCfg.border} border`}>
                {tierCfg.label}
              </span>
            </div>
            <p className={`text-xs leading-relaxed mb-2 ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
              {achievement.description}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {isUnlocked ? (
                <>
                  <div className="px-2 py-0.5 bg-yellow-500/10 rounded-full flex items-center gap-1 border border-yellow-500/20">
                    <Zap className="w-2.5 h-2.5 text-yellow-400" />
                    <span className="text-[10px] font-bold text-yellow-400">+{achievement.points} XP</span>
                  </div>
                  <div className="px-2 py-0.5 bg-green-500/10 rounded-full flex items-center gap-1 border border-green-500/20">
                    <CheckCircle className="w-2.5 h-2.5 text-green-400" />
                    <span className="text-[10px] font-bold text-green-400">Desbloqueada</span>
                  </div>
                </>
              ) : (
                <div className="px-2 py-0.5 bg-gray-800/50 rounded-full flex items-center gap-1 border border-gray-700/50">
                  <Lock className="w-2.5 h-2.5 text-gray-600" />
                  <span className="text-[10px] font-semibold text-gray-600">Bloqueada</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function EnhancedAchievements({ achievements = [], gamesData = [] }) {
  // Calcula conquistas dinamicamente a partir dos dados
  const derived = useMemo(() => computeAchievements(gamesData), [gamesData]);

  // Merge: conquistas salvas manualmente + conquistas calculadas
  const unlockedSet = useMemo(() => {
    const set = new Set(achievements); // conquistas salvas
    ACHIEVEMENTS.forEach(ach => {
      if (ach.check && ach.check(derived)) set.add(ach.id);
    });
    return set;
  }, [achievements, derived]);

  const unlockedCount = unlockedSet.size;
  const totalPoints = ACHIEVEMENTS
    .filter(a => unlockedSet.has(a.id))
    .reduce((s, a) => s + a.points, 0);

  // Agrupa por tier
  const byTier = useMemo(() => {
    return TIER_ORDER.map(tier => ({
      tier,
      cfg: TIER_CONFIG[tier],
      items: ACHIEVEMENTS.filter(a => a.tier === tier),
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white pb-24 pt-6">
      <div className="max-w-md mx-auto px-4">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg shadow-yellow-500/30">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Conquistas
              </h1>
              <p className="text-gray-400 text-sm">Desbloqueie todas as {ACHIEVEMENTS.length} conquistas</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                  <Trophy className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">Desbloqueadas</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {unlockedCount}<span className="text-xl text-gray-500">/{ACHIEVEMENTS.length}</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">Total XP</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {totalPoints.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative group mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300" />
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-gray-300">Progresso Geral</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-700 relative"
                style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
            {unlockedCount === ACHIEVEMENTS.length ? (
              <p className="text-center text-xs text-yellow-400 mt-2 font-bold">🎉 Todas as conquistas desbloqueadas!</p>
            ) : (
              <p className="text-center text-xs text-gray-500 mt-2">
                Faltam {ACHIEVEMENTS.length - unlockedCount} conquistas
              </p>
            )}
          </div>
        </div>

        {/* Conquistas por Tier */}
        {byTier.map(({ tier, cfg, items }) => {
          const unlockedInTier = items.filter(a => unlockedSet.has(a.id)).length;
          return (
            <div key={tier} className="mb-6">
              {/* Tier header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`px-3 py-1 rounded-full border ${cfg.bg} ${cfg.border} flex items-center gap-1.5`}>
                  <Medal className={`w-3.5 h-3.5 ${cfg.color}`} />
                  <span className={`text-xs font-black uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                </div>
                <span className="text-xs text-gray-600">{unlockedInTier}/{items.length}</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              <div className="space-y-2">
                {items.map(ach => (
                  <AchievementCard
                    key={ach.id}
                    achievement={ach}
                    isUnlocked={unlockedSet.has(ach.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}