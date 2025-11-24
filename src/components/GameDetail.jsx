// src/components/GameDetail.jsx
import React from 'react';
import { ChevronLeft, CheckCircle, Zap, Gamepad, Edit, Trash, Star } from 'lucide-react'; 
import { categoryNames, categoryColors, categoryIcons } from '../data/categories';

// Função auxiliar para limpar o nome da categoria
const getCleanCategoryName = (name) => {
    return name
        .replace(/[^a-zA-Z\s]/g, '') 
        .replace(/\(.*\)/, '')       
        .trim();                     
};

export default function GameDetail({
  selectedGame,
  setSelectedGame,
  handleUpdateGameStatus,
  handleDeleteGame, 
  openEditModal,    
  openReviewModal, // NOVA PROP
}) {
  
  const currentStatus = selectedGame.status;
  
  // Statuses disponíveis para mover o jogo
  const statusOptions = [
    { id: 'jogando', label: categoryNames.jogando, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'desejados', label: categoryNames.desejados, color: 'bg-yellow-500 hover:bg-yellow-600' },
  ];
  
  const isFinished = currentStatus === 'zerados';
  const finishButtonColor = isFinished 
    ? 'bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30' 
    : 'bg-green-500 hover:bg-green-600';
  
  const handleFinishToggle = () => {
    // Se o jogo NÃO está zerado e queremos marcar, ABRE O MODAL DE REVIEW
    if (!isFinished) {
        openReviewModal(selectedGame);
        return;
    } 
    
    // Se está zerado, volta para 'jogando' (ação de desmarcar)
    const newStatus = selectedGame.originalStatus || 'jogando'; 
    
    // Remove a nota e o review ao desmarcar como zerado
    const gameToUpdate = { ...selectedGame, rating: null, reviewText: "" };
    handleUpdateGameStatus(selectedGame.id, newStatus, gameToUpdate);
    setSelectedGame({ ...gameToUpdate, status: newStatus }); 
  };
  
  const handleMoveToStatus = (newStatus) => {
    // Se estiver movendo de zerado para outro status, limpa a review
    let gameToUpdate = selectedGame;
    if (selectedGame.status === 'zerados') {
        gameToUpdate = { ...selectedGame, rating: null, reviewText: "" };
    }
    handleUpdateGameStatus(selectedGame.id, newStatus, gameToUpdate);
    setSelectedGame(null); 
  };
  
  const CurrentIcon = categoryIcons[currentStatus];

  // Handler para remoção com confirmação
  const handleRemove = () => {
      if (window.confirm(`Tem certeza que deseja remover o jogo "${selectedGame.nome}" do seu backlog?`)) {
          handleDeleteGame(selectedGame.id);
          setSelectedGame(null); 
      }
  };

  // Filtra as opções de mover para remover o status atual e 'zerados'
  const filteredMoveOptions = statusOptions.filter(opt => opt.id !== currentStatus && opt.id !== 'zerados');


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
          
          {/* Botões de Ação de Detalhe */}
          <div className='flex gap-2'>
            <button
                onClick={openEditModal}
                className="p-2 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-blue-500 text-blue-400 transition-all"
            >
                <Edit className="w-5 h-5" />
            </button>
            <button
                onClick={handleRemove}
                className="p-2 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-red-500 text-red-400 transition-all"
            >
                <Trash className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Image Card (USANDO BASE64) */}
        <div className="mb-6 rounded-2xl overflow-hidden shadow-xl border border-gray-700 bg-gray-800 h-40 flex items-center justify-center">
            {selectedGame.imageBase64 ? ( 
                <img
                    src={selectedGame.imageBase64} 
                    alt={`Capa do jogo ${selectedGame.nome}`}
                    className="w-full h-full object-cover"
                />
            ) : (
                 <Gamepad className="w-16 h-16 text-gray-600" />
            )}
        </div>

        {/* Game Info Card */}
        <div className={`bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700 mb-6`}>
          <div className="text-center mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 
                bg-gradient-to-r ${categoryColors[currentStatus] || 'from-gray-500 to-gray-400'}`}>
              {CurrentIcon && <CurrentIcon className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-semibold mb-2">{selectedGame.nome}</h3>
          </div>

          {/* Se estiver Zerado, mostra a Nota */}
          {isFinished && selectedGame.rating !== null && (
            <div className="flex items-center justify-center gap-3 py-2 border-b border-gray-700 mb-4">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span className="text-3xl font-bold text-white">
                    {selectedGame.rating}
                </span>
                <span className="text-lg text-gray-400">/ 10</span>
            </div>
          )}

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
          
          {/* Notas - Exibição Condicional (Original) */}
          {selectedGame.notes && selectedGame.notes.trim() && (
            <div className='p-3 bg-gray-700/50 rounded-xl mb-4'>
              <p className='text-sm text-gray-400 font-semibold mb-1'>Notas:</p>
              <p className='text-white text-base'>{selectedGame.notes}</p>
            </div>
          )}

          {/* Review/Comentário Final (NOVO) */}
          {isFinished && selectedGame.reviewText && selectedGame.reviewText.trim() && (
            <div className='p-3 bg-green-900/40 border border-green-500/50 rounded-xl'>
              <p className='text-sm text-green-400 font-semibold mb-1 flex items-center gap-2'>
                <CheckCircle className='w-4 h-4' />
                Review Final:
              </p>
              <p className='text-white text-base'>{selectedGame.reviewText}</p>
            </div>
          )}
        </div>
        
        {/* Ação Principal: Zerar/Deszerar */}
        <button
          onClick={handleFinishToggle}
          className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 ${finishButtonColor} mb-4`}
        >
          <CheckCircle className="w-5 h-5" />
          {isFinished ? '✓ Jogo Zerado (Desmarcar)' : 'Marcar como Zerado'}
        </button>
        
        {/* Mover Status (para outras categorias) */}
        <div className='bg-gray-800/50 backdrop-blur rounded-2xl p-5 border border-gray-700 mb-6'>
          <h3 className='font-semibold text-lg mb-4 text-center'>Mover Jogo</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {filteredMoveOptions.map(opt => (
              <button 
                key={opt.id}
                onClick={() => handleMoveToStatus(opt.id)}
                className={`py-2 px-4 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white`}
              >
                {getCleanCategoryName(opt.label)}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}