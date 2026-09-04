import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Award, BookOpen, Brain, CheckCircle2, ChevronUp, Clock3, Crown,
  Flame, Ghost, Heart, List, Lock, Medal, Package, Rocket,
  Shield, Sparkles, Star, Swords, Target, TrendingUp, Trophy, Zap,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export function computeAchievements(gamesData = []) {
  const zerados = gamesData.filter(game => game.status === 'zerados');
  const backlog = gamesData.filter(game => game.status === 'backlog');
  const installed = gamesData.filter(game => game.status === 'installed');
  const desired = gamesData.filter(game => game.status === 'desejados');
  const rated = zerados.filter(game => Number(game.rating) > 0);
  const genreCounts = {};
  const platformCounts = {};
  zerados.forEach(game => {
    if (game.genre) genreCounts[game.genre] = (genreCounts[game.genre] || 0) + 1;
    game.platform?.split(' | ').forEach(platform => {
      const name = platform.trim();
      if (name) platformCounts[name] = (platformCounts[name] || 0) + 1;
    });
  });
  return {
    zeradosCount: zerados.length,
    totalGames: gamesData.length,
    desired,
    rated,
    avgRating: rated.length ? rated.reduce((sum, game) => sum + Number(game.rating), 0) / rated.length : 0,
    maxGenreCount: Math.max(0, ...Object.values(genreCounts)),
    platformsUsed: Object.keys(platformCounts).length,
    platinas: zerados.filter(game => game.isPlatinum).length,
    perfect10: zerados.filter(game => Number(game.rating) === 10).length,
    totalHours: zerados.reduce((sum, game) => sum + (Number(game.timeToBeat) || 0), 0),
    lowRated: zerados.filter(game => Number(game.rating) > 0 && Number(game.rating) <= 4).length,
    rpgCount: zerados.filter(game => game.genre === 'RPG').length,
    actionCount: zerados.filter(game => game.genre === 'Ação').length,
    fpsCount: zerados.filter(game => game.genre === 'FPS').length,
    queueCount: backlog.length + installed.length,
  };
}

