import React from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, Star } from 'lucide-react';
import { categoryNames } from '../data/categories';

const getRatingColor = (rating) => {
  if (rating >= 9) return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30';
  if (rating >= 7) return 'text-cyan-400 bg-cyan-400/10 border-cyan-500/30';
  if (rating >= 5) return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30';
  return 'text-red-400 bg-red-400/10 border-red-500/30';
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
  
  // Ordenação para jogos zerados
  if (selectedCategory === 'zerados') {
    categoryGames = [...categoryGames].sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        if (ratingA === ratingB) return a.nome.localeCompare(b.nome);
        return ratingB - ratingA;
    });
  }

  // Componente de Cabeçalho com Botão "VOLTAR" bem visível
  const ListHeader = () => (
    <div className="flex items-center gap-4 mb-6 pt-2 relative z-50">
      <button
        onClick={() => setSelectedCategory(null)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 transition-all active:scale-95 shadow-lg cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-bold text-sm tracking-wide"></span>
      </button>
      <div className="flex-1 text-center">
        <h2 className="text-xl font-bold text-white drop-shadow-md truncate">{categoryName}</h2>
      </div>
    </div>
  );

  // Tela de Lista Vazia (O cabeçalho deve aparecer aqui também)
  if (categoryGames.length === 0) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 pb-20">
            <div className="max-w-md mx-auto">
                <ListHeader />
                <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold mb-2 text-gray-300">Lista Vazia</h3>
                    <p className="text-gray-400 px-4">
                        Nenhum jogo encontrado nesta categoria.
                    </p>
                </div>
            </div>
        </div>
    );
  }

  // Tela com Jogos
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 pb-20">
      <div className="max-w-md mx-auto">
        <ListHeader />

        <div className="space-y-3 relative z-10">
          {categoryGames.map((game) => {
            const isFinished = game.status === 'zerados';
            
            return (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className={`w-full backdrop-blur-md rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left shadow-sm ${
                  isFinished 
                    ? 'bg-green-500/10 border-green-500/40 hover:bg-green-500/20' 
                    : 'bg-gray-800/60 border-gray-700 hover:border-gray-500 hover:bg-gray-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left flex-1 min-w-0 pr-2">
                    <h3 className={`font-semibold text-lg mb-1 truncate ${isFinished ? 'text-green-400' : 'text-white'}`}>
                      {game.nome}
                    </h3>
                    
                    <div className="flex items-center flex-wrap gap-3 text-sm text-gray-400">
                      <span>{game.platform}</span>
                      
                      {isFinished && game.rating && (
                        <span className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-xs border ${getRatingColor(game.rating)}`}>
                          <Star className="w-3 h-3 fill-current" />
                          <span>{game.rating}</span>
                        </span>
                      )}

                      {game.timeToBeat > 0 && !isFinished && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {game.timeToBeat}h
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isFinished && (
                        <CheckCircle className='w-5 h-5 text-green-500' />
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}