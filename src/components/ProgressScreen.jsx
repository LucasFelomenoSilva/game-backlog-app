import React, { useMemo } from 'react';
import { TrendingUp, CheckCircle, Clock, History, Star, Heart, Sparkles, Target, Flame } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'; 

export default function ProgressScreen({
  gamesData,
  gameHistory,
  totalFinishedGames,
}) {
  
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

    const genres = {};
    finishedGames.forEach(g => {
        if (g.genre) {
            genres[g.genre] = (genres[g.genre] || 0) + 1;
        }
    });
    
    let favoriteGenre = '-';
    let maxCount = 0;
    Object.entries(genres).forEach(([genre, count]) => {
        if (count > maxCount) {
            maxCount = count;
            favoriteGenre = genre;
        }
    });

    return { avgRating, favoriteGenre };
  }, [gamesData]);

  const totalHours = gamesData.reduce((sum, game) => sum + (Number(game.timeToBeat) || 0), 0);
  
  const chartData = [
    { name: 'Zerados', count: statusCounts.zerados || 0, fill: '#10b981' }, 
    { name: 'Jogando', count: statusCounts.playing || 0, fill: '#0ea5e9' }, 
    { name: 'Backlog', count: statusCounts.backlog || 0, fill: '#8b5cf6' },
    { name: 'Desejos', count: statusCounts.desejados || 0, fill: '#f59e0b' }, 
  ].filter(item => item.count > 0);
  
  const recentHistory = useMemo(() => {
      return [...gameHistory]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
  }, [gameHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white pb-24 pt-6">
      <div className="max-w-md mx-auto px-4">
        
        {/* Header Moderno */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/30">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Estatísticas
              </h1>
              <p className="text-gray-400 text-sm">Seu DNA de jogador em números</p>
            </div>
          </div>
        </div>

        {/* Grid de Stats Principais com Gradientes */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          
          {/* Card: Zerados */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Zerados</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                {totalFinishedGames}
              </div>
              <div className="text-xs text-gray-500">jogos concluídos</div>
            </div>
          </div>

          {/* Card: Tempo Total */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Horas</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                {totalHours}h
              </div>
              <div className="text-xs text-gray-500">de jogatina estimada</div>
            </div>
          </div>
          
          {/* Card: Nota Média */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                  <Star className="w-4 h-4 text-white fill-current" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Nota Média</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-1">
                {advancedStats.avgRating}
              </div>
              <div className="text-xs text-gray-500">nos jogos zerados</div>
            </div>
          </div>

          {/* Card: Gênero Favorito */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
                  <Heart className="w-4 h-4 text-white fill-current" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Vício</span>
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-1 truncate leading-9">
                {advancedStats.favoriteGenre}
              </div>
              <div className="text-xs text-gray-500">gênero mais zerado</div>
            </div>
          </div>

        </div>

        {/* Gráfico de Distribuição Modernizado */}
        {gamesData.length > 0 && (
          <div className="relative group mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-200 flex items-center gap-2">
                  Distribuição de Jogos
                </h3>
              </div>
              
              <div style={{ width: '100%', height: 280, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70} 
                      outerRadius={95}
                      paddingAngle={4}
                      strokeWidth={0}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: '16px',
                        backdropFilter: 'blur(20px)',
                        padding: '12px 16px'
                      }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}
                      labelStyle={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      iconType="circle"
                      wrapperStyle={{ 
                        paddingTop: '24px', 
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Centro do Gráfico */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-10">
                  <div className="p-4 bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block mb-1">
                      {gamesData.length}
                    </span>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Histórico Recente Modernizado */}
        {recentHistory.length > 0 && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-200">
                  Recém Zerados
                </h3>
              </div>
              
              <div className="space-y-3">
                {recentHistory.map((item, index) => (
                  <div
                    key={index}
                    className="group/item relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-0 group-hover/item:opacity-20 transition duration-300"></div>
                    <div className="relative flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-white/5 group-hover/item:border-white/10 transition-all duration-300">
                      
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate mb-1 text-sm" title={item.game}>
                          {item.game}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(item.date).toLocaleDateString("pt-BR", { day: 'numeric', month: 'long' })}</span>
                        </div>
                      </div>
                      
                      <div className="text-2xl">🎮</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {recentHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhum jogo zerado recentemente</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}