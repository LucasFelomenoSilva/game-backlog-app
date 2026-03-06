// src/components/NextGameSuggestion.jsx
import React, { useMemo, useState } from 'react';
import { Zap, Clock, Shuffle, ChevronRight, Gamepad2, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // <-- Importado

function getGameLengthLabel(hours, V) {
  if (!hours || hours === 0) return null;
  if (hours <= 5)  return { label: 'Rapidinho',  color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)' };
  if (hours <= 15) return { label: 'Curto',       color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.2)' };
  if (hours <= 40) return { label: 'Médio',       color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.2)' };
  return             { label: 'Longo',       color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' };
}

export default function NextGameSuggestion({ gamesData = [], onSelectGame }) {
  const { theme: V } = useTheme(); // <-- Usando as cores do tema
  const [dismissed, setDismissed] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const suggestion = useMemo(() => {
    const playable = gamesData.filter(g =>
      g.status === 'backlog' || g.status === 'installed'
    );
    if (!playable.length) return null;

    const withTime = playable
      .filter(g => g.timeToBeat > 0)
      .sort((a, b) => a.timeToBeat - b.timeToBeat);

    const withoutTime = playable.filter(g => !g.timeToBeat || g.timeToBeat === 0);
    const sorted = [...withTime, ...withoutTime];

    if (shuffleSeed === 0) return sorted[0];
    const pool = sorted.slice(0, Math.min(5, sorted.length));
    return pool[(shuffleSeed - 1) % pool.length];
  }, [gamesData, shuffleSeed]);

  if (!suggestion || dismissed) return null;

  const lengthInfo = getGameLengthLabel(suggestion.timeToBeat, V);
  const isInstalled = suggestion.status === 'installed';

  return (
    <div className="relative group mx-auto max-w-7xl mb-5">
      <div className="absolute -inset-0.5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" 
           style={{ background: `linear-gradient(to right, ${V.primary}40, ${V.secondary}40)` }}/>

      <div className="relative border rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm overflow-hidden"
           style={{ background: `linear-gradient(to right, ${V.card}e6, ${V.card2}99, ${V.card}e6)`, borderColor: `${V.border}99` }}>

        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-5 pointer-events-none">
          <Gamepad2 className="w-full h-full text-white" />
        </div>

        <div className="relative flex-shrink-0">
          <div className="w-12 h-16 rounded-xl overflow-hidden border" style={{ borderColor: `${V.border}80`, background: V.bg }}>
            {suggestion.imageBase64 ? (
              <img src={suggestion.imageBase64} alt={suggestion.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="w-6 h-6" style={{ color: V.muted }} />
              </div>
            )}
          </div>
          {isInstalled && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border"
                 style={{ background: V.primary, borderColor: V.bg }}>
              <span className="text-[8px]">💾</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border"
                 style={{ background: `${V.accent}1a`, borderColor: `${V.accent}33` }}>
              <Zap className="w-3 h-3" style={{ color: V.accent }} />
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: V.accent }}>Próximo Jogo</span>
            </div>
            {lengthInfo && (
              <div className="px-2 py-0.5 rounded-full border" style={{ background: lengthInfo.bg, borderColor: lengthInfo.border }}>
                <span className="text-[10px] font-bold" style={{ color: lengthInfo.color }}>{lengthInfo.label}</span>
              </div>
            )}
          </div>
          <p className="font-black text-base truncate" style={{ color: V.text }}>{suggestion.nome}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs" style={{ color: V.muted }}>{suggestion.platform}</span>
            {suggestion.timeToBeat > 0 && (
              <span className="flex items-center gap-1 text-xs" style={{ color: V.low }}>
                <Clock className="w-3 h-3" />
                ~{suggestion.timeToBeat}h
              </span>
            )}
            {!suggestion.timeToBeat && (
              <span className="text-xs italic" style={{ color: V.low }}>Sem estimativa de tempo</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShuffleSeed(s => s + 1)}
            className="p-2 rounded-xl border transition-all hover:scale-110"
            style={{ background: V.faint, borderColor: V.border }}
            title="Outra sugestão"
          >
            <Shuffle className="w-4 h-4" style={{ color: V.muted }} />
          </button>
          <button
            onClick={() => onSelectGame(suggestion)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 shadow-lg"
            style={{ background: `linear-gradient(to right, ${V.primary}, ${V.secondary})`, boxShadow: `0 4px 14px ${V.primary}33` }}
          >
            <span className="hidden sm:inline">Jogar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ hover: { background: V.faint } }}
            title="Dispensar"
          >
            <X className="w-3.5 h-3.5" style={{ color: V.low }} />
          </button>
        </div>
      </div>
    </div>
  );
}