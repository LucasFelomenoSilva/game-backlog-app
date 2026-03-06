// src/components/GameTooltip.jsx — Mini perfil flutuante ao hover
import React, { useState, useRef } from 'react';
import { Star, Clock, Trophy, Calendar, Gamepad2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { categoryNames } from '../data/categories';

const getRatingColor = (r) => {
  if (r >= 9) return '#10b981';
  if (r >= 7) return '#06b6d4';
  if (r >= 5) return '#f59e0b';
  return '#f43f5e';
};

export default function GameTooltip({ game, children }) {
  const { theme: V } = useTheme();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const timerRef = useRef(null);

  const show = (e) => {
    timerRef.current = setTimeout(() => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        // Pega a posição logo à direita do card
        let x = rect.right + 12;
        let y = rect.top;

        // Proteção para telas menores (ex: celular). Se for vazar da tela pela direita, joga pro canto.
        if (x + 220 > window.innerWidth) {
           x = Math.max(10, window.innerWidth - 230);
        }
        
        setPos({ x, y: Math.max(y, 10) });
      }
      setVisible(true);
    }, 400); // Aparece depois de 400ms do mouse parado
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  if (!game) return children;

  const isFinished = game.status === 'zerados';
  const statusName = categoryNames[game.status] || game.status;

  return (
    <>
      {/* CORREÇÃO: Removido o 'contents' e adicionado 'block w-full relative' para manter o box model */}
      <div ref={ref} onMouseEnter={show} onMouseLeave={hide} className="block w-full relative">
        {children}
      </div>
      
      {visible && (
        <div className="fixed z-[300] pointer-events-none animate-fadeIn"
          style={{ left: pos.x, top: pos.y, width: '200px', transformOrigin: 'left top' }}>
          <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: V.card, border: `1px solid ${V.border}`, boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${V.border}` }}>
            {/* Capa */}
            <div className="relative h-28 overflow-hidden">
              {game.imageBase64 ? (
                <>
                  <img src={game.imageBase64} className="w-full h-full object-cover scale-110 blur-[1px]" alt="" style={{ filter: 'brightness(0.6)' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.9) 100%)' }} />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: V.card2 }}>
                  <Gamepad2 className="w-8 h-8" style={{ color: V.muted }} />
                </div>
              )}
              {game.imageBase64 && (
                <img src={game.imageBase64} className="absolute bottom-2 left-2 w-10 h-14 rounded-lg object-cover shadow-lg" alt={game.nome} style={{ border: `1px solid ${V.border}` }} />
              )}
              <div className="absolute top-2 right-2">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: `${V.primary}33`, color: V.soft, border: `1px solid ${V.primary}40` }}>
                  {statusName.replace(/[^\w\s]/g, '').trim()}
                </span>
              </div>
            </div>
            
            {/* Info */}
            <div className="p-3 space-y-2">
              <p className="text-sm font-black leading-tight" style={{ color: V.text }}>{game.nome}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: V.faint, color: V.muted }}>{game.platform}</span>
                <span className="text-[10px]" style={{ color: V.low }}>{game.genre}</span>
              </div>
              <div className="flex items-center justify-between pt-1" style={{ borderTop: `1px solid ${V.border}` }}>
                {game.timeToBeat > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" style={{ color: V.low }} />
                    <span className="text-[10px]" style={{ color: V.muted }}>{game.timeToBeat}h</span>
                  </div>
                )}
                {isFinished && game.rating > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${getRatingColor(game.rating)}20` }}>
                    <Star className="w-3 h-3 fill-current" style={{ color: getRatingColor(game.rating) }} />
                    <span className="text-[10px] font-black" style={{ color: getRatingColor(game.rating) }}>{game.rating}</span>
                  </div>
                )}
                {isFinished && game.isPlatinum && <span className="text-sm">🏆</span>}
              </div>
              {isFinished && game.finishedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" style={{ color: '#10b981' }} />
                  <span className="text-[9px]" style={{ color: '#10b981' }}>
                    {new Date(game.finishedDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}