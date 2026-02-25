// src/components/NextGameSuggestion.jsx
import React, { useMemo, useState } from 'react';
import { Zap, Clock, Shuffle, ChevronRight, Gamepad2, Target, X } from 'lucide-react';

function getGameLengthLabel(hours) {
  if (!hours || hours === 0) return null;
  if (hours <= 5)  return { label: 'Rapidinho',  color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' };
  if (hours <= 15) return { label: 'Curto',       color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' };
  if (hours <= 40) return { label: 'Médio',       color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
  return             { label: 'Longo',       color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
}

export default function NextGameSuggestion({ gamesData = [], onSelectGame }) {
  const [dismissed, setDismissed] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const suggestion = useMemo(() => {
    const playable = gamesData.filter(g =>
      g.status === 'backlog' || g.status === 'installed'
    );
    if (!playable.length) return null;

    // Prioriza jogos com timeToBeat definido, ordenados do mais curto para o mais longo
    const withTime = playable
      .filter(g => g.timeToBeat > 0)
      .sort((a, b) => a.timeToBeat - b.timeToBeat);

    const withoutTime = playable.filter(g => !g.timeToBeat || g.timeToBeat === 0);
    const sorted = [...withTime, ...withoutTime];

    // shuffleSeed 0 = menor tempo, outros = aleatório entre os 5 primeiros
    if (shuffleSeed === 0) return sorted[0];
    const pool = sorted.slice(0, Math.min(5, sorted.length));
    return pool[(shuffleSeed - 1) % pool.length];
  }, [gamesData, shuffleSeed]);

  if (!suggestion || dismissed) return null;

  const lengthInfo = getGameLengthLabel(suggestion.timeToBeat);
  const isInstalled = suggestion.status === 'installed';

  return (
    <div className="relative group mx-auto max-w-7xl mb-5">
      {/* Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />

      <div className="relative bg-gradient-to-r from-gray-800/80 via-gray-800/60 to-gray-800/80 border border-gray-700/60 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm overflow-hidden">

        {/* Background decorativo */}
        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-5 pointer-events-none">
          <Gamepad2 className="w-full h-full text-white" />
        </div>

        {/* Ícone / Capa */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-16 rounded-xl overflow-hidden border border-gray-700/50 bg-gray-900">
            {suggestion.imageBase64 ? (
              <img src={suggestion.imageBase64} alt={suggestion.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </div>
          {/* Badge installed */}
          {isInstalled && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-gray-900">
              <span className="text-[8px]">💾</span>
            </div>
          )}
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-black text-cyan-300 uppercase tracking-wider">Próximo Jogo</span>
            </div>
            {lengthInfo && (
              <div className={`px-2 py-0.5 rounded-full border ${lengthInfo.bg} ${lengthInfo.border}`}>
                <span className={`text-[10px] font-bold ${lengthInfo.color}`}>{lengthInfo.label}</span>
              </div>
            )}
          </div>
          <p className="font-black text-white text-base truncate">{suggestion.nome}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-400">{suggestion.platform}</span>
            {suggestion.timeToBeat > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                ~{suggestion.timeToBeat}h
              </span>
            )}
            {!suggestion.timeToBeat && (
              <span className="text-xs text-gray-600 italic">Sem estimativa de tempo</span>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShuffleSeed(s => s + 1)}
            className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl border border-gray-600/50 transition-all hover:scale-110"
            title="Outra sugestão"
          >
            <Shuffle className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => onSelectGame(suggestion)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 shadow-lg shadow-cyan-500/20"
          >
            <span className="hidden sm:inline">Jogar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            title="Dispensar"
          >
            <X className="w-3.5 h-3.5 text-gray-600 hover:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}