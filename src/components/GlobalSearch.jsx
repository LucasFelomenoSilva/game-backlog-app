// src/components/GlobalSearch.jsx — Tema roxo/violeta
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Gamepad2, Clock, Star, ChevronRight, Zap } from 'lucide-react';
import { categoryNames } from '../data/categories';

const V = {
  bg:     '#09060f',
  card:   '#130e22',
  border: 'rgba(139,92,246,0.20)',
  faint:  'rgba(139,92,246,0.08)',
  violet: '#8b5cf6',
  indigo: '#6366f1',
  soft:   '#a78bfa',
  glow:   'rgba(139,92,246,0.35)',
  text:   '#f5f0ff',
  muted:  'rgba(245,240,255,0.50)',
  low:    'rgba(245,240,255,0.22)',
};

const CAT_GRAD = {
  playing:  'from-violet-500 to-indigo-600',
  installed:'from-indigo-500 to-violet-600',
  backlog:  'from-purple-500 to-violet-500',
  zerados:  'from-emerald-500 to-teal-600',
  desejados:'from-amber-500 to-orange-600',
};
const CAT_EMOJI = { playing:'🎮', installed:'💾', backlog:'⏳', zerados:'✅', desejados:'🌟' };

const getRatingColor = (r) => {
  if (r >= 9) return '#10b981';
  if (r >= 7) return V.soft;
  if (r >= 5) return '#f59e0b';
  return '#f43f5e';
};

export default function GlobalSearch({ gamesData = [], onSelectGame }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const inputRef  = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(p => !p); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(''); setResults([]); }
  }, [open]);

  const handleSearch = useCallback((q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const lower = q.toLowerCase();
    setResults(
      gamesData.filter(g =>
        g.nome?.toLowerCase().includes(lower) ||
        g.genre?.toLowerCase().includes(lower) ||
        g.platform?.toLowerCase().includes(lower)
      ).slice(0, 12)
    );
  }, [gamesData]);

  const handleSelect = (game) => { setOpen(false); onSelectGame(game); };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:opacity-80 group"
        style={{ background: V.faint, border: `1px solid ${V.border}` }}
        title="Busca global (Ctrl+K)">
        <Search className="w-4 h-4" style={{ color: V.muted }} />
        <span className="text-sm hidden sm:block" style={{ color: V.muted }}>Buscar jogos...</span>
        <kbd className="hidden sm:flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono"
          style={{ background: V.bg, border: `1px solid ${V.border}`, color: V.low }}>⌘K</kbd>
      </button>
    );
  }

  return (
    <div ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] px-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === overlayRef.current) setOpen(false); }}>

      <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: V.card, border: `1px solid ${V.border}`, boxShadow: `0 0 80px ${V.glow}` }}>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: `1px solid ${V.border}` }}>
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: V.soft }} />
          <input ref={inputRef} type="text" value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar por nome, gênero, plataforma..."
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: V.text, fontSize: 16 }} />
          <div className="flex items-center gap-2">
            {query && (
              <button onClick={() => handleSearch('')} className="p-1 rounded-lg transition-all hover:opacity-70"
                style={{ background: V.faint }}>
                <X className="w-4 h-4" style={{ color: V.muted }} />
              </button>
            )}
            <button onClick={() => setOpen(false)} className="px-2 py-1 rounded-lg"
              style={{ background: V.faint, border: `1px solid ${V.border}` }}>
              <span className="text-[10px] font-mono" style={{ color: V.muted }}>ESC</span>
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: `${V.border} transparent` }}>
          {!query && (
            <div className="p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})`, boxShadow: `0 0 30px ${V.glow}` }}>
                <Zap className="w-7 h-7 text-white" />
              </div>
              <p className="text-sm font-semibold" style={{ color: V.muted }}>Digite para buscar na sua coleção</p>
              <p className="text-xs mt-1" style={{ color: V.low }}>{gamesData.length} jogos</p>
            </div>
          )}
          {query && results.length === 0 && (
            <div className="p-8 text-center">
              <Gamepad2 className="w-12 h-12 mx-auto mb-3" style={{ color: V.low }} />
              <p className="text-sm" style={{ color: V.muted }}>Nenhum resultado para "{query}"</p>
            </div>
          )}
          {results.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: V.low }}>
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </p>
              {results.map(game => {
                const grad  = CAT_GRAD[game.status] || 'from-violet-500 to-indigo-500';
                const emoji = CAT_EMOJI[game.status] || '🎮';
                const cat   = categoryNames[game.status] || game.status;
                return (
                  <button key={game.id} onClick={() => handleSelect(game)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left group transition-all"
                    style={{ borderBottom: `1px solid ${V.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = V.faint}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {/* Capa */}
                    <div className="w-9 h-12 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ border: `1px solid ${V.border}`, background: V.faint }}>
                      {game.imageBase64
                        ? <img src={game.imageBase64} alt={game.nome} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <Gamepad2 className="w-4 h-4" style={{ color: V.low }} />
                          </div>
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: V.text }}>{game.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r ${grad} text-white`}>
                          {emoji} {cat.replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, '').trim()}
                        </span>
                        <span className="text-[10px]" style={{ color: V.muted }}>{game.platform}</span>
                      </div>
                    </div>
                    {/* Extras */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {game.rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-current" style={{ color: getRatingColor(game.rating) }} />
                          <span className="text-xs font-black" style={{ color: getRatingColor(game.rating) }}>{game.rating}</span>
                        </div>
                      )}
                      {game.timeToBeat > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" style={{ color: V.low }} />
                          <span className="text-[10px]" style={{ color: V.low }}>{game.timeToBeat}h</span>
                        </div>
                      )}
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: V.low }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 flex items-center justify-between" style={{ borderTop: `1px solid ${V.border}` }}>
          <div className="flex items-center gap-3 text-[10px]" style={{ color: V.low }}>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded font-mono" style={{ background: V.faint, border: `1px solid ${V.border}` }}>↵</kbd>
              selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded font-mono" style={{ background: V.faint, border: `1px solid ${V.border}` }}>ESC</kbd>
              fechar
            </span>
          </div>
          <span className="text-[10px]" style={{ color: V.low }}>{gamesData.length} jogos</span>
        </div>
      </div>
    </div>
  );
}