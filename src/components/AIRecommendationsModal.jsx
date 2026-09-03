// src/components/AIRecommendationsModal.jsx
import React from 'react';
import { X, Sparkles, Bot, Clock, Compass, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AIRecommendationsModal({ onClose }) {
  const { theme: V } = useTheme();

  return (
    <div
      className="fixed inset-0 z-[350] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative border"
        style={{
          background: V.card,
          borderColor: `${V.primary}45`,
          boxShadow: `0 0 70px ${V.glow}, inset 0 0 20px ${V.primary}15`,
        }}
      >
        {/* Glow de fundo */}
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-30"
          style={{ background: `linear-gradient(135deg, ${V.primary}, ${V.secondary})` }}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1.5"
              style={{ background: `linear-gradient(135deg, ${V.primary}, ${V.secondary})` }}
            >
              <Sparkles className="w-3 h-3" /> Em Breve
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:opacity-70"
            style={{ background: V.faint, border: `1px solid ${V.border}` }}
          >
            <X className="w-4 h-4" style={{ color: V.muted }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 pt-3 text-center space-y-5">
          {/* Avatar / Ícone de IA */}
          <div className="relative mx-auto w-20 h-20">
            <div
              className="absolute inset-0 rounded-3xl blur-xl opacity-60 animate-pulse"
              style={{ background: `linear-gradient(135deg, ${V.primary}, #ec4899)` }}
            />
            <div
              className="relative w-full h-full rounded-3xl flex items-center justify-center border shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${V.card}, ${V.card2})`,
                borderColor: `${V.primary}60`,
              }}
            >
              <Bot className="w-10 h-10" style={{ color: V.primary }} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black mb-2" style={{ color: V.text }}>
              Recomendações com IA
            </h2>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: V.soft }}>
              Em breve teremos recomendações de jogos personalizados de acordo com o seu gosto!
            </p>
          </div>

          {/* Cards de preview do que virá */}
          <div className="space-y-2.5 text-left pt-2">
            <div
              className="p-3.5 rounded-2xl flex items-center gap-3 border transition-transform hover:scale-[1.02]"
              style={{ background: V.faint, borderColor: V.border }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${V.primary}25`, color: V.primary }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: V.text }}>
                  Baseado no que você zerou e amou
                </p>
                <p className="text-[11px]" style={{ color: V.muted }}>
                  Analisa suas notas altas e preferências reais de gameplay.
                </p>
              </div>
            </div>

            <div
              className="p-3.5 rounded-2xl flex items-center gap-3 border transition-transform hover:scale-[1.02]"
              style={{ background: V.faint, borderColor: V.border }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}
              >
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: V.text }}>
                  Alinhado ao seu tempo livre
                </p>
                <p className="text-[11px]" style={{ color: V.muted }}>
                  Sugestões sob medida para finais de semana ou maratonas.
                </p>
              </div>
            </div>

            <div
              className="p-3.5 rounded-2xl flex items-center gap-3 border transition-transform hover:scale-[1.02]"
              style={{ background: V.faint, borderColor: V.border }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6' }}
              >
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: V.text }}>
                  Descubra pérolas escondidas
                </p>
                <p className="text-[11px]" style={{ color: V.muted }}>
                  Títulos que você vai adorar e talvez nem saiba que existem.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-black text-white text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${V.primary}, ${V.secondary})`,
              boxShadow: `0 4px 20px ${V.glow}`,
            }}
          >
            Entendido, mal posso esperar! <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
