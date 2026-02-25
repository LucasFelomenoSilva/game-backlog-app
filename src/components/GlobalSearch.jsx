// src/components/GlobalSearch.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Gamepad2, Trophy, Clock, Star, ChevronRight, Zap } from 'lucide-react';
import { categoryNames } from '../data/categories';

const categoryGradients = {
  playing:  'from-orange-500 to-red-500',
  installed:'from-blue-500 to-cyan-500',
  backlog:  'from-purple-500 to-pink-500',
  zerados:  'from-green-500 to-emerald-500',
  desejados:'from-yellow-500 to-amber-500',
};

const categoryEmoji = {
  playing:  '🎮',
  installed:'💾',
  backlog:  '⏳',
  zerados:  '✅',
  desejados:'🌟',
};

export default function GlobalSearch({ gamesData = [], onSelectGame }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  // Atalho de teclado: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [open]);

  const handleSearch = useCallback((q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const lower = q.toLowerCase();
    const found = gamesData.filter(g =>
      g.nome?.toLowerCase().includes(lower) ||
      g.genre?.toLowerCase().includes(lower) ||
      g.platform?.toLowerCase().includes(lower) ||
      g.notes?.toLowerCase().includes(lower)
    );
    setResults(found.slice(0, 12));
  }, [gamesData]);

  const handleSelect = (game) => {
    setOpen(false);
    onSelectGame(game);
  };

  const getRatingColor = (r) => {
    if (r >= 9) return 'text-emerald-400';
    if (r >= 7) return 'text-cyan-400';
    if (r >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 hover:border-cyan-500/50 rounded-xl transition-all duration-300 group"
        title="Busca global (Ctrl+K)"
      >
        <Search className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
        <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors hidden sm:block">
          Buscar seus jogos...
        </span>
        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-700 rounded text-[10px] text-gray-500 font-mono">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
    >
      <div className="w-full max-w-xl bg-gray-900 rounded-2xl border border-gray-700/80 shadow-2xl overflow-hidden animate-[slideInUp_0.2s_ease-out]">

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar por nome, gênero, plataforma..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-base"
          />
          <div className="flex items-center gap-2">
            {query && (
              <button onClick={() => handleSearch('')} className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button onClick={() => setOpen(false)} className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <kbd className="text-[10px] text-gray-400 font-mono">ESC</kbd>
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="p-6 text-center">
              <Zap className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Digite para buscar em todos os seus jogos</p>
              <p className="text-gray-700 text-xs mt-1">{gamesData.length} jogos na coleção</p>
            </div>
          )}

          {query && results.length === 0 && (
            <div className="p-6 text-center">
              <Gamepad2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Nenhum jogo encontrado para "{query}"</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((game) => {
                const gradient = categoryGradients[game.status] || 'from-gray-500 to-gray-600';
                const emoji = categoryEmoji[game.status] || '🎮';
                const catName = categoryNames[game.status] || game.status;
                return (
                  <button
                    key={game.id}
                    onClick={() => handleSelect(game)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800/60 transition-colors text-left group"
                  >
                    {/* Capa miniatura */}
                    <div className="w-9 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800 border border-gray-700/50">
                      {game.imageBase64 ? (
                        <img src={game.imageBase64} alt={game.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate group-hover:text-cyan-300 transition-colors">
                        {game.nome}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r ${gradient} text-white`}>
                          {emoji} {catName.replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, '').trim()}
                        </span>
                        <span className="text-[10px] text-gray-500">{game.platform}</span>
                        {game.genre && <span className="text-[10px] text-gray-600">{game.genre}</span>}
                      </div>
                    </div>

                    {/* Rating / Horas */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {game.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className={`w-3 h-3 fill-current ${getRatingColor(game.rating)}`} />
                          <span className={`text-xs font-bold ${getRatingColor(game.rating)}`}>{game.rating}</span>
                        </div>
                      )}
                      {game.timeToBeat > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-600" />
                          <span className="text-[10px] text-gray-500">{game.timeToBeat}h</span>
                        </div>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-cyan-500 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-gray-600">
            <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1 py-0.5 rounded font-mono">↵</kbd> selecionar</span>
            <span className="flex items-center gap-1"><kbd className="bg-gray-800 px-1 py-0.5 rounded font-mono">ESC</kbd> fechar</span>
          </div>
          <span className="text-[10px] text-gray-700">{gamesData.length} jogos</span>
        </div>
      </div>
    </div>
  );
}