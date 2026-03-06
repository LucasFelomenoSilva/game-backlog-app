// src/components/LevelUpOverlay.jsx — Animação épica de level up
import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const LEVEL_TITLES = {
  1: 'Iniciante', 2: 'Explorador', 3: 'Aventureiro', 4: 'Guerreiro',
  5: 'Veterano', 6: 'Especialista', 7: 'Mestre', 8: 'Grande Mestre',
  9: 'Campeão', 10: 'Lendário', 11: 'Épico', 12: 'Mítico',
};

function Particle({ V }) {
  const style = {
    position: 'absolute',
    width: `${4 + Math.random() * 8}px`,
    height: `${4 + Math.random() * 8}px`,
    borderRadius: '50%',
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    background: [V.primary, V.secondary, V.accent, '#f59e0b', '#10b981'][Math.floor(Math.random() * 5)],
    animation: `levelup-fall ${1 + Math.random() * 2}s ease-in forwards`,
    animationDelay: `${Math.random() * 0.5}s`,
  };
  return <div style={style} />;
}

export default function LevelUpOverlay({ level, onDone }) {
  const { theme: V } = useTheme();
  const [phase, setPhase] = useState('enter'); // enter | show | exit
  const title = LEVEL_TITLES[level] || 'Lendário+';

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 3500);
    const t3 = setTimeout(() => onDone?.(), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes levelup-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
        }
        @keyframes levelup-ring {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes levelup-number {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes levelup-glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.4); }
        }
      `}</style>
      <div className="fixed inset-0 z-[500] flex items-center justify-center pointer-events-none"
        style={{ background: phase === 'exit' ? 'transparent' : 'rgba(0,0,0,0.7)', transition: 'background 0.5s', backdropFilter: phase !== 'exit' ? 'blur(8px)' : 'none' }}>
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => <Particle key={i} V={V} />)}
        </div>
        <div className="relative text-center" style={{ opacity: phase === 'enter' ? 0 : phase === 'exit' ? 0 : 1, transform: phase === 'exit' ? 'translateY(-40px) scale(0.8)' : 'translateY(0) scale(1)', transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          {/* Anéis pulsantes */}
          {[1, 2, 3].map(i => (
            <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{ width: `${160 + i * 40}px`, height: `${160 + i * 40}px`, borderColor: V.primary, opacity: 0, animation: `levelup-ring 1.5s ease-out ${i * 0.2}s infinite` }} />
          ))}
          <div className="relative z-10 px-12 py-8 rounded-3xl" style={{ background: `linear-gradient(135deg, ${V.card}, ${V.card2})`, border: `2px solid ${V.primary}`, boxShadow: `0 0 60px ${V.glow}, inset 0 0 30px ${V.faint}`, animation: 'levelup-glow 2s ease-in-out infinite' }}>
            <div className="text-xs font-black uppercase tracking-[0.3em] mb-3" style={{ color: V.muted }}>Level Up!</div>
            <div className="text-8xl font-black mb-2" style={{ background: V.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'levelup-number 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
              {level}
            </div>
            <div className="text-xl font-black" style={{ color: V.text }}>{title}</div>
            <div className="mt-4 text-sm" style={{ color: V.muted }}>Nível desbloqueado! 🎉</div>
          </div>
        </div>
      </div>
    </>
  );
}