// src/components/FriendProfileScreen.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft, Trophy, Star, Clock, Gamepad2, Heart,
  CheckCircle, Zap, Calendar, Filter, Search, MessageCircle, Award
} from 'lucide-react';
import { getFriendGamesData } from '../services/socialService';
import { categoryNames } from '../data/categories';

const getRatingColor = (rating) => {
  if (rating >= 9) return 'from-emerald-500 to-teal-500';
  if (rating >= 7) return 'from-cyan-500 to-blue-500';
  if (rating >= 5) return 'from-yellow-500 to-orange-500';
  return 'from-red-500 to-pink-500';
};

export default function FriendProfileScreen({ friendUid, friendProfile, onBack, onOpenChat }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('zerados'); // zerados | all
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');

  useEffect(() => {
    const fetch = async () => {
      const data = await getFriendGamesData(friendUid);
      setGames(data);
      setLoading(false);
    };
    fetch();
  }, [friendUid]);

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
    return { zeradosCount: zerados.length, avgRating, totalHours, platinas, favGenre, playing };
  }, [games]);

  const displayGames = useMemo(() => {
    let list = activeView === 'zerados'
      ? games.filter(g => g.status === 'zerados')
      : games;

    if (searchTerm) {
      list = list.filter(g => g.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    list = [...list].sort((a, b) => {
      switch (sortOption) {
        case 'rating_desc': return (b.rating || 0) - (a.rating || 0);
        case 'date_desc':
          if (!a.finishedDate) return 1;
          if (!b.finishedDate) return -1;
          return new Date(b.finishedDate) - new Date(a.finishedDate);
        case 'name_asc': default: return a.nome.localeCompare(b.nome);
      }
    });

    return list;
  }, [games, activeView, searchTerm, sortOption]);

  const level = Math.floor(stats.zeradosCount / 5) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white pb-24">
      {/* Header Fixo */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl border border-gray-700/50 transition-all hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Voltar</span>
            </button>

            <button
              onClick={() => onOpenChat(friendUid, friendProfile)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-xl border border-green-500/30 transition-all hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-bold text-green-400">Chat</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Hero Card do Perfil */}
        <div className="relative group mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-50"></div>
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20">
                  {friendProfile?.photoURL ? (
                    <img src={friendProfile.photoURL} alt={friendProfile.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-black">
                      {friendProfile?.displayName?.charAt(0)}
                    </div>
                  )}
                </div>
                {/* Level badge */}
                <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-gray-900 shadow-lg">
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-black text-white">LVL {level}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-white truncate">{friendProfile?.displayName}</h2>
                <p className="text-sm text-cyan-400/80 font-mono">{friendProfile?.userCode}</p>
                {stats.playing.length > 0 && (
                  <p className="text-xs text-green-400 mt-2 truncate">
                    🎮 Jogando: {stats.playing[0].nome}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Zerados', value: stats.zeradosCount, icon: CheckCircle, gradient: 'from-green-500 to-emerald-500', color: 'from-green-400 to-emerald-400' },
            { label: 'Horas', value: `${stats.totalHours}h`, icon: Clock, gradient: 'from-blue-500 to-cyan-500', color: 'from-blue-400 to-cyan-400' },
            { label: 'Nota Média', value: stats.avgRating, icon: Star, gradient: 'from-yellow-500 to-orange-500', color: 'from-yellow-400 to-orange-400' },
            { label: 'Platinas', value: stats.platinas, icon: Trophy, gradient: 'from-yellow-500 to-amber-500', color: 'from-yellow-300 to-amber-300' },
          ].map(({ label, value, icon: Icon, gradient, color }) => (
            <div key={label} className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
              <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center">
                <div className={`w-10 h-10 mx-auto mb-2 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`text-2xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Gênero favorito */}
        {stats.favGenre !== '—' && (
          <div className="mb-6 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Gênero Favorito</p>
              <p className="text-lg font-black text-pink-300">{stats.favGenre}</p>
            </div>
          </div>
        )}

        {/* Tabs de Jogos */}
        <div className="flex gap-2 mb-4 bg-gray-800/50 rounded-xl p-1">
          <button
            onClick={() => setActiveView('zerados')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'zerados'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            ✅ Zerados ({games.filter(g => g.status === 'zerados').length})
          </button>
          <button
            onClick={() => setActiveView('all')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🎮 Todos ({games.length})
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white appearance-none focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer"
          >
            <option value="name_asc">A-Z</option>
            <option value="rating_desc">Nota</option>
            <option value="date_desc">Recentes</option>
          </select>
        </div>

        {/* Lista de Jogos */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Gamepad2 className="w-10 h-10 text-gray-700 animate-pulse" />
          </div>
        ) : displayGames.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700/50">
            <Gamepad2 className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p className="text-gray-500">Nenhum jogo encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayGames.map(game => {
              const isFinished = game.status === 'zerados';
              const isPlatinum = game.isPlatinum;
              const statusLabel = categoryNames[game.status] || game.status;

              return (
                <div
                  key={game.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    isPlatinum
                      ? 'bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-500/30'
                      : isFinished
                        ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20'
                        : 'bg-gray-800/60 border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Capa Miniatura */}
                    {game.imageBase64 ? (
                      <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700/50">
                        <img src={game.imageBase64} alt={game.nome} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-14 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-700/50">
                        <Gamepad2 className="w-5 h-5 text-gray-600" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-bold text-sm truncate ${isPlatinum ? 'text-yellow-200' : isFinished ? 'text-green-200' : 'text-white'}`}>
                          {game.nome}
                        </h4>
                        {isPlatinum && (
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-md">
                            <Trophy className="w-2.5 h-2.5 text-yellow-900 fill-yellow-900" />
                            <span className="text-[9px] font-black text-yellow-900">PLATINA</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-gray-500 bg-gray-900/50 px-1.5 py-0.5 rounded">{game.platform}</span>
                        {!isFinished && (
                          <span className="text-[10px] text-gray-400">{statusLabel}</span>
                        )}
                        {isFinished && game.rating && (
                          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gradient-to-r ${getRatingColor(game.rating)}`}>
                            <Star className="w-2.5 h-2.5 fill-white text-white" />
                            <span className="text-[10px] font-bold text-white">{game.rating}</span>
                          </div>
                        )}
                        {isFinished && game.finishedDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-green-500" />
                            <span className="text-[10px] text-green-400">
                              {new Date(game.finishedDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        {game.timeToBeat > 0 && (
                          <span className="text-[10px] text-blue-400">{game.timeToBeat}h</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}