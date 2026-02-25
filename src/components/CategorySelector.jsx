// src/components/CategorySelector.jsx  (ATUALIZADO)
import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { categoryNames, categoryIcons } from '../data/categories';
import { Plus, Trophy, Gamepad2, ChevronRight, Star, Flame } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlobalSearch from './GlobalSearch';
import NextGameSuggestion from './NextGameSuggestion';
import FocusMode from './FocusMode';

export default function CategorySelector({
  games,
  setSelectedCategory,
  setSelectedGame,
  getCategoryProgress,
  user,
  totalFinishedGames,
  setIsAddGameModalOpen,
  openReviewModal,
  gamesData = [],
}) {

  const [focusGame, setFocusGame] = useState(null);

  // Backlog Buster
  const handleRandomPick = () => {
    const playableGames = [
      ...(games['playing']  || []),
      ...(games['installed'] || []),
      ...(games['backlog']  || []),
    ];
    if (!playableGames.length) { toast.error("Adicione jogos ao backlog primeiro!"); return; }
    const toastId = toast.loading('Rolando os dados do destino...');
    setTimeout(() => {
      const randomGame = playableGames[Math.floor(Math.random() * playableGames.length)];
      toast.dismiss(toastId);
      toast.success(`O destino escolheu: ${randomGame.nome}`, { duration: 4000 });
      setSelectedGame(randomGame);
    }, 1500);
  };

  // Colunas principais com drag & drop
  const mainColumns = [
    { id: 'playing',   label: categoryNames.playing   || 'Jogando Agora', gradient: 'from-orange-500 to-red-500',   icon: '🎮' },
    { id: 'backlog',   label: categoryNames.backlog   || 'Na Fila',       gradient: 'from-purple-500 to-pink-500',  icon: '📚' },
    { id: 'installed', label: categoryNames.installed || 'Instalados',    gradient: 'from-blue-500 to-cyan-500',    icon: '💾' },
  ];

  // Categorias especiais
  const specialCategories = [
    { id: 'zerados',   label: 'Zerados',         gradient: 'from-green-500 to-emerald-500', icon: Trophy },
    { id: 'desejados', label: 'Lista de Desejos', gradient: 'from-yellow-500 to-amber-500',  icon: Star },
  ];

  return (
    <>
      {/* MODO FOCO */}
      {focusGame && (
        <FocusMode
          game={focusGame}
          onClose={() => setFocusGame(null)}
          onMarkFinished={() => {
            setFocusGame(null);
            if (openReviewModal) openReviewModal(focusGame);
          }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4 pb-24">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-5 pt-2 gap-3 flex-wrap">
            {/* Avatar + Saudação */}
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20 transition-all group-hover:scale-105 group-hover:border-cyan-400">
                  {user?.photoBase64 || user?.photoURL ? (
                    <img src={user.photoBase64 || user.photoURL} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                      {user?.displayName?.charAt(0) || 'G'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5 border border-gray-800">
                  <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-xs font-black px-2 py-0.5 rounded-full text-white flex items-center gap-1 shadow-lg">
                    <Trophy className="w-3 h-3" />
                    {totalFinishedGames}
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Olá, {user?.displayName?.split(' ')[0] || 'Gamer'}!
                </h1>
                <p className="text-sm text-gray-400 font-medium">Pronto para a próxima aventura?</p>
              </div>
            </div>

            {/* Busca Global */}
            <GlobalSearch
              gamesData={gamesData}
              onSelectGame={(game) => setSelectedGame(game)}
            />
          </div>

          {/* ── Sugestão de Próximo Jogo ── */}
          <NextGameSuggestion
            gamesData={gamesData}
            onSelectGame={(game) => setSelectedGame(game)}
          />

          {/* ── Grid de 3 Colunas — Drag & Drop ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {mainColumns.map((column) => {
              const columnGames = games[column.id] || [];
              const count = columnGames.length;

              return (
                <Droppable droppableId={column.id} key={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-2xl border-2 transition-all duration-300 ${
                        snapshot.isDraggingOver
                          ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02] shadow-2xl shadow-cyan-500/30'
                          : 'border-gray-800 bg-gradient-to-br from-gray-800/60 to-gray-800/40'
                      }`}
                    >
                      {/* Header da Coluna */}
                      <div
                        onClick={() => setSelectedCategory(column.id)}
                        className="cursor-pointer p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors rounded-t-2xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`px-3 py-1.5 bg-gradient-to-r ${column.gradient} rounded-full flex items-center gap-2 shadow-lg`}>
                            <span className="text-lg">{column.icon}</span>
                            <span className="font-black text-sm text-white">{count}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-500 hover:text-cyan-400 transition-colors" />
                        </div>
                        <h3 className="font-bold text-white text-base">{column.label}</h3>
                      </div>

                      {/* Lista de Jogos */}
                      <div
                        className="p-3 space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(75,85,99,0.8) rgba(31,41,55,0.5)' }}
                      >
                        {!columnGames.length ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Gamepad2 className="w-12 h-12 text-gray-700 mb-3" />
                            <p className="text-sm text-gray-500 font-medium">Nenhum jogo aqui</p>
                            <p className="text-xs text-gray-600 mt-1">Arraste jogos ou adicione novos</p>
                          </div>
                        ) : (
                          <>
                            {columnGames.map((game, index) => {
                              if (!game || !game.id) return null;
                              const isCurrentlyPlaying = column.id === 'playing';

                              return (
                                <Draggable key={game.id} draggableId={game.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                                        snapshot.isDragging
                                          ? 'bg-gray-700 border-cyan-500 shadow-2xl scale-105 rotate-2'
                                          : 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-700/80 hover:border-gray-600'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div
                                          className="flex-1 min-w-0"
                                          onClick={() => setSelectedGame(game)}
                                        >
                                          <h4 className="font-semibold text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                                            {game.nome || 'Sem nome'}
                                          </h4>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400 truncate">{game.platform || 'PC'}</span>
                                            {game.timeToBeat > 0 && (
                                              <span className="text-xs text-blue-400 font-semibold">{game.timeToBeat}h</span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          {/* Botão Modo Foco (só na coluna "playing") */}
                                          {isCurrentlyPlaying && (
                                            <button
                                              onClick={(e) => { e.stopPropagation(); setFocusGame(game); }}
                                              className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:scale-110"
                                              title="Modo Foco"
                                            >
                                              <Flame className="w-3.5 h-3.5 text-cyan-400" />
                                            </button>
                                          )}
                                          <ChevronRight
                                            className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0"
                                            onClick={() => setSelectedGame(game)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                          </>
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>

          {/* ── Categorias Especiais ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialCategories.map((category) => {
              const Icon = category.icon;
              const count = getCategoryProgress(category.id);
              const categoryGames = games[category.id] || [];

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="group relative p-6 rounded-2xl border-2 border-gray-800 bg-gradient-to-br from-gray-800/60 to-gray-800/40 hover:border-gray-700 transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                >
                  <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Icon className="w-24 h-24" />
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-14 h-14 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-black text-white mb-1">{count}</div>
                          <div className="text-sm text-gray-400 font-semibold">{category.label}</div>
                        </div>
                      </div>
                      {categoryGames.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {categoryGames.slice(0, 3).map((game) => (
                            <div key={game.id} className="px-2 py-1 bg-gray-900/60 rounded-lg border border-gray-700/50">
                              <span className="text-xs text-gray-300 truncate max-w-[100px] inline-block">{game.nome}</span>
                            </div>
                          ))}
                          {categoryGames.length > 3 && (
                            <div className="px-2 py-1 bg-gray-900/60 rounded-lg border border-gray-700/50">
                              <span className="text-xs text-gray-400">+{categoryGames.length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}