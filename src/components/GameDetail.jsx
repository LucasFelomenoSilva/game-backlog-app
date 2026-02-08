import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  CheckCircle,
  Zap,
  Gamepad2,
  Edit3,
  Trash2,
  Star,
  Share2,
  Clock,
  ArrowRightLeft,
  Quote,
  Trophy
} from "lucide-react";
import { categoryNames, categoryIcons } from "../data/categories";
import { toast } from "react-hot-toast";

// --- Utilitários ---
const getCleanCategoryName = (name) => {
  if (!name) return "";
  return name
    .replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, "")
    .replace(/\(.*\)/, "")
    .trim();
};

const getRatingColor = (rating) => {
  if (rating >= 9) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
  if (rating >= 7) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]";
  if (rating >= 5) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  return "text-red-400 bg-red-500/10 border-red-500/30";
};

const getGameLengthInfo = (hours) => {
  if (!hours) return null;
  if (hours <= 5) return { label: "Curto", color: "text-green-400", bg: "bg-green-500/20" };
  if (hours <= 15) return { label: "Médio", color: "text-blue-400", bg: "bg-blue-500/20" };
  if (hours <= 40) return { label: "Longo", color: "text-purple-400", bg: "bg-purple-500/20" };
  return { label: "Épico", color: "text-orange-400", bg: "bg-orange-500/20" };
};

