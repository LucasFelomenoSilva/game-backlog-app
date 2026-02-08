import React from "react";
import {
  ChevronLeft,
  CheckCircle,
  Zap,
  Gamepad,
  Edit,
  Trash,
  Star,
  MoveRight,
  Share2,
  Clock,
  Trophy,
  Calendar,
} from "lucide-react";
import { categoryNames, categoryIcons } from "../data/categories";
import { toast } from "react-hot-toast";

// Função auxiliar segura
const getCleanCategoryName = (name) => {
  if (!name) return "";
  return name
    .replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, "")
    .replace(/\(.*\)/, "")
    .trim();
};

// Cores dinâmicas para a nota
const getRatingColor = (rating) => {
  if (rating >= 9) return "from-emerald-500 to-teal-500";
  if (rating >= 7) return "from-cyan-500 to-blue-500";
  if (rating >= 5) return "from-yellow-500 to-orange-500";
  return "from-red-500 to-pink-500";
};

// Classificação da duração do jogo
const getGameLengthLabel = (hours) => {
  if (!hours) return null;
  if (hours <= 5) return { label: "Curto", color: "text-green-400", bg: "bg-green-500/10" };
  if (hours <= 15) return { label: "Médio", color: "text-blue-400", bg: "bg-blue-500/10" };
  if (hours <= 40) return { label: "Longo", color: "text-purple-400", bg: "bg-purple-500/10" };
  return { label: "Épico", color: "text-orange-400", bg: "bg-orange-500/10" };
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
    {
      id: "playing",
      label: categoryNames.playing,
      color: "from-orange-500 to-red-500",
      icon: "🎮",
    },
    {
      id: "installed",
      label: categoryNames.installed,
      color: "from-blue-500 to-cyan-500",
      icon: "💾",
    },
    {
      id: "backlog",
      label: categoryNames.backlog,
      color: "from-purple-500 to-pink-500",
      icon: "📚",
    },
    {
      id: "desejados",
      label: categoryNames.desejados,
      color: "from-yellow-500 to-amber-500",
      icon: "⭐",
    },
  ];

  const isFinished = currentStatus === "zerados";
  
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
      ? `Acabei de zerar ${selectedGame.nome} no meu Backlog! Minha nota: ${selectedGame.rating}/10 🎮`
      : `Estou jogando ${selectedGame.nome} e organizando meu backlog! 🎮`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meu Game Backlog",
          text: text,
        });
      } catch (error) {
        console.log("Erro ao compartilhar", error);
      }
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Texto copiado para a área de transferência!");
    }
  };

  const handleRemove = () => {
    if (
      window.confirm(
        `Tem certeza que deseja remover o jogo "${selectedGame.nome}" do seu backlog?`,
      )
    ) {
      handleDeleteGame(selectedGame.id);
      setSelectedGame(null);
    }
  };

  const CurrentIcon = categoryIcons[currentStatus];
  const filteredMoveOptions = statusOptions.filter(
    (opt) => opt.id !== currentStatus && opt.id !== "zerados",
  );
  const lengthInfo = getGameLengthLabel(selectedGame.timeToBeat);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header Fixo com Gradient */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Botão Voltar */}
            <button
              onClick={() => setSelectedGame(null)}
              className="group flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl border border-gray-700/50 transition-all duration-300 hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Voltar</span>
            </button>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="group p-2.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-xl border border-green-500/30 transition-all duration-300 hover:scale-110"
                title="Compartilhar"
              >
                <Share2 className="w-5 h-5 text-green-400 group-hover:rotate-12 transition-transform" />
              </button>
              <button
                onClick={openEditModal}
                className="group p-2.5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-xl border border-blue-500/30 transition-all duration-300 hover:scale-110"
                title="Editar"
              >
                <Edit className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
              </button>
              <button
                onClick={handleRemove}
                className="group p-2.5 bg-gradient-to-br from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 rounded-xl border border-red-500/30 transition-all duration-300 hover:scale-110"
                title="Excluir"
              >
                <Trash className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Hero Card - Imagem e Título */}
        <div className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl">
          {/* Imagem de Fundo */}
          <div className="relative h-72 md:h-96">
            {selectedGame.imageBase64 ? (
              <>
                <img
                  src={selectedGame.imageBase64}
                  alt={`Capa do jogo ${selectedGame.nome}`}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <Gamepad className="w-32 h-32 text-gray-600 opacity-30" />
              </div>
            )}
            
            {/* Badge de Status - Flutuante */}
            <div className="absolute top-4 left-4">
              <div className="px-4 py-2 bg-gray-900/90 backdrop-blur-sm rounded-full border border-gray-700/50 flex items-center gap-2 shadow-lg">
                {CurrentIcon && <CurrentIcon className="w-4 h-4 text-cyan-400" />}
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  {categoryNames[currentStatus]}
                </span>
              </div>
            </div>

            {/* Rating Badge - Se zerado */}
            {isFinished && selectedGame.rating !== null && (
              <div className="absolute top-4 right-4">
                <div className={`px-4 py-2 bg-gradient-to-br ${getRatingColor(selectedGame.rating)} rounded-full shadow-lg flex items-center gap-1.5`}>
                  <Star className="w-4 h-4 text-white fill-white" />
                  <span className="text-lg font-black text-white">{selectedGame.rating}</span>
                  <span className="text-xs text-white/80">/10</span>
                </div>
              </div>
            )}
          </div>

          {/* Título Sobreposto */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-2xl">
              {selectedGame.nome}
            </h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Plataforma */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-transform">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Gamepad className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-bold text-white mb-1 truncate">
              {selectedGame.platform}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Plataforma
            </div>
          </div>

          {/* Gênero */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-transform">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-bold text-white mb-1 truncate">
              {selectedGame.genre}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Gênero
            </div>
          </div>

          {/* Duração */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4 text-center hover:scale-105 transition-transform">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-bold text-white mb-1">
              {selectedGame.timeToBeat}h
            </div>
            {lengthInfo && (
              <div className={`text-[10px] uppercase tracking-wider font-semibold ${lengthInfo.color}`}>
                {lengthInfo.label}
              </div>
            )}
          </div>
        </div>

        {/* Notas Pessoais */}
        {selectedGame.notes && selectedGame.notes.trim() && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700/50 rounded-2xl p-6 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                Suas Anotações
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {selectedGame.notes}
            </p>
          </div>
        )}

        {/* Review Final */}
        {isFinished && selectedGame.reviewText && selectedGame.reviewText.trim() && (
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 mb-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-green-300">
                Review Final
              </h3>
            </div>
            <p className="text-gray-200 leading-relaxed italic text-lg">
              "{selectedGame.reviewText}"
            </p>
          </div>
        )}

        {/* Botão de Conclusão */}
        <button
          onClick={handleFinishToggle}
          className={`w-full py-5 rounded-2xl font-bold text-lg shadow-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] mb-8 ${
            isFinished
              ? "bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-500/50 text-red-300 hover:from-red-500/30 hover:to-pink-500/30"
              : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
          }`}
        >
          {isFinished ? (
            <>
              <CheckCircle className="w-6 h-6" />
              Desmarcar como Zerado
            </>
          ) : (
            <>
              <Trophy className="w-6 h-6" />
              CONCLUIR JOGO!
            </>
          )}
        </button>

        {/* Mover para outra categoria */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-6">
            <MoveRight className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300">
              Mover para...
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filteredMoveOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleMoveToStatus(opt.id)}
                className={`group py-4 px-4 bg-gradient-to-br ${opt.color} rounded-xl font-bold text-sm text-white shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2`}
              >
                <span className="text-lg">{opt.icon}</span>
                {getCleanCategoryName(opt.label)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}