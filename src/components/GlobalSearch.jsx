// src/components/GlobalSearch.jsx — Tema roxo/violeta
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  Gamepad2,
  Clock,
  Star,
  ChevronRight,
  Zap,
} from "lucide-react";
import { categoryNames } from "../data/categories";
import { useTheme } from "../context/ThemeContext";
import { useLanguage, getTranslatedGenre } from "../context/LanguageContext";
import { getRatingHex } from "../utils/gameUtils";

const CAT_GRAD = {
  playing: "from-violet-500 to-indigo-600",
  installed: "from-indigo-500 to-violet-600",
  backlog: "from-purple-500 to-violet-500",
  zerados: "from-emerald-500 to-teal-600",
  desejados: "from-amber-500 to-orange-600",
};
const CAT_EMOJI = {
  playing: "🎮",
  installed: "💾",
  backlog: "⏳",
  zerados: "✅",
  desejados: "🌟",
};

// getRatingColor removido — use getRatingHex importado de utils/gameUtils.js

export default function GlobalSearch({ gamesData = [], onSelectGame }) {
  const { theme: V } = useTheme();
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((p) => !p);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
    }
  }, [open]);

  const handleSearch = useCallback(
    (q) => {
      setQuery(q);
      setActiveIndex(-1);
      if (!q.trim()) {
        setResults([]);
        return;
      }
      const lower = q.toLowerCase();
      setResults(
        gamesData
          .filter(
            (g) =>
              g.nome?.toLowerCase().includes(lower) ||
              g.genre?.toLowerCase().includes(lower) ||
              g.platform?.toLowerCase().includes(lower),
          )
          .slice(0, 12),
      );
    },
    [gamesData],
  );

  const handleSelect = (game) => {
    setOpen(false);
    onSelectGame(game);
  };

  const handleKeyDown = (event) => {
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(index => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(index => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      handleSelect(results[activeIndex >= 0 ? activeIndex : 0]);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:opacity-80 group"
        style={{ background: V.faint, border: `1px solid ${V.border}` }}
        title={language === 'en' ? 'Global search (Ctrl+K)' : 'Busca global (Ctrl+K)'}
      >
        <Search className="w-4 h-4" style={{ color: V.muted }} />
        <span className="text-sm hidden sm:block" style={{ color: V.muted }}>
          {t('action.search')}
        </span>
        <kbd
          className="hidden sm:flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono"
          style={{
            background: V.bg,
            border: `1px solid ${V.border}`,
            color: V.low,
          }}
        >
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] px-4"
      style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(12px)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) setOpen(false);
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: V.card,
          border: `1px solid ${V.border}`,
          boxShadow: `0 0 80px ${V.glow}`,
        }}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: `1px solid ${V.border}` }}
        >
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: V.soft }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: V.text, fontSize: 16 }}
          />
          <div className="flex items-center gap-2">
            {query && (
              <button
                onClick={() => handleSearch("")}
                className="p-1 rounded-lg transition-all hover:opacity-70"
                style={{ background: V.faint }}
              >
                <X className="w-4 h-4" style={{ color: V.muted }} />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="px-2 py-1 rounded-lg"
              style={{ background: V.faint, border: `1px solid ${V.border}` }}
            >
              <span
                className="text-[10px] font-mono"
                style={{ color: V.muted }}
              >
                ESC
              </span>
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div
          className="max-h-[60vh] overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: `${V.border} transparent`,
          }}
        >
          {!query && (
            <div className="p-8 text-center">
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${V.primary}, ${V.secondary})`,
                  boxShadow: `0 0 30px ${V.glow}`,
                }}
              >
                <Zap className="w-7 h-7 text-white" />
              </div>
              <p className="text-sm font-semibold" style={{ color: V.muted }}>
                {t('search.hint')}
              </p>
              <p className="text-xs mt-1" style={{ color: V.low }}>
                {gamesData.length} {gamesData.length === 1 ? t('stats.game_count_single') : t('stats.games_count')}
              </p>
            </div>
          )}
          {query && results.length === 0 && (
            <div className="p-8 text-center">
              <Gamepad2
                className="w-12 h-12 mx-auto mb-3"
                style={{ color: V.low }}
              />
              <p className="text-sm" style={{ color: V.muted }}>
                {t('search.not_found')} "{query}"
              </p>
            </div>
          )}
          {results.length > 0 && (
            <div className="py-2">
              <p
                className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: V.low }}
              >
                {results.length} {language === 'en' ? (results.length === 1 ? 'result' : 'results') : (results.length === 1 ? 'resultado' : 'resultados')}
              </p>
              {results.map((game, index) => {
                const grad =
                  CAT_GRAD[game.status] || "from-violet-500 to-indigo-500";
                const emoji = CAT_EMOJI[game.status] || "🎮";
                const cat = t('col.' + game.status) || categoryNames[game.status] || game.status;
                return (
                  <button
                    key={game.id}
                    onClick={() => handleSelect(game)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left group transition-all"
                    style={{ borderBottom: `1px solid ${V.border}`, background: activeIndex === index ? V.faint : 'transparent' }}
                  >
                    {/* Capa */}
                    <div
                      className="w-9 h-12 rounded-xl overflow-hidden flex-shrink-0"
                      style={{
                        border: `1px solid ${V.border}`,
                        background: V.faint,
                      }}
                    >
                      {game.imageBase64 ? (
                        <img
                          src={game.imageBase64}
                          alt={game.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2
                            className="w-4 h-4"
                            style={{ color: V.low }}
                          />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold truncate"
                        style={{ color: V.text }}
                      >
                        {game.nome}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r ${grad} text-white`}
                        >
                          {emoji} {cat}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: V.muted }}
                        >
                          {game.platform}{game.genre ? ` · ${getTranslatedGenre(game.genre, language)}` : ''}
                        </span>
                      </div>
                    </div>
                    {/* Extras */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {game.rating > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star
                            className="w-3 h-3 fill-current"
                            style={{ color: getRatingHex(game.rating) }}
                          />
                          <span
                            className="text-xs font-black"
                            style={{ color: getRatingHex(game.rating) }}
                          >
                            {game.rating}
                          </span>
                        </div>
                      )}
                      {game.timeToBeat > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" style={{ color: V.low }} />
                          <span
                            className="text-[10px]"
                            style={{ color: V.low }}
                          >
                            {game.timeToBeat}h
                          </span>
                        </div>
                      )}
                      <ChevronRight
                        className="w-3.5 h-3.5"
                        style={{ color: V.low }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 flex items-center justify-between"
          style={{ borderTop: `1px solid ${V.border}` }}
        >
          <div
            className="flex items-center gap-3 text-[10px]"
            style={{ color: V.low }}
          >
            <span className="flex items-center gap-1">
              <kbd
                className="px-1 py-0.5 rounded font-mono"
                style={{ background: V.faint, border: `1px solid ${V.border}` }}
              >
                ↵
              </kbd>
              {language === 'en' ? 'select' : 'selecionar'}
            </span>
            <span className="flex items-center gap-1">
              <kbd
                className="px-1 py-0.5 rounded font-mono"
                style={{ background: V.faint, border: `1px solid ${V.border}` }}
              >
                ESC
              </kbd>
              {language === 'en' ? 'close' : 'fechar'}
            </span>
          </div>
          <span className="text-[10px]" style={{ color: V.low }}>
            {gamesData.length} {gamesData.length === 1 ? t('stats.game_count_single') : t('stats.games_count')}
          </span>
        </div>
      </div>
    </div>
  );
}
