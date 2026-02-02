// src/components/GameDetail.jsx
import React from 'react';
import { ChevronLeft, CheckCircle, Zap, Gamepad, Edit, Trash, Star, MoveRight } from 'lucide-react'; 
import { categoryNames, categoryColors, categoryIcons } from '../data/categories';

// Função auxiliar segura
const getCleanCategoryName = (name) => {
    if (!name) return ""; // Proteção contra crash
    return name
        .replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, '') // Mantém letras (incluindo acentos) e espaços
        .replace(/\(.*\)/, '')       
        .trim();                     
};

export default function GameDetail({
  selectedGame,
  setSelectedGame,
  handleUpdateGameStatus,
  handleDeleteGame, 
  openEditModal,    
  openReviewModal, 
}) {
  
  const currentStatus = selectedGame.status;
  
  // ATUALIZADO: Agora lista as categorias novas do Kanban + Desejados
  const statusOptions = [
    { id: 'playing', label: categoryNames.playing, color: 'bg-orange-600 hover:bg-orange-500' },
    { id: 'installed', label: categoryNames.installed, color: 'bg-blue-600 hover:bg-blue-500' },
    { id: 'backlog', label: categoryNames.backlog, color: 'bg-purple-600 hover:bg-purple-500' },
    { id: 'desejados', label: categoryNames.desejados, color: 'bg-yellow-600 hover:bg-yellow-500' },
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
    
    // Se está zerado, volta para 'playing' (ou o status original)
    const newStatus = selectedGame.originalStatus || 'playing'; 
    
    // Remove a nota e o review ao desmarcar como zerado
    const gameToUpdate = { ...selectedGame, rating: null, reviewText: "" };
    handleUpdateGameStatus(selectedGame.id, newStatus, gameToUpdate);
    setSelectedGame({ ...gameToUpdate, status: newStatus }); 
  };
  
  const handleMoveToStatus = (newStatus) => {
    let gameToUpdate = selectedGame;
    if (selectedGame.status === 'zerados') {
        gameToUpdate = { ...selectedGame, rating: null, reviewText: "" };
    }
    handleUpdateGameStatus(selectedGame.id, newStatus, gameToUpdate);
    setSelectedGame(null); // Fecha o detalhe após mover
  };
  
  const CurrentIcon = categoryIcons[currentStatus];

  const handleRemove = () => {
      if (window.confirm(`Tem certeza que deseja remover o jogo "${selectedGame.nome}" do seu backlog?`)) {
          handleDeleteGame(selectedGame.id);
          setSelectedGame(null); 
      }
  };

  // Filtra para não mostrar o botão do status atual nem 'zerados' (que tem botão próprio)
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
          <h2 className="text-lg font-bold text-center flex-1 truncate px-2">{selectedGame.nome}</h2>
          
          {/* Botões de Ação */}
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

        {/* Game Image Card */}
        <div className="mb-6 rounded-2xl overflow-hidden shadow-xl border border-gray-700 bg-gray-800 h-48 md:h-64 flex items-center justify-center relative group">
            {selectedGame.imageBase64 ? ( 
                <img
                    src={selectedGame.imageBase64} 
                    alt={`Capa do jogo ${selectedGame.nome}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                 <Gamepad className="w-20 h-20 text-gray-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
            
            {/* Badge de Status flutuante */}
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-xs border border-white/10 flex items-center gap-2">
                 {CurrentIcon && <CurrentIcon className="w-3 h-3 text-cyan-400" />}
                 {categoryNames[currentStatus]}
            </div>
        </div>

        {/* Game Info Card */}
        <div className={`bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700 mb-6`}>
          
          {/* Se estiver Zerado, mostra a Nota com destaque */}
          {isFinished && selectedGame.rating !== null && (
            <div className="flex flex-col items-center justify-center py-4 border-b border-gray-700 mb-4 bg-green-500/10 rounded-xl border-dashed border-green-500/30">
                <div className='flex items-center gap-2 mb-1'>
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <span className="text-4xl font-bold text-white tracking-tighter">
                        {selectedGame.rating}
                    </span>
                    <span className="text-xl text-gray-400 mt-2">/10</span>
                </div>
                <span className="text-xs text-green-400 uppercase tracking-widest font-bold">Avaliação Final</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-center border-b border-gray-700 pb-4 mb-4">
            <div>
              <div className="text-lg font-bold text-cyan-400 truncate">{selectedGame.platform}</div>
              <div className="text-xs text-gray-400">Plataforma</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400 truncate">
                {selectedGame.genre}
              </div>
              <div className="text-xs text-gray-400">Gênero</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">{selectedGame.timeToBeat}h</div>
              <div className="text-xs text-gray-400">Tempo Médio</div>
            </div>
          </div>
          
          {/* Notas Pessoais */}
          {selectedGame.notes && selectedGame.notes.trim() && (
            <div className='p-4 bg-gray-700/30 rounded-xl mb-4 border border-gray-700'>
              <p className='text-xs text-gray-400 font-bold uppercase mb-2 tracking-wider'>Suas Anotações</p>
              <p className='text-gray-200 text-sm leading-relaxed'>{selectedGame.notes}</p>
            </div>
          )}

          {/* Review Final */}
          {isFinished && selectedGame.reviewText && selectedGame.reviewText.trim() && (
            <div className='p-4 bg-green-900/20 border border-green-500/30 rounded-xl'>
              <p className='text-xs text-green-400 font-bold uppercase mb-2 tracking-wider flex items-center gap-2'>
                <CheckCircle className='w-3 h-3' />
                Review Final
              </p>
              <p className='text-gray-200 text-sm leading-relaxed italic'>"{selectedGame.reviewText}"</p>
            </div>
          )}
        </div>
        
        {/* Ação Principal: Zerar/Deszerar */}
        <button
          onClick={handleFinishToggle}
          className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 ${finishButtonColor} mb-6`}
        >
          <CheckCircle className="w-6 h-6" />
          {isFinished ? 'Desmarcar como Zerado' : 'CONCLUIR JOGO!'}
        </button>
        
        {/* Mover Status */}
        <div className='bg-gray-800/50 backdrop-blur rounded-2xl p-5 border border-gray-700 mb-6'>
          <h3 className='font-semibold text-sm text-gray-400 uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-2'>
            <MoveRight className="w-4 h-4" />
            Mover para...
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {filteredMoveOptions.map(opt => (
              <button 
                key={opt.id}
                onClick={() => handleMoveToStatus(opt.id)}
                className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 text-white shadow-sm ${opt.color}`}
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