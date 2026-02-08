import React from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, Star, Trophy, Gamepad2 } from 'lucide-react';
import { categoryNames } from '../data/categories';

const getRatingColor = (rating) => {
  if (rating >= 9) return 'from-emerald-500 to-teal-500';
  if (rating >= 7) return 'from-cyan-500 to-blue-500';
  if (rating >= 5) return 'from-yellow-500 to-orange-500';
  return 'from-red-500 to-pink-500';
};

const getCategoryGradient = (category) => {
  const gradients = {
    playing: 'from-orange-500 to-red-500',
    installed: 'from-blue-500 to-cyan-500',
    backlog: 'from-purple-500 to-pink-500',
    zerados: 'from-green-500 to-emerald-500',
    desejados: 'from-yellow-500 to-amber-500',
  };
  return gradients[category] || 'from-gray-500 to-gray-600';
};

export default function GameList({ 
  selectedCategory, 
  setSelectedCategory, 
  games, 
  setSelectedGame, 
}) {
  const safeGames = games || {};
  let categoryGames = safeGames[selectedCategory] || [];
  const categoryName = categoryNames[selectedCategory] || 'Categoria';
  const categoryGradient = getCategoryGradient(selectedCategory);
  
  // Ordenação para jogos zerados
  if (selectedCategory === 'zerados') {
    categoryGames = [...categoryGames].sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        if (ratingA === ratingB) return a.nome.localeCompare(b.nome);
        return ratingB - ratingA;
    });
  }

  // Cabeçalho com gradiente
  const ListHeader = () => (
    <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 -mx-4 px-4 py-4 mb-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4">
          {/* Botão Voltar */}
          <button
            onClick={() => setSelectedCategory(null)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl border border-gray-700/50 transition-all duration-300 hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          {/* Título da Categoria */}
          <div className="flex-1 text-center">
            <div className={`inline-block px-6 py-2 bg-gradient-to-r ${categoryGradient} rounded-full`}>
              <h2 className="text-lg font-black text-white tracking-wide">{categoryName}</h2>
            </div>
          </div>

          {/* Contador */}
          <div className="w-12 h-10 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
            <span className="text-lg font-bold text-cyan-400">{categoryGames.length}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Tela de Lista Vazia
  if (categoryGames.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <ListHeader />
        <div className="max-w-md mx-auto px-4 pb-20">
          <div className="text-center py-20 bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
              <Gamepad2 className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-300">Lista Vazia</h3>
            <p className="text-gray-400 px-6 leading-relaxed">
              Nenhum jogo encontrado nesta categoria ainda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tela com Jogos
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <ListHeader />
      
      <div className="max-w-md mx-auto px-4 pb-20">
        <div className="space-y-3">
          {categoryGames.map((game) => {
            const isFinished = game.status === 'zerados';
            
            return (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className={`group w-full rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left shadow-lg overflow-hidden relative ${
                  isFinished 
                    ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 hover:from-green-500/20 hover:to-emerald-500/20 hover:border-green-500/50' 
                    : 'bg-gradient-to-br from-gray-800/80 to-gray-800/60 border-gray-700/50 hover:border-gray-600 hover:from-gray-800 hover:to-gray-800/80'
                }`}
              >
                {/* Brilho no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                <div className="relative flex items-center justify-between gap-4">
                  {/* Informações do Jogo */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-lg mb-2 truncate transition-colors ${
                      isFinished ? 'text-green-300 group-hover:text-green-200' : 'text-white group-hover:text-cyan-300'
                    }`}>
                      {game.nome}
                    </h3>
                    
                    <div className="flex items-center flex-wrap gap-3">
                      {/* Plataforma */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-900/60 rounded-lg border border-gray-700/50">
                        <Gamepad2 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-300">{game.platform}</span>
                      </div>
                      
                      {/* Rating para jogos zerados */}
                      {isFinished && game.rating && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r ${getRatingColor(game.rating)} rounded-lg shadow-lg`}>
                          <Star className="w-3.5 h-3.5 fill-white text-white" />
                          <span className="text-xs font-black text-white">{game.rating}/10</span>
                        </div>
                      )}

                      {/* Tempo para jogos não zerados */}
                      {game.timeToBeat > 0 && !isFinished && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs font-semibold text-blue-300">{game.timeToBeat}h</span>
                        </div>
                      )}

                      {/* Gênero */}
                      {game.genre && (
                        <span className="text-xs text-gray-500 font-medium">{game.genre}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Ícones à direita */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isFinished && (
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                        <Trophy className='w-5 h-5 text-white' />
                      </div>
                    )}
                    <ChevronRight className={`w-6 h-6 transition-all duration-300 ${
                      isFinished ? 'text-green-400 group-hover:translate-x-1' : 'text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1'
                    }`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer informativo para zerados */}
        {selectedCategory === 'zerados' && categoryGames.length > 0 && (
          <div className="mt-8 p-4 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl text-center">
            <p className="text-sm text-gray-400">
              <span className="font-bold text-green-400">{categoryGames.length}</span> {categoryGames.length === 1 ? 'jogo zerado' : 'jogos zerados'} 🎮
            </p>
          </div>
        )}
      </div>
    </div>
  );
}