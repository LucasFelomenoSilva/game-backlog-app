// src/components/CategorySelector.jsx — Tema roxo/violeta
import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { categoryNames } from '../data/categories';
import { Plus, Trophy, Gamepad2, ChevronRight, Star, Flame, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlobalSearch from './GlobalSearch';
import NextGameSuggestion from './NextGameSuggestion';
import FocusMode from './FocusMode';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const V = {
  bg:     '#09060f',
  card:   '#130e22',
  card2:  '#1a1330',
  border: 'rgba(139,92,246,0.18)',
  faint:  'rgba(139,92,246,0.08)',
  violet: '#8b5cf6',
  indigo: '#6366f1',
  pink:   '#ec4899',
  soft:   '#a78bfa',
  glow:   'rgba(139,92,246,0.35)',
  text:   '#f5f0ff',
  muted:  'rgba(245,240,255,0.50)',
};

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

  return (
    <>
      {focusGame && (
        <FocusMode
          game={focusGame}
          onClose={() => setFocusGame(null)}
          onMarkFinished={() => { setFocusGame(null); if (openReviewModal) openReviewModal(focusGame); }}
        />
      )}

      <div className="min-h-screen pb-28 text-white" style={{ background: V.bg }}>
        {/* Ambient top glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${V.glow} 0%, transparent 70%)`, opacity: 0.4 }} />

        <div className="relative max-w-7xl mx-auto px-4 pt-4">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            {/* Avatar + Saudação */}
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-0.5 rounded-2xl blur opacity-60"
                  style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})` }} />
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden"
                  style={{ border: `2px solid rgba(139,92,246,0.4)` }}>
                  {user?.photoBase64 || user?.photoURL
                    ? <img src={user.photoBase64 || user.photoURL} alt="Perfil" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl font-black text-white"
                        style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})` }}>
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
                <h1 className="text-2xl font-black" style={{ color: V.text }}>
                  Olá, {user?.displayName?.split(' ')[0] || 'Gamer'}!
                </h1>
                <p className="text-sm" style={{ color: V.muted }}>Pronto para a próxima aventura?</p>
              </div>
            </div>

            {/* Busca Global */}
            <GlobalSearch gamesData={gamesData} onSelectGame={g => setSelectedGame(g)} />
          </div>

          {/* ── Sugestão ── */}
          <NextGameSuggestion gamesData={gamesData} onSelectGame={g => setSelectedGame(g)} />

          {/* ── Grid 3 Colunas — Drag & Drop ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {MAIN_COLUMNS.map((col) => {
              const colGames = games[col.id] || [];
              return (
                <Droppable droppableId={col.id} key={col.id}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className="rounded-2xl border-2 transition-all duration-300"
                      style={{
                        background: snapshot.isDraggingOver
                          ? 'rgba(139,92,246,0.12)'
                          : `linear-gradient(135deg, ${V.card} 0%, ${V.card2} 100%)`,
                        borderColor: snapshot.isDraggingOver ? V.violet : V.border,
                        boxShadow:   snapshot.isDraggingOver ? `0 0 30px ${V.glow}` : 'none',
                        transform:   snapshot.isDraggingOver ? 'scale(1.02)' : 'scale(1)',
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
                              <Draggable key={game.id} draggableId={game.id} index={index}>
                                {(prov, snap) => (
                                  <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                                    className="group p-3 rounded-xl border cursor-pointer transition-all duration-200"
                                    style={{
                                      background: snap.isDragging ? V.card2 : V.faint,
                                      borderColor: snap.isDragging ? V.violet : V.border,
                                      transform: snap.isDragging ? 'scale(1.04) rotate(1.5deg)' : 'scale(1)',
                                      boxShadow: snap.isDragging ? `0 8px 30px ${V.glow}` : 'none',
                                    }}>
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex-1 min-w-0" onClick={() => setSelectedGame(game)}>
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
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        {isPlaying && (
                                          <button onClick={e => { e.stopPropagation(); setFocusGame(game); }}
                                            className="p-1.5 rounded-lg transition-all hover:scale-110"
                                            style={{ background: `${V.violet}25`, border: `1px solid ${V.violet}40` }}
                                            title="Modo Foco">
                                            <Flame className="w-3.5 h-3.5" style={{ color: V.soft }} />
                                          </button>
                                        )}
                                        <ChevronRight className="w-4 h-4 transition-colors" style={{ color: V.muted }}
                                          onClick={() => setSelectedGame(game)} />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })
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
            {SPECIAL_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = getCategoryProgress(cat.id);
              const catGames = games[cat.id] || [];

              return (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  className="group relative p-6 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${V.card}, ${V.card2})`, border: `1px solid ${V.border}` }}>

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
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
}