import React from 'react';
import { ChevronLeft, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import { categoryNames, categoryColors, categoryIcons } from '../data/categories';

export default function GameDetail({
  selectedGame,
  setSelectedGame,
  handleUpdateGameStatus,
  // openGeminiQuest, // REMOVIDO
}) {
  
  const currentStatus = selectedGame.status;
  
  const statusOptions = [
    { id: 'jogando', label: categoryNames.jogando, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'a_zerar', label: categoryNames.a_zerar, color: 'bg-purple-500 hover:bg-purple-600' },
    { id: 'desejados', label: categoryNames.desejados, color: 'bg-yellow-500 hover:bg-yellow-600' },
  ];
  
  const isFinished = currentStatus === 'zerados';
  const finishButtonColor = isFinished 
    ? 'bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30' 
    : 'bg-green-500 hover:bg-green-600';
  
  const handleFinishToggle = () => {
    // Se está zerado, volta para o status original (se houver), senão, marca como zerado.
    const newStatus = isFinished ? selectedGame.originalStatus || 'a_zerar' : 'zerados'; 
    handleUpdateGameStatus(selectedGame.id, newStatus);
    setSelectedGame({ ...selectedGame, status: newStatus }); // Atualiza localmente
  };
  
  const handleMoveToStatus = (newStatus) => {
    handleUpdateGameStatus(selectedGame.id, newStatus);
    // Para navegação suave, retorne à lista de jogos
    setSelectedGame(null); 
  };
  
  const CurrentIcon = categoryIcons[currentStatus];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedGame(null)}
            className="p-2 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-center flex-1">{selectedGame.nome}</h2>
          <div className="w-9" />
        </div>

        {/* Game Image Card (NOVO) */}
        {selectedGame.imageUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-xl border border-gray-700">
                <img
                    src={selectedGame.imageUrl}
                    alt={`Capa do jogo ${selectedGame.nome}`}
                    className="w-full h-40 object-cover"
                />
            </div>
        )}

        {/* Game Info Card */}
        <div className={`bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700 mb-6`}>
          <div className="text-center mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 
                bg-gradient-to-r ${categoryColors[currentStatus] || 'from-gray-500 to-gray-400'}`}>
              {CurrentIcon && <CurrentIcon className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-semibold mb-2">{selectedGame.nome}</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center border-b border-gray-700 pb-4 mb-4">
            <div>
              <div className="text-xl font-bold text-cyan-400">{selectedGame.platform}</div>
              <div className="text-xs text-gray-400">Plataforma</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-400">
                {selectedGame.genre}
              </div>
              <div className="text-xs text-gray-400">Gênero</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-400">{selectedGame.timeToBeat}h</div>
              <div className="text-xs text-gray-400">Tempo Médio</div>
            </div>
          </div>
          
          <div className='p-3 bg-gray-700/50 rounded-xl'>
            <p className='text-sm text-gray-400 font-semibold mb-1'>Notas:</p>
            <p className='text-white text-base'>{selectedGame.notes || 'Nenhuma nota adicionada.'}</p>
          </div>
        </div>
        
        {/* Ação Principal: Zerar/Deszerar */}
        <button
          onClick={handleFinishToggle}
          className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 ${finishButtonColor} mb-4`}
        >
          <CheckCircle className="w-5 h-5" />
          {isFinished ? '✓ Jogo Zerado (Desmarcar)' : 'Marcar como Zerado'}
        </button>
        
        {/* Botão Gemini Removido - Opcional: Adicionar um botão de placeholder se desejar */}
        {/* <button
          onClick={openGeminiQuest} // REMOVIDO: openGeminiQuest
          className="w-full flex items-center justify-center gap-3 p-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-2xl font-semibold text-yellow-400 transition-all duration-300 active:scale-[0.98] mb-6"
        >
          <Zap className="w-5 h-5" />
          Gerar Missão Surpresa Gemini
        </button> 
        */}


        {/* Mover Status (para outras categorias) */}
        <div className='bg-gray-800/50 backdrop-blur rounded-2xl p-5 border border-gray-700 mb-6'>
          <h3 className='font-semibold text-lg mb-4 text-center'>Mover Jogo</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {statusOptions.filter(opt => opt.id !== currentStatus && opt.id !== 'zerados').map(opt => (
              <button 
                key={opt.id}
                onClick={() => handleMoveToStatus(opt.id)}
                className={`py-2 px-4 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white`}
              >
                {opt.label.split(' ')[2].replace('(','').replace(')','')} 
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}