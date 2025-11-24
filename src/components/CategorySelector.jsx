import React from 'react';
import { Joystick, TrendingUp, ChevronRight, PlusCircle } from 'lucide-react';
import { categoryNames, categoryColors, categoryIcons } from '../data/categories';

export default function CategorySelector({
  games, // Jogos agrupados por status (Firebase)
  setSelectedCategory,
  setIsAddGameModalOpen,
}) {
  
  // Função para contar jogos em uma categoria
  const getCategoryProgress = (category) => games[category] ? games[category].length : 0;
  
  const finishedGamesCount = getCategoryProgress('zerados');
  const inProgressCount = getCategoryProgress('jogando');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 pb-32">
      <div className="max-w-md mx-auto animate-fadeIn">
        
        {/* Header Adaptado */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl mb-4 shadow-lg">
            <Joystick className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Game Backlog
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full backdrop-blur">
              <span className="text-sm font-semibold">Total de Jogos: {games.jogando.length + games.a_zerar.length + games.zerados.length + games.desejados.length}</span>
            </div>
          </div>

          <p className="text-gray-400">
            {inProgressCount > 0 ? `Você está jogando ${inProgressCount} título(s). Não desista!` : 'Adicione seu primeiro jogo e comece a zerar!'}
          </p>
        </div>

        {/* Card de Adição de Novo Jogo (Chama o Modal) */}
        <button
            onClick={() => setIsAddGameModalOpen(true)}
            className={`w-full mb-6 backdrop-blur rounded-3xl p-5 border-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50 hover:border-blue-400
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className='w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500'>
                        <PlusCircle className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1 text-cyan-400">Adicionar Novo Jogo</h3>
                        <p className="text-sm text-gray-300">Comece a preencher seu backlog!</p>
                    </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
            </div>
        </button>


        {/* Lista de Categorias */}
        <div className="space-y-4 mb-6">
          {Object.keys(categoryNames).map((category) => {
            const count = getCategoryProgress(category);
            const Icon = categoryIcons[category] || Joystick;
            const isFinishedCategory = category === 'zerados';
            
            return (
              <button 
                key={category} 
                onClick={() => setSelectedCategory(category)} 
                className={`w-full backdrop-blur rounded-3xl p-5 border-2 transition-all duration-300 group
                    border-gray-700 hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98] bg-gray-800/40 hover:bg-gray-800/60
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${categoryColors[category]} flex items-center justify-center relative transition-transform group-hover:scale-110`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                        {categoryNames[category]}
                      </h3>
                      <p className="text-sm text-gray-400">{count} {count === 1 ? 'jogo' : 'jogos'}</p>
                      {isFinishedCategory && (
                        <span className="inline-block mt-1 text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                          {count} Zerados
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-300" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progresso Geral Compacto */}
        <div className="bg-gray-800/40 backdrop-blur rounded-3xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Progresso de Finalização
            </h3>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {finishedGamesCount}
            </span>
          </div>
          <p className="text-sm text-gray-400 text-center">Parabéns por zerar {finishedGamesCount} títulos!</p>
        </div>
      </div>
    </div>
  );
}