const ACHIEVEMENTS = [
  { id: 'first_game', tier: 'bronze', title: 'Primeira Vitória', description: 'Marque o seu primeiro jogo como zerado.', icon: CheckCircle2, check: data => data.zeradosCount >= 1, points: 100 },
  { id: 'first_backlog', tier: 'bronze', title: 'Começo de Coleção', description: 'Adicione 5 jogos à sua coleção.', icon: List, check: data => data.totalGames >= 5, points: 50 },
  { id: 'first_review', tier: 'bronze', title: 'Crítico Iniciante', description: 'Avalie seu primeiro jogo com uma nota.', icon: Star, check: data => data.rated.length >= 1, points: 75 },
  { id: 'five_games', tier: 'silver', title: 'Colecionador Nível 1', description: 'Zere 5 jogos no total.', icon: Crown, check: data => data.zeradosCount >= 5, points: 300 },
  { id: 'ten_games', tier: 'silver', title: 'Veterano', description: 'Zere 10 jogos no total.', icon: Medal, check: data => data.zeradosCount >= 10, points: 500 },
  { id: 'twenty_five_games', tier: 'gold', title: 'Caçador de Finais', description: 'Zere 25 jogos no total.', icon: Trophy, check: data => data.zeradosCount >= 25, points: 1000 },
  { id: 'fifty_games', tier: 'platinum', title: 'Lendário', description: 'Zere 50 jogos. Uma lenda viva.', icon: Sparkles, check: data => data.zeradosCount >= 50, points: 2500 },
  { id: 'full_backlog', tier: 'silver', title: 'Backlog Cheio', description: 'Tenha 15 ou mais jogos listados.', icon: Package, check: data => data.totalGames >= 15, points: 150 },
  { id: 'wishlist_10', tier: 'bronze', title: 'Sonhador', description: 'Adicione 10 jogos à lista de desejos.', icon: Heart, check: data => data.desired.length >= 10, points: 100 },
  { id: 'queue_buster', tier: 'gold', title: 'Destruidor de Filas', description: 'Tenha 20+ jogos entre backlog e instalados.', icon: BookOpen, check: data => data.queueCount >= 20, points: 250 },
  { id: 'multi_platform', tier: 'silver', title: 'Gamer Multiplataforma', description: 'Zere jogos em 3 plataformas diferentes.', icon: Rocket, check: data => data.platformsUsed >= 3, points: 400 },
  { id: 'first_platinum', tier: 'gold', title: 'Completista', description: 'Consiga sua primeira platina.', icon: Trophy, check: data => data.platinas >= 1, points: 500 },
  { id: 'five_platinums', tier: 'platinum', title: 'Caçador de Platinas', description: 'Consiga 5 platinas.', icon: Award, check: data => data.platinas >= 5, points: 2000 },
  { id: 'ten_platinums', tier: 'platinum', title: 'Mestre do 100%', description: 'Consiga 10 platinas.', icon: Crown, check: data => data.platinas >= 10, points: 5000 },
  { id: 'perfect_score', tier: 'gold', title: 'Obra-Prima', description: 'Dê nota 10 para um jogo.', icon: Star, check: data => data.perfect10 >= 1, points: 300 },
  { id: 'three_perfect', tier: 'gold', title: 'Crítico Exigente', description: 'Dê nota 10 para 3 jogos.', icon: Sparkles, check: data => data.perfect10 >= 3, points: 600 },
  { id: 'average_8', tier: 'gold', title: 'Bom Gosto', description: 'Mantenha nota média ≥ 8 com 5+ avaliações.', icon: TrendingUp, check: data => data.rated.length >= 5 && data.avgRating >= 8, points: 500 },
  { id: 'honest_critic', tier: 'silver', title: 'Crítico Honesto', description: 'Dê uma nota ≤ 4 para um jogo.', icon: Ghost, check: data => data.lowRated >= 1, points: 150 },
  { id: 'rpg_master', tier: 'silver', title: 'Mestre dos RPGs', description: 'Zere 3 jogos do gênero RPG.', icon: Swords, check: data => data.rpgCount >= 3, points: 300 },
  { id: 'action_hero', tier: 'silver', title: 'Herói de Ação', description: 'Zere 3 jogos do gênero Ação.', icon: Flame, check: data => data.actionCount >= 3, points: 250 },
  { id: 'fps_soldier', tier: 'silver', title: 'Soldado FPS', description: 'Zere 3 jogos do gênero FPS.', icon: Target, check: data => data.fpsCount >= 3, points: 250 },
  { id: 'genre_master', tier: 'gold', title: 'Especialista de Gênero', description: 'Zere 5 jogos do mesmo gênero.', icon: Brain, check: data => data.maxGenreCount >= 5, points: 600 },
  { id: 'fifty_hours', tier: 'bronze', title: 'Dedicado', description: 'Acumule 50 horas nos jogos zerados.', icon: Clock3, check: data => data.totalHours >= 50, points: 200 },
  { id: 'two_hundred_hours', tier: 'silver', title: 'Maratonista', description: 'Acumule 200 horas nos jogos zerados.', icon: Zap, check: data => data.totalHours >= 200, points: 600 },
  { id: 'five_hundred_hours', tier: 'gold', title: 'No-Lifer', description: 'Acumule 500 horas nos jogos zerados.', icon: Shield, check: data => data.totalHours >= 500, points: 1500 },
  { id: 'one_thousand_hours', tier: 'platinum', title: 'O Escolhido', description: 'Acumule 1000 horas de jornada.', icon: ChevronUp, check: data => data.totalHours >= 1000, points: 3000 },
];

const TIER_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

function AchievementCard({ achievement, unlocked, V, tierConfig }) {
  const { t } = useLanguage();
  const Icon = achievement.icon;
  const tier = tierConfig[achievement.tier];
  const title = t('ach.' + achievement.id + '.title') || achievement.title;
  const description = t('ach.' + achievement.id + '.desc') || achievement.description;

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
      whileHover={unlocked ? { y: -2 } : undefined}
      className="flex items-center gap-4 rounded-2xl border p-4"
      style={{ background: V.card, borderColor: unlocked ? tier.border : V.border, opacity: unlocked ? 1 : 0.52 }}
    >
      <div className="relative grid h-14 w-14 flex-shrink-0 place-items-center rounded-xl" style={{ background: unlocked ? tier.bg : V.faint, color: unlocked ? tier.color : V.muted }}>
        <Icon className="h-6 w-6" />
        <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full border-2" style={{ background: unlocked ? tier.color : V.card2, borderColor: V.card }}>
          {unlocked ? <CheckCircle2 className="h-3.5 w-3.5 text-black" /> : <Lock className="h-3 w-3" style={{ color: V.muted }} />}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-black" style={{ color: unlocked ? V.text : V.muted }}>{title}</h3>
          <span className="rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider" style={{ background: tier.bg, color: tier.color }}>{tier.label}</span>
        </div>
        <p className="mt-1 text-xs leading-5" style={{ color: unlocked ? V.muted : V.low }}>{description}</p>
        <p className="mt-1.5 text-[10px] font-black" style={{ color: unlocked ? '#facc15' : V.low }}>+{achievement.points} XP</p>
      </div>
    </motion.article>
  );
}

