// src/components/FriendProfileModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Trophy, Star, Clock, Gamepad2, Heart,
  CheckCircle, Calendar, Search, MessageCircle, Award,
  ChevronLeft, ChevronRight, Layers, Bookmark, ShoppingBag, Play
} from 'lucide-react';
import { getFriendGamesData } from '../services/socialService';
import { categoryNames } from '../data/categories';

const getRatingColor = (rating) => {
  if (rating >= 9) return 'from-emerald-500 to-teal-500';
  if (rating >= 7) return 'from-cyan-500 to-blue-500';
  if (rating >= 5) return 'from-yellow-500 to-orange-500';
  return 'from-red-500 to-pink-500';
};

const STATUS_CONFIG = {
  playing:   { label: 'Jogando',         icon: Play,       gradient: 'from-orange-500 to-red-500',    emoji: '🎮' },
  installed: { label: 'Instalados',      icon: Layers,     gradient: 'from-blue-500 to-cyan-500',     emoji: '💾' },
  backlog:   { label: 'Na Fila',         icon: Bookmark,   gradient: 'from-purple-500 to-pink-500',   emoji: '⏳' },
  zerados:   { label: 'Zerados',         icon: CheckCircle,gradient: 'from-green-500 to-emerald-500', emoji: '✅' },
  desejados: { label: 'Lista de Desejos',icon: ShoppingBag,gradient: 'from-yellow-500 to-amber-500',  emoji: '🌟' },
};