export default function GameDetail({
  selectedGame,
  setSelectedGame,
  handleUpdateGameStatus,
  handleDeleteGame,
  openEditModal,
  openReviewModal,
}) {
  const [animate, setAnimate] = useState(false);
  const currentStatus = selectedGame.status;

  useEffect(() => {
    setAnimate(true);
  }, []);

  const statusOptions = [
    { id: "playing", label: categoryNames.playing, color: "text-orange-400 border-orange-500/30 hover:bg-orange-500/10" },
    { id: "installed", label: categoryNames.installed, color: "text-blue-400 border-blue-500/30 hover:bg-blue-500/10" },
    { id: "backlog", label: categoryNames.backlog, color: "text-purple-400 border-purple-500/30 hover:bg-purple-500/10" },
    { id: "desejados", label: categoryNames.desejados, color: "text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10" },
  ];

  const isFinished = currentStatus === "zerados";
  
  const finishButtonConfig = isFinished
    ? { 
        text: "Reabrir Jogo", 
        icon: ArrowRightLeft, 
        style: "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700" 
      }
    : { 
        text: "ZERAR JOGO!", 
        icon: Trophy, 
        style: "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-900/50 hover:scale-[1.02] border-none" 
      };

  const handleFinishToggle = () => {
    if (!isFinished) {
      openReviewModal(selectedGame);
      return;
    }
    const newStatus = selectedGame.originalStatus || "playing";
    const gameToUpdate = { ...selectedGame, rating: null, reviewText: "" };
    handleUpdateGameStatus(selectedGame.id, newStatus, gameToUpdate);
    setSelectedGame({ ...gameToUpdate, status: newStatus });
  };

  const handleMoveToStatus = (newStatus) => {
    let gameToUpdate = selectedGame;
    if (selectedGame.status === "zerados") {
      gameToUpdate = { ...selectedGame, rating: null, reviewText: "" };
    }
    handleUpdateGameStatus(selectedGame.id, newStatus, gameToUpdate);
    setSelectedGame(null);
  };

  const handleShare = async () => {
    const text = isFinished
      ? `🏆 Zerei ${selectedGame.nome}!\nNota: ${selectedGame.rating}/10\nvia Game Backlog App`
      : `🎮 Jogando: ${selectedGame.nome}\nvia Game Backlog App`;

    if (navigator.share) {
      try { await navigator.share({ title: "Game Backlog", text: text }); } 
      catch (e) { console.log(e); }
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copiado para a área de transferência!");
    }
  };

  const handleRemove = () => {
    if (window.confirm(`Remover "${selectedGame.nome}" da sua coleção?`)) {
      handleDeleteGame(selectedGame.id);
    }
  };

  const CurrentCategoryIcon = categoryIcons[currentStatus];
  const lengthInfo = getGameLengthInfo(selectedGame.timeToBeat);
  const filteredMoveOptions = statusOptions.filter(opt => opt.id !== currentStatus && opt.id !== "zerados");

  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden pb-24">
      
      {/* --- BACKGROUND DINÂMICO --- */}
      <div className="fixed inset-0 z-0">
        {selectedGame.imageBase64 ? (
            <img 
                src={selectedGame.imageBase64} 
                alt="bg" 
                className="w-full h-full object-cover opacity-20 blur-2xl scale-110"
            />
        ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
      </div>

      <div className={`relative z-10 max-w-lg mx-auto p-4 transition-opacity duration-700 ${animate ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* --- HEADER FIXO COM BOTÃO VOLTAR EXPLÍCITO --- */}
        <div className="flex items-center justify-between mb-8 sticky top-0 z-50 py-3 bg-gray-950/80 backdrop-blur-xl -mx-4 px-4 border-b border-white/5 shadow-lg">
          <button
            onClick={() => setSelectedGame(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/80 hover:bg-gray-700 border border-white/10 transition-all active:scale-95 group text-white shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold tracking-wide">Voltar</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={openEditModal}
              className="p-2.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all active:scale-90"
              title="Editar"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-gray-700/50 text-gray-300 border border-white/10 hover:bg-gray-600 hover:text-white transition-all active:scale-90"
              title="Compartilhar"
            >
              <Share2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleRemove}
              className="p-2.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-90"
              title="Excluir"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <div className="flex flex-col items-center mb-8">
            {/* Capa do Jogo */}
            <div className="relative group">
                <div className="w-48 h-64 md:w-56 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 relative z-10 bg-gray-800">
                    {selectedGame.imageBase64 ? (
                        <img 
                            src={selectedGame.imageBase64} 
                            alt={selectedGame.nome} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Gamepad2 className="w-16 h-16 text-gray-600" />
                        </div>
                    )}
                </div>
                {/* Efeito Glow */}
                <div className="absolute -inset-4 bg-cyan-500/20 blur-3xl -z-10 rounded-full opacity-50 pointer-events-none" />
            </div>

            <h1 className="text-3xl font-extrabold text-center mt-6 text-white drop-shadow-lg leading-tight px-2">
                {selectedGame.nome}
            </h1>

            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur">
                {CurrentCategoryIcon && <CurrentCategoryIcon className="w-4 h-4 text-cyan-400" />}
                <span className="text-sm font-bold tracking-wide uppercase text-gray-300">
                    {categoryNames[currentStatus]}
                </span>
            </div>
        </div>

        {/* --- GRID INFO --- */}
        <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <div className="mb-2 p-2 rounded-full bg-purple-500/20 text-purple-400">
                    <Zap className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Gênero</span>
                <span className="font-semibold text-gray-200 text-sm truncate w-full px-2">{selectedGame.genre || "-"}</span>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <div className="mb-2 p-2 rounded-full bg-cyan-500/20 text-cyan-400">
                    <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Plataforma</span>
                <span className="font-semibold text-gray-200 text-sm truncate w-full px-2">{selectedGame.platform || "-"}</span>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
                <div className="mb-2 p-2 rounded-full bg-green-500/20 text-green-400">
                    <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Tempo de Jogo</span>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-200">{selectedGame.timeToBeat ? `${selectedGame.timeToBeat}h` : "-"}</span>
                    {lengthInfo && (
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${lengthInfo.color} ${lengthInfo.bg}`}>
                            {lengthInfo.label}
                        </span>
                    )}
                </div>
            </div>

            {/* Avaliação (Zerados) */}
            {isFinished && (
                <div className={`backdrop-blur-md border rounded-2xl p-4 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1 ${getRatingColor(selectedGame.rating || 0)}`}>
                    <div className="flex items-center gap-1 mb-1">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="text-2xl font-black">{selectedGame.rating || "?"}</span>
                        <span className="text-sm opacity-70">/10</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Sua Nota</span>
                </div>
            )}
        </div>

        {/* --- REVIEW & ANOTAÇÕES --- */}
        <div className="space-y-4 mb-8">
            {isFinished && selectedGame.reviewText && (
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur border border-green-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg">
                    <Quote className="absolute top-4 right-4 w-8 h-8 text-green-500/10" />
                    <h3 className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Review Final
                    </h3>
                    <p className="text-gray-300 italic text-sm leading-relaxed">"{selectedGame.reviewText}"</p>
                </div>
            )}

            {selectedGame.notes && (
                <div className="bg-gray-800/40 backdrop-blur border border-white/5 rounded-2xl p-5">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Edit3 className="w-4 h-4" /> Notas Pessoais
                    </h3>
                    <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{selectedGame.notes}</p>
                </div>
            )}
        </div>

        {/* --- BOTÃO DE AÇÃO PRINCIPAL --- */}
        <button
            onClick={handleFinishToggle}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all mb-8 shadow-xl active:scale-[0.98] ${finishButtonConfig.style}`}
        >
            <finishButtonConfig.icon className="w-6 h-6" />
            {finishButtonConfig.text}
        </button>

        {/* --- MOVER JOGO --- */}
        <div className="border-t border-white/10 pt-6 pb-4">
            <h3 className="text-center text-xs text-gray-500 uppercase font-bold tracking-widest mb-4 flex items-center justify-center gap-2">
                <ArrowRightLeft className="w-3 h-3" />
                Mover status para
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
                {filteredMoveOptions.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleMoveToStatus(opt.id)}
                        className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase transition-all duration-300 ${opt.color} hover:text-white border-current bg-transparent hover:shadow-lg active:scale-95`}
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