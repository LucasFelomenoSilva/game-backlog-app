// src/components/ProgressScreen.jsx
import React, { useMemo } from 'react';
import { TrendingUp, CheckCircle, Clock, History, Star, Heart, Sparkles, Target, Flame, Trophy, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'; 
import { useTheme } from '../context/ThemeContext'; // <-- Importado

export default function ProgressScreen({ gamesData, gameHistory, totalFinishedGames }) {
  const { theme: V } = useTheme(); // <-- Usando as cores do tema

  const statusCounts = useMemo(() => {
    return gamesData.reduce((acc, game) => {
      acc[game.status] = (acc[game.status] || 0) + 1;
      return acc;
    }, {});
  }, [gamesData]);

  const advancedStats = useMemo(() => {
    const finishedGames = gamesData.filter(g => g.status === 'zerados');
    const ratedGames = finishedGames.filter(g => g.rating > 0);
    const totalRating = ratedGames.reduce((sum, g) => sum + parseInt(g.rating), 0);
    const avgRating = ratedGames.length > 0 ? (totalRating / ratedGames.length).toFixed(1) : '-';
    const platinumGames = finishedGames.filter(g => g.isPlatinum);
    const platinumCount = platinumGames.length;
    const genres = {};
    finishedGames.forEach(g => { if (g.genre) { genres[g.genre] = (genres[g.genre] || 0) + 1; } });
    let favoriteGenre = '-';
    let maxCount = 0;
    Object.entries(genres).forEach(([genre, count]) => {
        if (count > maxCount) { maxCount = count; favoriteGenre = genre; }
    });
    return { avgRating, favoriteGenre, platinumCount };
  }, [gamesData]);

  const totalHours = gamesData.reduce((sum, game) => sum + (Number(game.timeToBeat) || 0), 0);
  
  const chartData = [
    { name: 'Zerados', count: statusCounts.zerados || 0, fill: '#10b981' }, 
    { name: 'Jogando', count: statusCounts.playing || 0, fill: V.primary }, 
    { name: 'Backlog', count: statusCounts.backlog || 0, fill: V.accent },
    { name: 'Desejos', count: statusCounts.desejados || 0, fill: '#f59e0b' }, 
  ].filter(item => item.count > 0);
  
  const recentHistory = useMemo(() => {
      return [...gameHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [gameHistory]);

  return (
    <div className="min-h-screen pb-24 pt-6" style={{ background: V.bg }}>
      <div className="max-w-md mx-auto px-4">
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-2xl shadow-lg" style={{ background: `linear-gradient(to bottom right, ${V.primary}, ${V.secondary})`, boxShadow: `0 4px 14px ${V.primary}4d` }}>
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: V.text }}>Estatísticas</h1>
              <p className="text-sm" style={{ color: V.muted }}>Seu DNA de jogador em números</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Zerados', value: totalFinishedGames, text: 'jogos concluídos', icon: CheckCircle, color1: '#10b981', color2: '#34d399' },
            { label: 'Horas', value: `${totalHours}h`, text: 'de jogatina estimada', icon: Clock, color1: V.primary, color2: V.secondary },
            { label: 'Nota Média', value: advancedStats.avgRating, text: 'nos jogos zerados', icon: Star, color1: '#f59e0b', color2: '#fbbf24' },
            { label: 'Vício', value: advancedStats.favoriteGenre, text: 'gênero mais zerado', icon: Heart, color1: V.accent, color2: '#fb7185' },
          ].map((stat, i) => (
            <div key={i} className="relative group">
              <div className="absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" style={{ background: `linear-gradient(to right, ${stat.color1}, ${stat.color2})` }}></div>
              <div className="relative backdrop-blur-xl rounded-2xl p-5 border" style={{ background: `${V.card}e6`, borderColor: V.border }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-xl" style={{ background: `linear-gradient(to bottom right, ${stat.color1}, ${stat.color2})` }}>
                    <stat.icon className="w-4 h-4 text-white fill-current" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: V.muted }}>{stat.label}</span>
                </div>
                <div className="text-3xl font-bold mb-1 truncate leading-9" style={{ color: stat.color1 }}>{stat.value}</div>
                <div className="text-xs" style={{ color: V.low }}>{stat.text}</div>
              </div>
            </div>
          ))}
        </div>

        {advancedStats.platinumCount > 0 && (
          <div className="relative group mb-6">
            <div className="absolute -inset-0.5 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-300 animate-pulse" style={{ background: `linear-gradient(to right, #f59e0b, #facc15, #f59e0b)` }}></div>
            <div className="relative backdrop-blur-xl rounded-3xl p-6 border-2" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.5)' }}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl" style={{ background: `linear-gradient(to bottom right, #f59e0b, #d97706)` }}>
                  <Trophy className="w-10 h-10 text-yellow-900 fill-yellow-900" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">Conquistas Épicas</span>
                  </div>
                  <div className="text-5xl font-black mb-1" style={{ color: '#fde047' }}>{advancedStats.platinumCount}</div>
                  <div className="text-sm font-bold text-yellow-200">{advancedStats.platinumCount === 1 ? 'Jogo Platinado' : 'Jogos Platinados'}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(250,204,21,0.7)' }}>100% de conclusão alcançados</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-yellow-300 font-semibold">Taxa de Platinação</span>
                  <span className="text-yellow-200 font-bold">{totalFinishedGames > 0 ? Math.round((advancedStats.platinumCount / totalFinishedGames) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(113,63,18,0.3)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${totalFinishedGames > 0 ? (advancedStats.platinumCount / totalFinishedGames) * 100 : 0}%`, background: `linear-gradient(to right, #f59e0b, #f59e0b)` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {gamesData.length > 0 && (
          <div className="relative group mb-6">
            <div className="absolute -inset-0.5 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300" style={{ background: `linear-gradient(to right, ${V.primary}, ${V.accent})` }}></div>
            <div className="relative backdrop-blur-xl rounded-3xl p-6 border" style={{ background: `${V.card}e6`, borderColor: V.border }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-xl" style={{ background: `linear-gradient(to bottom right, ${V.primary}, ${V.accent})` }}>
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold flex items-center gap-2" style={{ color: V.text }}>Distribuição de Jogos</h3>
              </div>
              <div style={{ width: '100%', height: 280, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={4} strokeWidth={0}>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: V.card, border: `1px solid ${V.border}`, borderRadius: '16px', backdropFilter: 'blur(20px)', padding: '12px 16px' }} itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }} labelStyle={{ color: V.muted, fontSize: '12px', marginBottom: '4px' }} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '24px', fontSize: '13px', fontWeight: '600', color: V.muted }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-10">
                  <div className="p-4 backdrop-blur-xl rounded-2xl border" style={{ background: `${V.bg}cc`, borderColor: V.border }}>
                    <span className="text-4xl font-bold block mb-1" style={{ color: V.primary }}>{gamesData.length}</span>
                    <p className="text-xs uppercase tracking-wider font-bold" style={{ color: V.low }}>Total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {recentHistory.length > 0 && (
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300" style={{ background: `linear-gradient(to right, ${V.accent}, ${V.primary})` }}></div>
            <div className="relative backdrop-blur-xl rounded-3xl p-6 border" style={{ background: `${V.card}e6`, borderColor: V.border }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-xl" style={{ background: `linear-gradient(to bottom right, ${V.accent}, ${V.primary})` }}>
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold" style={{ color: V.text }}>Recém Zerados</h3>
              </div>
              <div className="space-y-3">
                {recentHistory.map((item, index) => (
                  <div key={index} className="group/item relative">
                    <div className="absolute -inset-0.5 rounded-2xl blur opacity-0 group-hover/item:opacity-20 transition duration-300" style={{ background: `linear-gradient(to right, #10b981, #34d399)` }}></div>
                    <div className="relative flex items-center gap-4 p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300" style={{ background: V.faint, borderColor: V.border }}>
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: `linear-gradient(to bottom right, #10b981, #059669)` }}>
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2" style={{ background: '#f59e0b', borderColor: V.bg }}>
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate mb-1 text-sm" style={{ color: V.text }} title={item.game}>{item.game}</div>
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: V.muted }}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(item.date).toLocaleDateString("pt-BR", { day: 'numeric', month: 'long' })}</span>
                        </div>
                      </div>
                      <div className="text-2xl">🎮</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}