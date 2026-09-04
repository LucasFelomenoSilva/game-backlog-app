// src/features/auth/LoadingScreen.jsx
import React from 'react';
import { Gamepad2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function LoadingScreen({ tip }) {
  const { theme: V } = useTheme();

  return (
    <div
      className="relative flex items-center justify-center min-h-screen overflow-hidden select-none"
      style={{ background: V.bg }}
    >
      {/* Luzes ambientais dinâmicas do tema */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 animate-pulse"
        style={{ background: V.grad }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-1/4 w-[450px] h-[450px] rounded-full blur-[130px] opacity-20"
        style={{ background: `radial-gradient(circle, ${V.primary}, transparent 70%)` }}
      />

      {/* Grid sutil de fundo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Card Central com animação de levitação */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: [0, -8, 0],
        }}
        transition={{
          y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 0.4 },
          scale: { duration: 0.4 },
        }}
        className="relative z-10 w-full max-w-sm mx-4 p-8 rounded-3xl border text-center shadow-2xl backdrop-blur-2xl"
        style={{
          background: `linear-gradient(135deg, ${V.card}e6, ${V.card2}cc)`,
          borderColor: `${V.primary}35`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${V.glow}, inset 0 0 20px ${V.primary}10`,
        }}
      >
        {/* Glow atrás do ícone */}
        <div className="relative mx-auto mb-5 w-20 h-20">
          <div
            className="absolute inset-0 rounded-2xl blur-xl opacity-60 animate-pulse"
            style={{ background: V.grad }}
          />
          <div
            className="relative w-full h-full rounded-2xl flex items-center justify-center border shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${V.card2}, ${V.card})`,
              borderColor: `${V.primary}60`,
              boxShadow: `0 8px 24px ${V.glow}`,
            }}
          >
            <Gamepad2
              className="w-10 h-10"
              style={{ color: V.soft }}
            />
          </div>

          {/* Partícula / Sparkle flutuante decorativa */}
          <motion.div
            animate={{ rotate: 360, scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1.5 -right-1.5 text-yellow-300"
          >
            <Sparkles className="w-4 h-4 fill-yellow-400/60" />
          </motion.div>
        </div>

        {/* Nome do app */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          <span className="text-sm font-black tracking-wider uppercase" style={{ color: V.text }}>
            Xp<span style={{ color: V.primary }}>Log</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: V.primary }} />
        </div>

        {/* Barra de Progresso Futurista */}
        <div
          className="relative w-56 h-2 mx-auto mb-5 rounded-full overflow-hidden p-[1px]"
          style={{ background: `${V.border}` }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: V.grad,
              boxShadow: `0 0 12px ${V.primary}`,
            }}
            initial={{ x: '-100%', width: '45%' }}
            animate={{ x: ['-100%', '240%'] }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </div>

        {/* Mensagem / Dica */}
        <motion.p
          key={tip}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold tracking-wide transition-colors"
          style={{ color: V.soft }}
        >
          {tip || 'Carregando suas aventuras...'}
        </motion.p>
      </motion.div>
    </div>
  );
}
