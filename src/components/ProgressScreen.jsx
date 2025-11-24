// src/components/ProgressScreen.jsx
import React, { useMemo } from 'react';
import { TrendingUp, CheckCircle, Clock, History, List, Heart } from "lucide-react";
// Importação direta dos componentes do Recharts:
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

  // Calcular o tempo total
  const totalHours = gamesData.reduce((sum, game) => sum + (game.timeToBeat || 0), 0);
  
  // Dados para o gráfico (Apenas 3 categorias: Zerados, Jogando, Desejos)
  const chartData = [
    { name: 'Zerados', count: statusCounts.zerados || 0, fill: '#10b981' }, 
    { name: 'Jogando', count: statusCounts.jogando || 0, fill: '#0ea5e9' }, // Status principal
    { name: 'Desejos', count: statusCounts.desejados || 0, fill: '#f59e0b' }, 
  ].filter(item => item.count > 0);
  
  const COLORS = ['#10b981', '#0ea5e9', '#f59e0b']; // Cores para os 3 status restantes

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-24 pt-6">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Seu Backlog</h1>
          <p className="text-gray-400">Acompanhe suas estatísticas de jogos</p>
        </div>

        {/* Cards de Estatísticas Rápidas */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur rounded-2xl p-4 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300">Zerados</span>
            </div>
            <div className="text-3xl font-bold">{totalFinishedGames}</div>
            <div className="text-xs text-gray-400">títulos</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur rounded-2xl p-4 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-300">Tempo Total</span>
            </div>
            <div className="text-3xl font-bold">{totalHours}h</div>
            <div className="text-xs text-gray-400">estimadas</div>
          </div>
        </div>

        {/* Gráfico de Status (Recharts - AGORA É O GRÁFICO REAL) */}
        {gamesData.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Distribuição por Status
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
                    outerRadius={80}
                    fill="#8884d8"
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Histórico de Jogos Zerados */}
        {gameHistory.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-yellow-400" />
              Últimos Jogos Zerados
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {[...gameHistory]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className='w-5 h-5 text-green-400' />
                      <div>
                        <div className="font-semibold text-sm">{item.game}</div>
                        <div className="text-xs text-gray-400">
                          Zerado em: {new Date(item.date).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        #{gameHistory.length - index}
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