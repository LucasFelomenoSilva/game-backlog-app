import React, { useState } from "react";
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
  Award,
  Play,
  Bookmark,
  Heart,
} from "lucide-react";
import { categoryNames, categoryIcons } from "../data/categories";
import { toast } from "react-hot-toast";

const getCleanCategoryName = (name) => {
  if (!name) return "";
  return name
    .replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, "")
    .replace(/\(.*\)/, "")
    .trim();
};

const getRatingColor = (rating) => {
  if (rating >= 9) return "from-emerald-500 to-teal-500";
  if (rating >= 7) return "from-cyan-500 to-blue-500";
  if (rating >= 5) return "from-yellow-500 to-orange-500";
  return "from-red-500 to-pink-500";
};

const getRatingLabel = (rating) => {
  if (rating >= 9) return "Obra-prima";
  if (rating >= 7) return "Muito bom";
  if (rating >= 5) return "Razoável";
  return "Decepcionante";
};

const getGameLengthLabel = (hours) => {
  if (!hours) return null;
  if (hours <= 5) return { label: "Curto", color: "text-green-400", bar: "bg-green-500" };
  if (hours <= 15) return { label: "Médio", color: "text-blue-400", bar: "bg-blue-500" };
  if (hours <= 40) return { label: "Longo", color: "text-purple-400", bar: "bg-purple-500" };
  return { label: "Épico", color: "text-orange-400", bar: "bg-orange-500" };
};

