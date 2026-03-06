// src/components/MonthlyChart.jsx — Gráfico de barras mensais
import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MonthlyChart({ gamesData }) {
  const { theme: V } = useTheme();
  const [hovered, setHovered] = useState(null);

  const { monthlyData, maxCount, total, trend } = useMemo(() => {
    const now = new Date();
    const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const data = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const count = gamesData.filter(g => {
        if (g.status !== 'zerados' || !g.finishedDate) return false;
        const fd = new Date(g.finishedDate);
        return fd.getMonth() === month && fd.getFullYear() === year;
      }).length;
      data.push({ month: MONTHS[month], year, count, index: month });
    }

    const maxCount = Math.max(...data.map(d => d.count), 1);
    const total = data.reduce((s, d) => s + d.count, 0);
    const firstHalf = data.slice(0, 6).reduce((s, d) => s + d.count, 0);
    const secondHalf = data.slice(6).reduce((s, d) => s + d.count, 0);
    const trend = secondHalf > firstHalf ? 'up' : secondHalf < firstHalf ? 'down' : 'flat';

    return { monthlyData: data, maxCount, total, trend };
  }, [gamesData]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#f43f5e' : V.muted;

  return (
    <div className="rounded-3xl p-5" style={{ background: V.card, border: `1px solid ${V.border}` }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: V.muted }}>Últimos 12 meses</p>
          <p className="text-2xl font-black mt-0.5" style={{ color: V.text }}>{total} <span className="text-sm font-normal" style={{ color: V.muted }}>zerados</span></p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: `${trendColor}15`, border: `1px solid ${trendColor}30` }}>
          <TrendIcon className="w-4 h-4" style={{ color: trendColor }} />
          <span className="text-xs font-bold" style={{ color: trendColor }}>
            {trend === 'up' ? 'Acelerando' : trend === 'down' ? 'Desacelerando' : 'Estável'}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
          {[maxCount, Math.floor(maxCount / 2), 0].map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[9px] font-bold w-3 text-right flex-shrink-0" style={{ color: V.low }}>{v}</span>
              <div className="flex-1 border-t border-dashed opacity-20" style={{ borderColor: V.muted }} />
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="flex items-end gap-1 h-32 pl-6 pb-6">
          {monthlyData.map((d, i) => {
            const isHovered = hovered === i;
            const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
            const isEmpty = d.count === 0;

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end relative"
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>

                {/* Tooltip */}
                {isHovered && d.count > 0 && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-black whitespace-nowrap z-10 shadow-lg"
                    style={{ background: V.card2, border: `1px solid ${V.border}`, color: V.text }}>
                    {d.count} jogo{d.count !== 1 ? 's' : ''}
                  </div>
                )}

                {/* Bar */}
                <div className="w-full rounded-t-lg transition-all duration-300 relative overflow-hidden"
                  style={{
                    height: isEmpty ? '3px' : `${Math.max(pct, 8)}%`,
                    background: isEmpty ? V.faint : isHovered ? V.grad : `linear-gradient(to top, ${V.primary}cc, ${V.primary}66)`,
                    boxShadow: isHovered && !isEmpty ? `0 0 12px ${V.glow}` : 'none',
                    transform: isHovered ? 'scaleX(1.1)' : 'scaleX(1)',
                  }}>
                  {!isEmpty && (
                    <div className="absolute inset-0 opacity-30"
                      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }} />
                  )}
                </div>

                {/* Label */}
                <span className="text-[8px] font-bold" style={{ color: isHovered ? V.primary : V.low }}>
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}