export default function FriendProfileModal({ friendUid, friendProfile, onClose, onOpenChat }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | zerados | playing | backlog | installed | desejados
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');

  useEffect(() => {
    const fetchGames = async () => {
      const data = await getFriendGamesData(friendUid);
      setGames(data);
      setLoading(false);
    };
    fetchGames();
  }, [friendUid]);

  // Fechar com ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const stats = useMemo(() => {
    const zerados = games.filter(g => g.status === 'zerados');
    const rated = zerados.filter(g => g.rating > 0);
    const avgRating = rated.length > 0
      ? (rated.reduce((s, g) => s + parseFloat(g.rating), 0) / rated.length).toFixed(1)
      : '—';
    const totalHours = games.reduce((s, g) => s + (parseInt(g.timeToBeat) || 0), 0);
    const platinas = zerados.filter(g => g.isPlatinum).length;
    const genres = {};
    zerados.forEach(g => { if (g.genre) genres[g.genre] = (genres[g.genre] || 0) + 1; });
    const favGenre = Object.entries(genres).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const playing = games.filter(g => g.status === 'playing');
    const gamesByStatus = {};
    Object.keys(STATUS_CONFIG).forEach(s => {
      gamesByStatus[s] = games.filter(g => g.status === s);
    });
    return { zeradosCount: zerados.length, avgRating, totalHours, platinas, favGenre, playing, gamesByStatus };
  }, [games]);

  const displayGames = useMemo(() => {
    if (activeTab === 'overview') return [];
    let list = activeTab === 'all' ? games : games.filter(g => g.status === activeTab);

    if (searchTerm) {
      list = list.filter(g => g.nome?.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return [...list].sort((a, b) => {
      switch (sortOption) {
        case 'rating_desc': return (b.rating || 0) - (a.rating || 0);
        case 'date_desc':
          if (!a.finishedDate) return 1;
          if (!b.finishedDate) return -1;
          return new Date(b.finishedDate) - new Date(a.finishedDate);
        case 'name_asc':
        default: return (a.nome || '').localeCompare(b.nome || '');
      }
    });
  }, [games, activeTab, searchTerm, sortOption]);

  const level = Math.floor(stats.zeradosCount / 5) + 1;

  const tabs = [
    { id: 'overview', label: 'Visão Geral', emoji: '📊' },
    ...Object.entries(STATUS_CONFIG).map(([id, cfg]) => ({
      id,
      label: cfg.label,
      emoji: cfg.emoji,
      count: stats.gamesByStatus?.[id]?.length || 0,
    })).filter(t => t.count > 0),
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-gray-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* ── Botão Fechar ── */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-800/80 hover:bg-red-500/20 rounded-xl border border-gray-700 hover:border-red-500/50 transition-all"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* ── Hero Header ── */}
        <div className="relative flex-shrink-0 overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-blue-900/30 to-purple-900/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.15),transparent_60%)]" />

          <div className="relative px-6 pt-6 pb-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-60" />
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
                  {friendProfile?.photoURL ? (
                    <img src={friendProfile.photoURL} alt={friendProfile.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white">
                      {friendProfile?.displayName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-gray-900 shadow-lg">
                  <div className="flex items-center gap-0.5">
                    <Award className="w-2.5 h-2.5 text-white" />
                    <span className="text-[9px] font-black text-white">LVL {level}</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pr-10">
                <h2 className="text-2xl font-black text-white truncate">{friendProfile?.displayName}</h2>
                <p className="text-sm text-cyan-400/80 font-mono mb-2">{friendProfile?.userCode}</p>
                {stats.playing.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full w-fit">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-xs text-green-300 truncate max-w-[200px]">
                      Jogando: {stats.playing[0].nome}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { label: 'Zerados',    value: stats.zeradosCount, color: 'text-green-400' },
                { label: 'Horas',      value: `${stats.totalHours}h`, color: 'text-blue-400' },
                { label: 'Nota Avg',   value: stats.avgRating,    color: 'text-yellow-400' },
                { label: 'Platinas',   value: stats.platinas,     color: 'text-yellow-300' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-2 text-center">
                  <p className={`text-lg font-black ${color}`}>{value}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>

            {/* Chat button */}
            <button
              onClick={() => { onClose(); onOpenChat(friendUid, friendProfile); }}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-xl transition-all font-bold text-green-300 text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Abrir Chat
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex-shrink-0 px-4 pt-2 pb-1 border-b border-gray-800">
          <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.emoji} {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 text-gray-600">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Conteúdo ── */}
        <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(75,85,99,0.5) transparent' }}>
          {loading ? (
            <div className="flex justify-center py-12">
              <Gamepad2 className="w-10 h-10 text-gray-700 animate-pulse" />
            </div>
          ) : activeTab === 'overview' ? (
            <OverviewTab stats={stats} games={games} friendProfile={friendProfile} />
          ) : (
            <GamesTab
              games={displayGames}
              status={activeTab}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortOption={sortOption}
              setSortOption={setSortOption}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Aba Visão Geral ──
function OverviewTab({ stats, games, friendProfile }) {
  const recentZerados = games
    .filter(g => g.status === 'zerados' && g.finishedDate)
    .sort((a, b) => new Date(b.finishedDate) - new Date(a.finishedDate))
    .slice(0, 5);

  const topRated = games
    .filter(g => g.status === 'zerados' && g.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Gênero favorito */}
      {stats.favGenre !== '—' && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-2xl">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Gênero Favorito</p>
            <p className="text-lg font-black text-pink-300">{stats.favGenre}</p>
          </div>
        </div>
      )}

      {/* Status dos jogos */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Distribuição</p>
        <div className="space-y-2">
          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
            const count = stats.gamesByStatus?.[status]?.length || 0;
            if (!count) return null;
            const total = games.length;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="text-lg w-6">{cfg.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{cfg.label}</span>
                    <span className="text-gray-300 font-bold">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${cfg.gradient} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top avaliados */}
      {topRated.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Melhores Notas</p>
          <div className="space-y-2">
            {topRated.map((game, i) => (
              <div key={game.id} className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/40">
                <span className="text-lg font-black text-gray-500">#{i + 1}</span>
                {game.imageBase64 ? (
                  <img src={game.imageBase64} alt={game.nome} className="w-8 h-11 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-11 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4 text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{game.nome}</p>
                  <p className="text-xs text-gray-500">{game.platform}</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${getRatingColor(game.rating)}`}>
                  <Star className="w-3 h-3 fill-white text-white" />
                  <span className="text-xs font-black text-white">{game.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zerados recentes */}
      {recentZerados.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Zerados Recentes</p>
          <div className="space-y-2">
            {recentZerados.map(game => (
              <div key={game.id} className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-xl border border-gray-700/40">
                {game.imageBase64 ? (
                  <img src={game.imageBase64} alt={game.nome} className="w-8 h-11 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-11 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4 text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{game.nome}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{game.platform}</span>
                    {game.isPlatinum && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded font-bold">PLATINA</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {game.rating > 0 && (
                    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gradient-to-r ${getRatingColor(game.rating)}`}>
                      <Star className="w-2.5 h-2.5 fill-white text-white" />
                      <span className="text-[10px] font-black text-white">{game.rating}</span>
                    </div>
                  )}
                  {game.finishedDate && (
                    <span className="text-[9px] text-green-400">
                      {new Date(game.finishedDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Aba Jogos por Status ──
function GamesTab({ games, status, searchTerm, setSearchTerm, sortOption, setSortOption }) {
  const isZerados = status === 'zerados';

  return (
    <div className="space-y-3">
      {/* Filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
          />
        </div>
        {isZerados && (
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
          >
            <option value="name_asc">A-Z</option>
            <option value="rating_desc">Nota</option>
            <option value="date_desc">Recentes</option>
          </select>
        )}
      </div>

      {games.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700/50">
          <Gamepad2 className="w-12 h-12 mx-auto mb-3 text-gray-700" />
          <p className="text-gray-500 text-sm">Nenhum jogo encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {games.map(game => {
            const isPlatinum = game.isPlatinum;
            const cfg = STATUS_CONFIG[game.status];
            return (
              <div
                key={game.id}
                className={`rounded-xl p-3 border transition-all ${
                  isPlatinum
                    ? 'bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-500/30'
                    : isZerados
                      ? 'bg-gradient-to-br from-green-900/15 to-emerald-900/15 border-green-500/20'
                      : 'bg-gray-800/60 border-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {game.imageBase64 ? (
                    <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={game.imageBase64} alt={game.nome} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Gamepad2 className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className={`font-bold text-sm truncate ${isPlatinum ? 'text-yellow-200' : isZerados ? 'text-green-200' : 'text-white'}`}>
                        {game.nome}
                      </h4>
                      {isPlatinum && (
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded">
                          <Trophy className="w-2.5 h-2.5 text-yellow-900 fill-yellow-900" />
                          <span className="text-[8px] font-black text-yellow-900">PLATINA</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-gray-500">{game.platform}</span>
                      {game.genre && <span className="text-[10px] text-gray-600">·</span>}
                      {game.genre && <span className="text-[10px] text-gray-500">{game.genre}</span>}
                      {game.timeToBeat > 0 && <span className="text-[10px] text-blue-400">{game.timeToBeat}h</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {game.rating > 0 && (
                      <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gradient-to-r ${getRatingColor(game.rating)}`}>
                        <Star className="w-2.5 h-2.5 fill-white text-white" />
                        <span className="text-[10px] font-black text-white">{game.rating}</span>
                      </div>
                    )}
                    {game.finishedDate && (
                      <div className="flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5 text-green-500" />
                        <span className="text-[9px] text-green-400">
                          {new Date(game.finishedDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}