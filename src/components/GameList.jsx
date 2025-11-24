import React from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { categoryNames } from '../data/categories';

export default function GameList({ 
  selectedCategory, 
  setSelectedCategory, 
  games, // Jogos agrupados
  setSelectedGame, 
}) {
  const categoryGames = games[selectedCategory] || [];
  const categoryName = categoryNames[selectedCategory] || 'Categoria Desconhecida';
  
  // Exibe mensagem se a lista estiver vazia
  if (categoryGames.length === 0) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 pb-20">
            <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="p-2 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold">{categoryName}</h2>
                    <div className="w-9" />
                </div>
                <div className="text-center py-20 bg-gray-800/50 rounded-2xl border border-gray-700">
                    <h3 className="text-xl font-semibold mb-2 text-gray-300">Lista Vazia</h3>
                    <p className="text-gray-400">
                        Adicione um jogo a esta categoria na tela inicial.
                    </p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className="p-2 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">{categoryName}</h2>
          <div className="w-9" />
        </div>

        <div className="space-y-3">
          {categoryGames.map((game) => {
            const isFinished = game.status === 'zerados';
            
            return (
              <button
                key={game.id} // Chave baseada no ID do Firebase
                onClick={() => setSelectedGame(game)}
                className={`w-full backdrop-blur rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-left ${
                  isFinished 
                    ? 'bg-green-500/20 border-green-500/50 opacity-90' 
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left flex-1">
                    <h3 className={`font-semibold text-lg mb-1 ${isFinished ? 'text-green-400' : 'text-white'}`}>{game.nome}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>{game.platform}</span>
                      <span>• {game.genre}</span>
                      {game.timeToBeat > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {game.timeToBeat}h
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isFinished && (
                        <div className='flex items-center gap-2 text-green-400'>
                            <CheckCircle className='w-5 h-5' />
                            <span>Zerado!</span>
                        </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
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