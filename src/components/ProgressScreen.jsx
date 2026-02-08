import React, { useMemo } from 'react';
import { TrendingUp, CheckCircle, Clock, History, Star, Heart } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'; 

export default function ProgressScreen({
  gamesData,
  gameHistory,
  totalFinishedGames,
}) {
  
  // Agrupar e contar jogos por status
  const statusCounts = useMemo(() => {
    return gamesData.reduce((acc, game) => {
      acc[game.status] = (acc[game.status] || 0) + 1;
      return acc;
    }, {});
  }, [gamesData]);

  // Estatísticas Avançadas
  const advancedStats = useMemo(() => {
    const finishedGames = gamesData.filter(g => g.status === 'zerados');
    
    // 1. Média de Notas
    const ratedGames = finishedGames.filter(g => g.rating > 0);
    const totalRating = ratedGames.reduce((sum, g) => sum + parseInt(g.rating), 0);
    const avgRating = ratedGames.length > 0 ? (totalRating / ratedGames.length).toFixed(1) : '-';

    // 2. Gênero Favorito (Entre os zerados)
    const genres = {};
    finishedGames.forEach(g => {
        if (g.genre) {
            genres[g.genre] = (genres[g.genre] || 0) + 1;
        }
    });
    
    // Encontrar o gênero com maior número
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
  
  // Dados para o gráfico
  const chartData = [
    { name: 'Zerados', count: statusCounts.zerados || 0, fill: '#10b981' }, 
    { name: 'Jogando', count: statusCounts.playing || 0, fill: '#0ea5e9' }, 
    { name: 'Backlog', count: statusCounts.backlog || 0, fill: '#8b5cf6' },
    { name: 'Desejos', count: statusCounts.desejados || 0, fill: '#f59e0b' }, 
  ].filter(item => item.count > 0);
  
  // Preparar histórico recente ordenado (Limitado a 5)
  const recentHistory = useMemo(() => {
      return [...gameHistory]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
  }, [gameHistory]);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24 pt-6">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Estatísticas</h1>
          <p className="text-gray-400">O seu DNA de jogador em números.</p>
        </div>

        {/* Grid de Stats Principais */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          
          {/* Card: Zerados */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-green-200">Zerados</span>
            </div>
            <div className="text-3xl font-bold text-white">{totalFinishedGames}</div>
            <div className="text-xs text-gray-400">jogos concluídos</div>
          </div>

          {/* Card: Tempo Total */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Horas</span>
            </div>
            <div className="text-3xl font-bold text-white">{totalHours}h</div>
            <div className="text-xs text-gray-400">de jogatina estimada</div>
          </div>
          
          {/* Card: Nota Média */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-200">Nota Média</span>
            </div>
            <div className="text-3xl font-bold text-white">{advancedStats.avgRating}</div>
            <div className="text-xs text-gray-400">nos jogos zerados</div>
          </div>

          {/* Card: Gênero Favorito */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-pink-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-pink-200">Vício</span>
            </div>
            <div className="text-xl font-bold text-white truncate leading-8 pt-1">{advancedStats.favoriteGenre}</div>
            <div className="text-xs text-gray-400">gênero mais zerado</div>
          </div>

        </div>

        {/* Gráfico de Status */}
        {gamesData.length > 0 && (
          <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700 mb-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2 text-gray-200">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Distribuição
            </h3>
            
            <div style={{ width: '100%', height: 250, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60} 
                    outerRadius={85}
                    paddingAngle={5}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                <span className="text-2xl font-bold text-white">{gamesData.length}</span>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total</p>
              </div>
            </div>
          </div>
        )}

        {/* Histórico Recente (ESTÁTICO - LISTA SIMPLES) */}
        {recentHistory.length > 0 && (
          <div className="bg-gray-800 rounded-3xl p-6 border border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-200">
              <History className="w-5 h-5 text-yellow-400" />
              Recém Zerados
            </h3>
            
            <div className="flex flex-col gap-3">
              {recentHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-700/50 border border-gray-700"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-200 truncate" title={item.game}>
                        {item.game}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.date).toLocaleDateString("pt-BR", { day: 'numeric', month: 'long' })}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}