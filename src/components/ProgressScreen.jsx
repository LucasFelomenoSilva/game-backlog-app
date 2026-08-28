import React, { useMemo } from 'react';
import {
  Award, CheckCircle2, Clock3, Flame, Gamepad2,
  Heart, History, Star, Target, Trophy,
} from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 150, damping: 18 } },
};

export default function ProgressScreen({ gamesData = [], gameHistory = [], totalFinishedGames = 0 }) {
  const { theme: V } = useTheme();

  const stats = useMemo(() => {
    const statusCounts = gamesData.reduce((acc, game) => {
      acc[game.status] = (acc[game.status] || 0) + 1;
      return acc;
    }, {});
    const finished = gamesData.filter(game => game.status === 'zerados');
    const rated = finished.filter(game => Number(game.rating) > 0);
    const totalHours = gamesData.reduce((sum, game) => sum + (Number(game.timeToBeat) || 0), 0);
    const avgRating = rated.length
      ? (rated.reduce((sum, game) => sum + Number(game.rating), 0) / rated.length).toFixed(1)
      : '—';
    const platinumCount = finished.filter(game => game.isPlatinum).length;
    const genres = finished.reduce((acc, game) => {
      if (game.genre) acc[game.genre] = (acc[game.genre] || 0) + 1;
      return acc;
    }, {});
    const genreRanking = Object.entries(genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    const completion = gamesData.length ? Math.round((finished.length / gamesData.length) * 100) : 0;
    return { statusCounts, totalHours, avgRating, platinumCount, genreRanking, completion };
  }, [gamesData]);

  const chartData = [
    { name: 'Zerados', count: stats.statusCounts.zerados || 0, fill: '#10b981' },
    { name: 'Jogando', count: stats.statusCounts.playing || 0, fill: V.primary },
    { name: 'Na fila', count: stats.statusCounts.backlog || 0, fill: V.accent },
    { name: 'Desejos', count: stats.statusCounts.desejados || 0, fill: '#f59e0b' },
  ].filter(item => item.count > 0);

  const recentHistory = useMemo(
    () => [...gameHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [gameHistory],
  );
  const maxGenreCount = Math.max(1, ...stats.genreRanking.map(item => item.count));

  const summary = [
    { label: 'Horas estimadas', value: `${stats.totalHours}h`, hint: `${gamesData.length} jogos catalogados`, icon: Clock3, color: V.soft },
    { label: 'Jogos zerados', value: totalFinishedGames, hint: `${stats.completion}% da coleção`, icon: Gamepad2, color: '#10b981' },
    { label: 'Nota média', value: stats.avgRating, hint: 'entre jogos avaliados', icon: Star, color: '#f59e0b' },
    { label: 'Platinas', value: stats.platinumCount, hint: 'jogos completados em 100%', icon: Trophy, color: '#facc15' },
  ];

  return (
    <div className="app-page min-h-screen pb-28">
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="app-shell py-7 sm:py-9"
      >
        <motion.header variants={cardVariants} className="mb-6">
          <p className="eyebrow mb-2">Sua jornada</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: V.text }}>Estatísticas</h1>
          <p className="mt-1 text-sm" style={{ color: V.muted }}>Seu jeito de jogar traduzido em números.</p>
        </motion.header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumo das estatísticas">
          {summary.map(({ label, value, hint, icon: Icon, color }) => (
            <motion.article
              key={label}
              variants={cardVariants}
              whileHover={{ y: -3 }}
              className="surface-card rounded-2xl p-4 sm:p-5"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${color}18`, color }}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black sm:text-3xl" style={{ color: V.text }}>{value}</p>
              <p className="mt-1 text-sm font-bold" style={{ color: V.muted }}>{label}</p>
              <p className="mt-0.5 text-[11px]" style={{ color }}>{hint}</p>
            </motion.article>
          ))}
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <motion.article variants={cardVariants} className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black" style={{ color: V.text }}>Distribuição da coleção</h2>
                <p className="text-sm" style={{ color: V.muted }}>Onde estão seus jogos agora</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: V.faint, color: V.soft }}>
                <Target className="h-5 w-5" />
              </div>
            </div>
            {chartData.length ? (
              <div className="relative h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="47%" innerRadius={66} outerRadius={92} paddingAngle={4} strokeWidth={0}>
                      {chartData.map(entry => <Cell key={entry.name} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: V.card2, border: `1px solid ${V.border}`, borderRadius: 14, color: V.text }} />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ color: V.muted, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-3xl font-black" style={{ color: V.text }}>{gamesData.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: V.muted }}>jogos</p>
                </div>
              </div>
            ) : (
              <div className="grid h-[280px] place-items-center text-sm" style={{ color: V.muted }}>Adicione jogos para visualizar a distribuição.</div>
            )}
          </motion.article>

          <motion.article variants={cardVariants} className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black" style={{ color: V.text }}>Gêneros favoritos</h2>
                <p className="text-sm" style={{ color: V.muted }}>Com base nos jogos que você zerou</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: V.faint, color: V.soft }}>
                <Heart className="h-5 w-5" />
              </div>
            </div>
            {stats.genreRanking.length ? (
              <div className="space-y-5">
                {stats.genreRanking.map((genre, index) => (
                  <div key={genre.name}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold" style={{ color: V.text }}>{genre.name}</span>
                      <span style={{ color: V.muted }}>{genre.count} {genre.count === 1 ? 'jogo' : 'jogos'}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full" style={{ background: V.faint }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(genre.count / maxGenreCount) * 100}%` }}
                        transition={{ delay: 0.2 + index * 0.08, duration: 0.55, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: index === 0 ? V.grad : `${V.primary}aa` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid min-h-56 place-items-center text-center text-sm" style={{ color: V.muted }}>Os gêneros aparecem quando você conclui jogos.</div>
            )}
          </motion.article>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <motion.article variants={cardVariants} className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400"><History className="h-5 w-5" /></div>
              <div><h2 className="text-lg font-black" style={{ color: V.text }}>Zerados recentemente</h2><p className="text-xs" style={{ color: V.muted }}>Suas últimas conquistas</p></div>
            </div>
            {recentHistory.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {recentHistory.map((item, index) => (
                  <motion.div key={`${item.game}-${item.date}-${index}`} whileHover={{ x: 3 }} className="flex items-center gap-3 rounded-2xl border p-3.5" style={{ background: V.card2, borderColor: V.border }}>
                    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400"><CheckCircle2 className="h-5 w-5" /></div>
                    <div className="min-w-0"><p className="truncate text-sm font-bold" style={{ color: V.text }}>{item.game}</p><p className="mt-1 text-[11px]" style={{ color: V.muted }}>{new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</p></div>
                  </motion.div>
                ))}
              </div>
            ) : <p className="py-8 text-center text-sm" style={{ color: V.muted }}>Nenhum jogo zerado ainda.</p>}
          </motion.article>

          <motion.article variants={cardVariants} className="relative overflow-hidden rounded-3xl border p-6" style={{ background: 'linear-gradient(145deg,rgba(245,158,11,.13),rgba(245,158,11,.035))', borderColor: 'rgba(245,158,11,.25)' }}>
            <Award className="absolute -bottom-5 -right-4 h-28 w-28 text-amber-400 opacity-[0.06]" />
            <div className="relative">
              <Flame className="mb-5 h-6 w-6 text-amber-400" />
              <p className="text-4xl font-black text-amber-300">{stats.platinumCount}</p>
              <h2 className="mt-1 font-black text-amber-100">{stats.platinumCount === 1 ? 'Jogo platinado' : 'Jogos platinados'}</h2>
              <p className="mt-2 text-xs leading-5 text-amber-100/55">{totalFinishedGames ? Math.round((stats.platinumCount / totalFinishedGames) * 100) : 0}% dos jogos zerados chegaram aos 100%.</p>
            </div>
          </motion.article>
        </section>
      </motion.main>
    </div>
  );
}
