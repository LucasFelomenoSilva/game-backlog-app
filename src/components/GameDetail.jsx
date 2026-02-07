import React from 'react';
import { ChevronLeft, CheckCircle, Zap, Gamepad, Edit, Trash, Star, MoveRight, Share2, Clock } from 'lucide-react'; 
import { categoryNames, categoryIcons } from '../data/categories';
import { toast } from 'react-hot-toast';

// Função auxiliar segura
const getCleanCategoryName = (name) => {
    if (!name) return "";
    return name
        .replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, '')
        .replace(/\(.*\)/, '')       
        .trim();                     
};

// Cores dinâmicas para a nota (Igual à GameList)
const getRatingColor = (rating) => {
  if (rating >= 9) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'; 
  if (rating >= 7) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';       
  if (rating >= 5) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';   
  return 'text-red-400 border-red-500/30 bg-red-500/10';                          
};

// Classificação da duração do jogo
const getGameLengthLabel = (hours) => {
    if (!hours) return null;
    if (hours <= 5) return { label: 'Curto', color: 'text-green-400' };
    if (hours <= 15) return { label: 'Médio', color: 'text-blue-400' };
    if (hours <= 40) return { label: 'Longo', color: 'text-purple-400' };
    return { label: 'Épico', color: 'text-orange-400' };
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
    if (!isFinished) {
        openReviewModal(selectedGame);
        return;
    } 
    const newStatus = selectedGame.originalStatus || 'playing'; 
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
    setSelectedGame(null); 
  };
  
  const handleShare = async () => {
    const text = isFinished 
        ? `Acabei de zerar ${selectedGame.nome} no meu Backlog! Minha nota: ${selectedGame.rating}/10 🎮`
        : `Estou jogando ${selectedGame.nome} e organizando meu backlog! 🎮`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Meu Game Backlog',
                text: text,
            });
        } catch (error) {
            console.log('Erro ao compartilhar', error);
        }
    } else {
        navigator.clipboard.writeText(text);
        toast.success('Texto copiado para a área de transferência!');
    }
  };

  const handleRemove = () => {
      if (window.confirm(`Tem certeza que deseja remover o jogo "${selectedGame.nome}" do seu backlog?`)) {
          handleDeleteGame(selectedGame.id);
          setSelectedGame(null); 
      }
  };

  const CurrentIcon = categoryIcons[currentStatus];
  const filteredMoveOptions = statusOptions.filter(opt => opt.id !== currentStatus && opt.id !== 'zerados');
  const lengthInfo = getGameLengthLabel(selectedGame.timeToBeat);

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
          
          <div className="flex gap-2">
             {/* Botão de Share */}
             <button
                onClick={handleShare}
                className="p-2 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-green-500 text-green-400 transition-all"
                title="Compartilhar"
            >
                <Share2 className="w-5 h-5" />
            </button>
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
        <div className="mb-6 rounded-3xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-800 h-56 md:h-72 flex items-center justify-center relative group">
            {selectedGame.imageBase64 ? ( 
                <img
                    src={selectedGame.imageBase64} 
                    alt={`Capa do jogo ${selectedGame.nome}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            ) : (
                 <Gamepad className="w-24 h-24 text-gray-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
            
            <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 bg-black/60 backdrop-blur rounded-full text-xs border border-white/10 flex items-center gap-2 uppercase tracking-wide font-bold`}>
                        {CurrentIcon && <CurrentIcon className="w-3 h-3 text-cyan-400" />}
                        {categoryNames[currentStatus]}
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-white leading-tight shadow-black drop-shadow-lg">
                    {selectedGame.nome}
                </h1>
            </div>
        </div>

        {/* Game Info Card */}
        <div className={`bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700 mb-6 shadow-lg`}>
          
          {/* Se estiver Zerado, mostra a Nota com destaque e cores dinâmicas */}
          {isFinished && selectedGame.rating !== null && (
            <div className={`flex flex-col items-center justify-center py-6 border-b border-gray-700 mb-6 rounded-2xl border-dashed ${getRatingColor(selectedGame.rating)} bg-opacity-10`}>
                <div className='flex items-center gap-2 mb-1'>
                    <Star className={`w-8 h-8 fill-current`} />
                    <span className="text-5xl font-extrabold tracking-tighter">
                        {selectedGame.rating}
                    </span>
                    <span className="text-xl opacity-70 mt-3">/10</span>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] font-bold opacity-80">Avaliação Final</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-center border-b border-gray-700 pb-6 mb-6">
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center mb-2">
                <Gamepad className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-sm font-bold text-gray-200 truncate w-full">{selectedGame.platform}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Plataforma</div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-2">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-sm font-bold text-gray-200 truncate w-full">{selectedGame.genre}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Gênero</div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-sm font-bold text-gray-200">{selectedGame.timeToBeat}h</div>
              {lengthInfo && (
                  <div className={`text-[10px] uppercase tracking-wider font-bold ${lengthInfo.color}`}>{lengthInfo.label}</div>
              )}
            </div>
          </div>
          
          {/* Notas Pessoais */}
          {selectedGame.notes && selectedGame.notes.trim() && (
            <div className='p-5 bg-gray-900/50 rounded-2xl mb-4 border border-gray-700/50'>
              <p className='text-xs text-gray-400 font-bold uppercase mb-3 tracking-wider flex items-center gap-2'>
                <Edit className="w-3 h-3" />
                Suas Anotações
              </p>
              <p className='text-gray-300 text-sm leading-relaxed whitespace-pre-line'>{selectedGame.notes}</p>
            </div>
          )}

          {/* Review Final */}
          {isFinished && selectedGame.reviewText && selectedGame.reviewText.trim() && (
            <div className='p-5 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-2xl'>
              <p className='text-xs text-green-400 font-bold uppercase mb-3 tracking-wider flex items-center gap-2'>
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
        <div className='bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700 mb-6'>
          <h3 className='font-semibold text-xs text-gray-400 uppercase tracking-widest mb-4 text-center flex items-center justify-center gap-2'>
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