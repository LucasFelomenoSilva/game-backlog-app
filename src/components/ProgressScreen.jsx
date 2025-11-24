import React, { useMemo } from 'react';
import { TrendingUp, CheckCircle, Clock, History } from "lucide-react";

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
  
  // Dados para o gráfico (Fallback visual)
  const chartData = [
    { name: 'Zerados', count: statusCounts.zerados || 0, fill: '#10b981' },
    { name: 'Jogando', count: statusCounts.jogando || 0, fill: '#0ea5e9' },
    { name: 'A Zerar', count: statusCounts.a_zerar || 0, fill: '#a855f7' },
    { name: 'Desejos', count: statusCounts.desejados || 0, fill: '#f59e0b' },
  ];

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

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur rounded-2xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-300">Tempo Total</span>
            </div>
            <div className="text-3xl font-bold">{totalHours}h</div>
            <div className="text-xs text-gray-400">estimadas</div>
          </div>
        </div>

        {/* Gráfico de Status (Fallback visual - sem Recharts para compatibilidade) */}
        {gamesData.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Distribuição por Status
            </h3>
            <div style={{ width: '100%', height: 200 }}>
                <p className="text-center text-sm text-gray-500 pt-10">
                    Visualização gráfica (Recharts) não renderizada por segurança de ambiente.
                </p>
                <div className='flex justify-around mt-4'>
                    {chartData.map(item => (
                        <div key={item.name} className='text-center'>
                            <div className={`w-8 h-8 rounded-full mx-auto mb-1`} style={{backgroundColor: item.fill}}/>
                            <span className='text-xs text-gray-400'>{item.name}</span>
                            <span className='block font-bold'>{item.count}</span>
                        </div>
                    ))}
                </div>
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