export default function EnhancedAchievements({ achievements = [], gamesData = [] }) {
  const { theme: V } = useTheme();
  const { t } = useLanguage();
  const derived = useMemo(() => computeAchievements(gamesData), [gamesData]);
  const unlockedSet = useMemo(() => {
    const result = new Set(achievements);
    ACHIEVEMENTS.forEach(achievement => {
      if (achievement.check(derived)) result.add(achievement.id);
    });
    return result;
  }, [achievements, derived]);

  const unlockedCount = unlockedSet.size;
  const totalPoints = ACHIEVEMENTS.filter(item => unlockedSet.has(item.id)).reduce((sum, item) => sum + item.points, 0);
  const progress = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  const tierConfig = useMemo(() => ({
    platinum: { label: t('trophies.tier_platina'), color: '#c084fc', bg: 'rgba(192,132,252,.1)', border: 'rgba(192,132,252,.25)' },
    gold: { label: t('trophies.tier_ouro'), color: '#facc15', bg: 'rgba(250,204,21,.1)', border: 'rgba(250,204,21,.25)' },
    silver: { label: t('trophies.tier_prata'), color: '#cbd5e1', bg: 'rgba(203,213,225,.09)', border: 'rgba(203,213,225,.22)' },
    bronze: { label: t('trophies.tier_bronze'), color: '#d97706', bg: 'rgba(217,119,6,.1)', border: 'rgba(217,119,6,.25)' },
  }), [t]);

  return (
    <div className="app-page min-h-screen pb-28">
      <main className="app-shell py-7 sm:py-9">
        <header className="mb-6">
          <p className="eyebrow mb-2">{t('trophies.subtitle')}</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: V.text }}>{t('trophies.title')}</h1>
          <p className="mt-1 text-sm" style={{ color: V.muted }}>{unlockedCount} {t('trophies.count_desc')} {gamesData.length} {t('trophies.games')}</p>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TIER_ORDER.map(tierId => {
            const tier = tierConfig[tierId];
            const items = ACHIEVEMENTS.filter(item => item.tier === tierId);
            const count = items.filter(item => unlockedSet.has(item.id)).length;
            return (
              <motion.article key={tierId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="surface-card flex items-center gap-3 rounded-2xl p-4">
                <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full" style={{ background: tier.bg, color: tier.color }}><Trophy className="h-5 w-5" /></div>
                <div><p className="text-xl font-black" style={{ color: V.text }}>{count}<span className="text-sm" style={{ color: V.low }}>/{items.length}</span></p><p className="text-xs" style={{ color: V.muted }}>{tier.label}</p></div>
              </motion.article>
            );
          })}
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[.72fr_1.28fr]">
          <motion.aside initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} className="h-fit space-y-4 lg:sticky lg:top-6">
            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-center justify-between"><div><p className="eyebrow">{t('trophies.overall_progress')}</p><p className="mt-2 text-4xl font-black" style={{ color: V.text }}>{progress}%</p></div><div className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: V.faint, color: V.soft }}><Target className="h-7 w-7" /></div></div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full" style={{ background: V.faint }}><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.7 }} className="h-full rounded-full" style={{ background: V.grad }} /></div>
              <p className="mt-2 text-xs" style={{ color: V.muted }}>{ACHIEVEMENTS.length - unlockedCount} {t('trophies.achievements_waiting')}</p>
            </div>
            <div className="rounded-3xl border p-6" style={{ background: 'rgba(250,204,21,.07)', borderColor: 'rgba(250,204,21,.2)' }}>
              <Zap className="h-6 w-6 text-yellow-400" /><p className="mt-4 text-3xl font-black text-yellow-300">{totalPoints.toLocaleString(t('lang') === 'en' ? 'en-US' : 'pt-BR')}</p><p className="text-sm font-bold text-yellow-100">{t('trophies.earned_xp')}</p><p className="mt-1 text-xs text-yellow-100/50">{t('trophies.xp_desc')}</p>
            </div>
          </motion.aside>

          <div className="space-y-7">
            {TIER_ORDER.map(tierId => {
              const tier = tierConfig[tierId];
              const items = ACHIEVEMENTS.filter(item => item.tier === tierId);
              const unlockedInTier = items.filter(item => unlockedSet.has(item.id)).length;
              return (
                <section key={tierId}>
                  <div className="mb-3 flex items-center gap-3"><Medal className="h-4 w-4" style={{ color: tier.color }} /><h2 className="text-sm font-black uppercase tracking-wider" style={{ color: tier.color }}>{tier.label}</h2><span className="text-xs" style={{ color: V.muted }}>{unlockedInTier}/{items.length}</span><div className="h-px flex-1" style={{ background: V.border }} /></div>
                  <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }} initial="hidden" animate="show" className="grid gap-3 xl:grid-cols-2">
                    {items.map(item => <AchievementCard key={item.id} achievement={item} unlocked={unlockedSet.has(item.id)} V={V} tierConfig={tierConfig} />)}
                  </motion.div>
                </section>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