export default function GameDetail({
  selectedGame,
  setSelectedGame,
  handleUpdateGameStatus,
  handleDeleteGame,
  openEditModal,
  openReviewModal,
}) {
  const [activeSection, setActiveSection] = useState("overview");
  const currentStatus = selectedGame.status;
  const isFinished = currentStatus === "zerados";
  const lengthInfo = getGameLengthLabel(selectedGame.timeToBeat);

  const statusOptions = [
    { id: "playing", label: categoryNames.playing, color: "from-orange-500 to-red-500", icon: "🎮" },
    { id: "installed", label: categoryNames.installed, color: "from-blue-500 to-cyan-500", icon: "💾" },
    { id: "backlog", label: categoryNames.backlog, color: "from-purple-500 to-pink-500", icon: "📚" },
    { id: "desejados", label: categoryNames.desejados, color: "from-yellow-500 to-amber-500", icon: "⭐" },
  ];

  const handleFinishToggle = () => {
    if (!isFinished) {
      openReviewModal(selectedGame);
      return;
    }
    const newStatus = selectedGame.originalStatus || "playing";
    const gameToUpdate = { ...selectedGame, rating: null, reviewText: "", isPlatinum: false };
    handleUpdateGameStatus(selectedGame.id, newStatus, gameToUpdate);
    setSelectedGame({ ...gameToUpdate, status: newStatus });
  };

  const handleMoveToStatus = (newStatus) => {
    let gameToUpdate = selectedGame;
    if (selectedGame.status === "zerados") {
      gameToUpdate = { ...selectedGame, rating: null, reviewText: "", isPlatinum: false };
    }
    handleUpdateGameStatus(selectedGame.id, newStatus, gameToUpdate);
    setSelectedGame(null);
  };

  const handleShare = async () => {
    const platinumText = selectedGame.isPlatinum ? " 🏆 PLATINA!" : "";
    const text = isFinished
      ? `Acabei de zerar ${selectedGame.nome}! Nota: ${selectedGame.rating}/10${platinumText} 🎮`
      : `Estou jogando ${selectedGame.nome} 🎮`;

    if (navigator.share) {
      try { await navigator.share({ title: "Game Backlog", text }); }
      catch (e) {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copiado!");
    }
  };

  const handleRemove = () => {
    if (window.confirm(`Remover "${selectedGame.nome}" do backlog?`)) {
      handleDeleteGame(selectedGame.id);
      setSelectedGame(null);
    }
  };

  const filteredMoveOptions = statusOptions.filter(
    (opt) => opt.id !== currentStatus && opt.id !== "zerados"
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-x-hidden">
      
      {/* ── BACKGROUND IMERSIVO ── */}
      {selectedGame.imageBase64 && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src={selectedGame.imageBase64}
            alt=""
            className="w-full h-full object-cover scale-110"
            style={{ filter: "blur(40px) saturate(0.4) brightness(0.15)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/80 to-gray-950" />
        </div>
      )}

      <div className="relative z-10">

        {/* ── HEADER FIXO ── */}
        <div className="sticky top-0 z-50 bg-gray-950/70 backdrop-blur-2xl border-b border-white/5">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSelectedGame(null)}
              className="group flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium hidden sm:block">Voltar</span>
            </button>

            {/* Status badge centro */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isFinished ? 'bg-green-400' :
                currentStatus === 'playing' ? 'bg-orange-400' :
                currentStatus === 'installed' ? 'bg-blue-400' : 'bg-purple-400'
              }`} />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                {getCleanCategoryName(categoryNames[currentStatus] || currentStatus)}
              </span>
            </div>

            {/* Ações */}
            <div className="flex gap-1.5">
              <button onClick={handleShare} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all hover:scale-110" title="Compartilhar">
                <Share2 className="w-4 h-4 text-gray-400 hover:text-green-400 transition-colors" />
              </button>
              <button onClick={openEditModal} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all hover:scale-110" title="Editar">
                <Edit className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
              </button>
              <button onClick={handleRemove} className="p-2 bg-white/5 hover:bg-red-500/20 rounded-xl border border-white/10 hover:border-red-500/30 transition-all hover:scale-110" title="Excluir">
                <Trash className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-28">

          {/* ── HERO SECTION ── */}
          <div className="pt-6 pb-8">
            <div className="flex gap-5 items-end">
              {/* Capa em destaque */}
              <div className="flex-shrink-0">
                <div className="relative w-32 sm:w-40">
                  {/* Glow atrás da capa */}
                  {selectedGame.imageBase64 && (
                    <div className="absolute -inset-2 rounded-2xl blur-xl opacity-40"
                      style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }} />
                  )}
                  <div className="relative w-32 sm:w-40 rounded-2xl overflow-hidden border border-white/20 shadow-2xl aspect-[3/4]">
                    {selectedGame.imageBase64 ? (
                      <img src={selectedGame.imageBase64} alt={selectedGame.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Gamepad className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Platina badge sobre a capa */}
                  {isFinished && selectedGame.isPlatinum && (
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-950 z-10">
                      <Trophy className="w-5 h-5 text-yellow-900 fill-yellow-900" />
                    </div>
                  )}
                </div>
              </div>

              {/* Título e meta-info */}
              <div className="flex-1 min-w-0 pb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                  {selectedGame.nome}
                </h1>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 bg-white/8 border border-white/10 rounded-lg text-xs font-semibold text-gray-300">
                    {selectedGame.platform}
                  </span>
                  <span className="px-2.5 py-1 bg-white/8 border border-white/10 rounded-lg text-xs font-semibold text-gray-400">
                    {selectedGame.genre}
                  </span>
                  {selectedGame.timeToBeat > 0 && (
                    <span className="px-2.5 py-1 bg-white/8 border border-white/10 rounded-lg text-xs font-semibold text-blue-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {selectedGame.timeToBeat}h
                    </span>
                  )}
                </div>

                {/* Rating grande se zerado */}
                {isFinished && selectedGame.rating != null && (
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r ${getRatingColor(selectedGame.rating)} rounded-xl shadow-lg`}>
                      <Star className="w-5 h-5 text-white fill-white" />
                      <span className="text-2xl font-black text-white">{selectedGame.rating}</span>
                      <span className="text-sm text-white/70">/10</span>
                    </div>
                    <span className="text-sm text-gray-400 font-medium">{getRatingLabel(selectedGame.rating)}</span>
                  </div>
                )}

                {/* Data de conclusão */}
                {isFinished && selectedGame.finishedDate && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Calendar className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-xs text-green-300 font-medium">
                      Zerado em {new Date(selectedGame.finishedDate).toLocaleDateString('pt-BR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── BOTÃO PRINCIPAL — CONCLUIR / DESMARCAR ── */}
          <button
            onClick={handleFinishToggle}
            className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] mb-6 shadow-xl ${
              isFinished
                ? "bg-white/5 border-2 border-red-500/40 text-red-300 hover:bg-red-500/10 hover:border-red-400/60"
                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400 shadow-green-500/30"
            }`}
          >
            {isFinished ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Desmarcar como Zerado
              </>
            ) : (
              <>
                <Trophy className="w-5 h-5" />
                CONCLUIR JOGO!
              </>
            )}
          </button>

          {/* ── TABS NAVEGAÇÃO ── */}
          {(selectedGame.notes || selectedGame.reviewText || isFinished) && (
            <div className="flex gap-1 p-1 bg-white/5 border border-white/8 rounded-2xl mb-6">
              {[
                { id: "overview", label: "Visão Geral" },
                ...(selectedGame.reviewText ? [{ id: "review", label: "Review" }] : []),
                ...(selectedGame.notes ? [{ id: "notes", label: "Anotações" }] : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeSection === tab.id
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* ── SEÇÃO: VISÃO GERAL ── */}
          {activeSection === "overview" && (
            <div className="space-y-4">

              {/* Stats visuais */}
              <div className="grid grid-cols-3 gap-3">
                {/* Plataforma */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300" />
                  <div className="relative bg-white/5 border border-white/8 rounded-2xl p-4 text-center hover:border-white/15 transition-all">
                    <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Gamepad className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs font-bold text-white truncate">{selectedGame.platform}</div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-0.5">Plataforma</div>
                  </div>
                </div>

                {/* Gênero */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300" />
                  <div className="relative bg-white/5 border border-white/8 rounded-2xl p-4 text-center hover:border-white/15 transition-all">
                    <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs font-bold text-white truncate">{selectedGame.genre}</div>
                    <div className="text-[9px] uppercase tracking-wider text-gray-500 mt-0.5">Gênero</div>
                  </div>
                </div>

                {/* Duração */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300" />
                  <div className="relative bg-white/5 border border-white/8 rounded-2xl p-4 text-center hover:border-white/15 transition-all">
                    <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs font-bold text-white">{selectedGame.timeToBeat || 0}h</div>
                    {lengthInfo && (
                      <div className={`text-[9px] uppercase tracking-wider mt-0.5 font-bold ${lengthInfo.color}`}>
                        {lengthInfo.label}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Platina destaque */}
              {isFinished && selectedGame.isPlatinum && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl blur opacity-40 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-yellow-500/15 to-amber-500/15 border-2 border-yellow-500/40 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
                      <Trophy className="w-8 h-8 text-yellow-900 fill-yellow-900" />
                    </div>
                    <div>
                      <p className="font-black text-yellow-300 text-base">🏆 PLATINADO!</p>
                      <p className="text-sm text-yellow-500/80">Todas as conquistas obtidas</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Barra de duração visual */}
              {selectedGame.timeToBeat > 0 && lengthInfo && (
                <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Duração estimada</span>
                    <span className={`text-xs font-black ${lengthInfo.color}`}>{selectedGame.timeToBeat}h — {lengthInfo.label}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${lengthInfo.bar} rounded-full transition-all duration-700 relative overflow-hidden`}
                      style={{ width: `${Math.min((selectedGame.timeToBeat / 100) * 100, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-1">
                    {[0, 25, 50, 75, "100+"].map((v) => (
                      <span key={v} className="text-[9px] text-gray-700">{v}h</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Mover para outra categoria */}
              <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MoveRight className="w-4 h-4 text-gray-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Mover para</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {filteredMoveOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleMoveToStatus(opt.id)}
                      className={`group py-3 px-3 bg-gradient-to-br ${opt.color} rounded-xl font-bold text-xs text-white hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg`}
                    >
                      <span className="text-base">{opt.icon}</span>
                      {getCleanCategoryName(opt.label)}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── SEÇÃO: REVIEW ── */}
          {activeSection === "review" && selectedGame.reviewText && (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-cyan-500 rounded-2xl blur opacity-20" />
              <div className="relative bg-white/5 border border-white/8 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-green-300">Review Final</h3>
                    {selectedGame.rating != null && (
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 10 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < selectedGame.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <blockquote className="text-gray-200 leading-relaxed italic text-lg border-l-2 border-green-500/40 pl-4">
                  "{selectedGame.reviewText}"
                </blockquote>
              </div>
            </div>
          )}

          {/* ── SEÇÃO: ANOTAÇÕES ── */}
          {activeSection === "notes" && selectedGame.notes && (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20" />
              <div className="relative bg-white/5 border border-white/8 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Edit className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-blue-300">Suas Anotações</h3>
                </div>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{selectedGame.notes}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}