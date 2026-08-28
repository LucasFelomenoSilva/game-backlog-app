// src/components/CategorySelector.jsx — Tema roxo/violeta
import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Plus, Trophy, Gamepad2, ChevronRight, Star, Flame, Clock3, Gauge, LibraryBig, GripVertical, Activity } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import NextGameSuggestion from './NextGameSuggestion';
import FocusMode from './FocusMode';
import { useTheme } from '../context/ThemeContext';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
// Colunas drag & drop — coloridas individualmente mas com acento roxo
const MAIN_COLUMNS = [
  { id: 'playing',   label: 'Jogando Agora', grad: 'from-violet-500 to-indigo-600',   emoji: '🎮' },
  { id: 'backlog',   label: 'Na Fila',       grad: 'from-purple-500 to-violet-600',   emoji: '⏳' },
  { id: 'installed', label: 'Instalados',    grad: 'from-indigo-500 to-purple-600',   emoji: '💾' },
];

const SPECIAL_CATEGORIES = [
  { id: 'zerados',   label: 'Zerados',         grad: 'from-emerald-500 to-teal-600',  icon: Trophy },
  { id: 'desejados', label: 'Lista de Desejos', grad: 'from-amber-500 to-orange-600', icon: Star   },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const columnVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.22 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 130, damping: 16 }
  }
};

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
  const { theme: V } = useTheme(); // Recebe as cores dinâmicas
  const [focusGame, setFocusGame] = useState(null);
  const overview = useMemo(() => {
    const total = gamesData.length;
    const finished = gamesData.filter(game => game.status === 'zerados').length;
    const plannedHours = gamesData
      .filter(game => game.status !== 'zerados')
      .reduce((sum, game) => sum + (Number(game.timeToBeat) || 0), 0);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentFinished = gamesData.filter(game =>
      game.status === 'zerados'
      && game.finishedDate
      && new Date(game.finishedDate).getTime() >= thirtyDaysAgo
    ).length;
    return {
      total,
      plannedHours,
      recentFinished,
      completion: total ? Math.round((finished / total) * 100) : 0,
    };
  }, [gamesData]);

  return (
    <>
      {focusGame && (
        <FocusMode
          game={focusGame}
          onClose={() => setFocusGame(null)}
          onMarkFinished={() => { setFocusGame(null); if (openReviewModal) openReviewModal(focusGame); }}
        />
      )}

      <div className="app-page pb-28">
        {/* Ambient top glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${V.glow} 0%, transparent 70%)`, opacity: 0.4 }} />

        <div className="app-shell relative pt-5 sm:pt-7">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            {/* Avatar + Saudação */}
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer lg:hidden">
                <div className="absolute -inset-0.5 rounded-2xl blur opacity-60"
                  style={{ background: `linear-gradient(135deg, ${V.primary}, ${V.secondary})` }} />
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden"
                  style={{ border: `2px solid rgba(139,92,246,0.4)` }}>
                  {user?.photoBase64 || user?.photoURL
                    ? <img src={user.photoBase64 || user.photoURL} alt="Perfil" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl font-black text-white"
                        style={{ background: `linear-gradient(135deg, ${V.primary}, ${V.secondary})` }}>
                        {user?.displayName?.charAt(0) || 'G'}
                      </div>
                  }
                </div>
                {/* Trophy count badge */}
                <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black text-white"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: `2px solid ${V.bg}`, boxShadow: '0 2px 10px rgba(245,158,11,0.4)' }}>
                  <Trophy className="w-2.5 h-2.5 inline fill-yellow-900 text-yellow-900" /> {totalFinishedGames}
                </div>
              </div>
              <div>
                <p className="eyebrow mb-1">Sua biblioteca</p>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: V.text }}>
                  Olá, {user?.displayName?.split(' ')[0] || 'Gamer'}
                </h1>
                <p className="text-sm" style={{ color: V.muted }}>Escolha a próxima aventura ou reorganize sua fila.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GlobalSearch gamesData={gamesData} onSelectGame={g => setSelectedGame(g)} />
              <button
                type="button"
                onClick={() => setIsAddGameModalOpen(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5"
                style={{ background: V.grad, boxShadow: `0 8px 22px ${V.glow}` }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Adicionar jogo</span>
              </button>
            </div>
          </div>

          <section className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3" aria-label="Resumo da coleção">
            {[
              { label: 'Na coleção', value: overview.total, suffix: ' jogos', icon: LibraryBig },
              { label: 'Conclusão', value: overview.completion, suffix: '%', icon: Gauge },
              { label: 'Tempo na fila', value: overview.plannedHours, suffix: 'h', icon: Clock3 },
              { label: 'Ritmo · 30 dias', value: overview.recentFinished, suffix: ' zerados', icon: Activity },
            ].map(({ label, value, suffix, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border p-3 backdrop-blur-xl sm:flex sm:items-center sm:gap-3 sm:p-4"
                style={{ background: `linear-gradient(135deg, ${V.card}c0, ${V.card2}50)`, borderColor: V.border }}
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl sm:mb-0" style={{ background: V.faint }}>
                  <Icon className="h-4 w-4" style={{ color: V.soft }} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold uppercase tracking-wider" style={{ color: V.muted }}>{label}</p>
                  <p className="text-lg font-black sm:text-xl" style={{ color: V.text }}>{value}<span className="text-xs font-semibold" style={{ color: V.muted }}>{suffix}</span></p>
                </div>
              </div>
            ))}
          </section>

          {/* ── Sugestão ── */}
          <NextGameSuggestion gamesData={gamesData} onSelectGame={g => setSelectedGame(g)} />

          {/* ── Grid 3 Colunas — Drag & Drop ── */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {MAIN_COLUMNS.map((col) => {
              const colGames = games[col.id] || [];
              return (
                <Droppable droppableId={col.id} key={col.id}>
                  {(provided, snapshot) => (
                    <motion.div ref={provided.innerRef} {...provided.droppableProps}
                      variants={columnVariants}
                      className="glass-panel overflow-hidden rounded-[1.5rem] transition-[border-color,box-shadow] duration-200"
                      style={{
                        background: snapshot.isDraggingOver
                          ? 'rgba(255, 255, 255, 0.03)'
                          : `linear-gradient(135deg, ${V.card}b0 0%, ${V.card2}40 100%)`,
                        borderColor: snapshot.isDraggingOver ? `${V.primary}40` : V.border,
                        boxShadow:   snapshot.isDraggingOver ? `0 12px 40px ${V.glow}, inset 0 0 12px ${V.primary}10` : '0 4px 30px rgba(0,0,0,0.15)',
                      }}>

                      {/* Header coluna */}
                      <div className="cursor-pointer p-4 rounded-t-2xl transition-all hover:bg-white/5"
                        onClick={() => setSelectedCategory(col.id)}
                        style={{ borderBottom: `1px solid ${V.border}` }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`px-3 py-1.5 bg-gradient-to-r ${col.grad} rounded-full flex items-center gap-2 shadow-lg`}>
                            <span className="text-base">{col.emoji}</span>
                            <span className="font-black text-sm text-white">{colGames.length}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 transition-colors" style={{ color: V.muted }} />
                        </div>
                        <h3 className="font-bold text-sm" style={{ color: V.text }}>{col.label}</h3>
                      </div>

                      {/* Lista de jogos */}
                      <div className="p-3 space-y-2 min-h-[180px] max-h-[380px] overflow-y-auto"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: `${V.border} transparent` }}>
                        {!colGames.length ? (
                          <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Gamepad2 className="w-10 h-10 mb-2" style={{ color: V.faint }} />
                            <p className="text-xs" style={{ color: V.muted }}>Nenhum jogo aqui</p>
                            <p className="text-[10px] mt-0.5" style={{ color: V.muted }}>Arraste para cá</p>
                          </div>
                        ) : (
                          colGames.map((game, index) => {
                            if (!game?.id) return null;
                            const isPlaying = col.id === 'playing';
                            return (
                              <Draggable key={game.id} draggableId={String(game.id)} index={index}>
                                {(prov, snap) => {
                                  const draggableCard = <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    style={prov.draggableProps.style}
                                  >
                                    <div
                                      className="group flex items-center gap-2 rounded-2xl border p-2.5 select-none"
                                      style={{
                                        background: snap.isDragging
                                          ? `rgba(255, 255, 255, 0.08)`
                                          : `linear-gradient(135deg, ${V.card2}60 0%, ${V.card}30 100%)`,
                                        borderColor: snap.isDragging ? V.primary : V.border,
                                        boxShadow: snap.isDragging ? `0 12px 36px ${V.glow}` : '0 2px 8px rgba(0,0,0,0.1)',
                                      }}
                                    >
                                      <button
                                        type="button"
                                        className="cursor-grab rounded-xl p-1.5 active:cursor-grabbing"
                                        style={{ color: V.low }}
                                        aria-label={`Arrastar ${game.nome}`}
                                        title="Arraste para mover ou reordenar"
                                        {...prov.dragHandleProps}
                                      >
                                        <GripVertical className="h-4 w-4" />
                                      </button>
                                      {(game.imageBase64 || game.imageUrl) ? (
                                        <img
                                          src={game.imageBase64 || game.imageUrl}
                                          alt=""
                                          className="h-12 w-9 flex-shrink-0 rounded-lg object-cover shadow-md"
                                        />
                                      ) : (
                                        <div className="flex h-12 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: V.faint }}>
                                          <Gamepad2 className="h-4 w-4" style={{ color: V.muted }} />
                                        </div>
                                      )}
                                      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setSelectedGame(game)}>
                                          <h4 className="font-semibold text-sm truncate transition-colors"
                                            style={{ color: V.text }}>
                                            {game.nome || 'Sem nome'}
                                          </h4>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px]" style={{ color: V.muted }}>{game.platform || 'PC'}</span>
                                            {game.timeToBeat > 0 && (
                                              <span className="text-[10px] font-semibold" style={{ color: V.soft }}>{game.timeToBeat}h</span>
                                            )}
                                          </div>
                                      </button>
                                        <div className="flex items-center gap-1.5">
                                          {isPlaying && (
                                            <button type="button" onClick={e => { e.stopPropagation(); setFocusGame(game); }}
                                              className="p-1.5 rounded-lg transition-all hover:scale-110"
                                              style={{ background: V.faint, border: `1px solid ${V.border}` }}
                                              title="Modo Foco">
                                              <Flame className="w-3.5 h-3.5" style={{ color: V.soft }} />
                                            </button>
                                          )}
                                          <button type="button" onClick={() => setSelectedGame(game)} aria-label={`Abrir ${game.nome}`}>
                                            <ChevronRight className="w-4 h-4 transition-colors" style={{ color: V.muted }} />
                                          </button>
                                        </div>
                                    </div>
                                  </div>;

                                  return snap.isDragging
                                    ? createPortal(draggableCard, document.body)
                                    : draggableCard;
                                }}
                              </Draggable>
                            );
                          })
                        )}
                        {provided.placeholder}
                      </div>
                    </motion.div>
                  )}
                </Droppable>
              );
            })}
          </motion.div>

          {/* ── Categorias Especiais ── */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPECIAL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = getCategoryProgress(cat.id);
              const catGames = games[cat.id] || [];

              return (
                <Droppable droppableId={cat.id} key={cat.id}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      variants={itemVariants}
                      className="relative rounded-2xl"
                    >
                      <motion.button
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        whileHover={{ scale: 1.015, y: -2 }}
                        whileTap={{ scale: 0.995 }}
                        className="group relative w-full overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 backdrop-blur-xl"
                        style={{
                          background: snapshot.isDraggingOver
                            ? `linear-gradient(135deg, ${V.primary}2e, ${V.card2}80)`
                            : `linear-gradient(135deg, ${V.card}90, ${V.card2}30)`,
                          border: `1px solid ${snapshot.isDraggingOver ? V.primary : V.border}`,
                          boxShadow: snapshot.isDraggingOver ? `0 18px 50px ${V.glow}` : 'none',
                        }}
                      >

                  {snapshot.isDraggingOver && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm" style={{ background: `${V.bg}b8` }}>
                      <div className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black text-white" style={{ background: V.grad }}>
                        <Icon className="h-4 w-4" /> Solte em {cat.label}
                      </div>
                    </div>
                  )}

                  {/* Glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.08), transparent 70%)` }} />

                  {/* Watermark icon */}
                  <div className="absolute top-2 right-2 opacity-[0.06] group-hover:opacity-[0.10] transition-opacity">
                    <Icon className="w-20 h-20" />
                  </div>

                  <div className="relative flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-14 h-14 bg-gradient-to-br ${cat.grad} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-black" style={{ color: V.text }}>{count}</div>
                          <div className="text-sm font-semibold" style={{ color: V.muted }}>{cat.label}</div>
                        </div>
                      </div>
                      {catGames.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {catGames.slice(0, 3).map(g => (
                            <div key={g.id} className="px-2 py-0.5 rounded-lg"
                              style={{ background: V.faint, border: `1px solid ${V.border}` }}>
                              <span className="text-[10px] truncate max-w-[90px] inline-block" style={{ color: V.muted }}>{g.nome}</span>
                            </div>
                          ))}
                          {catGames.length > 3 && (
                            <div className="px-2 py-0.5 rounded-lg" style={{ background: V.faint, border: `1px solid ${V.border}` }}>
                              <span className="text-[10px]" style={{ color: V.muted }}>+{catGames.length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-all flex-shrink-0" style={{ color: V.muted }} />
                  </div>
                      </motion.button>
                      {provided.placeholder}
                    </motion.div>
                  )}
                </Droppable>
              );
            })}
          </motion.div>

        </div>
      </div>
    </>
  );
}
