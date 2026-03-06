// src/components/ActivityHeatmap.jsx — Calendário de calor estilo GitHub
import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

function getIntensity(count) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

export default function ActivityHeatmap({ gamesData }) {
  const { theme: V } = useTheme();

  const { cells, months, maxCount, totalThisYear } = useMemo(() => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);

    // Mapa de data → contagem
    const dateMap = {};
    gamesData.filter(g => g.status === 'zerados' && g.finishedDate).forEach(g => {
      const d = new Date(g.finishedDate);
      const key = d.toISOString().split('T')[0];
      dateMap[key] = (dateMap[key] || 0) + 1;
    });

    // Gerar células (52 semanas × 7 dias)
    const cells = [];
    const months = [];
    let currentMonth = -1;
    let col = 0;

    const startDate = new Date(yearStart);
    const dayOfWeek = startDate.getDay() || 7;
    startDate.setDate(startDate.getDate() - dayOfWeek + 1);

    for (let week = 0; week < 53; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + week * 7 + day);
        const key = date.toISOString().split('T')[0];
        const count = dateMap[key] || 0;
        const month = date.getMonth();

        if (month !== currentMonth && day === 0) {
          months.push({ month, week });
          currentMonth = month;
        }

        if (date <= now) {
          cells.push({ key, count, date, week, day });
        }
      }
    }

    const maxCount = Math.max(...Object.values(dateMap), 1);
    const yearStartStr = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    const totalThisYear = Object.entries(dateMap).filter(([k]) => k >= yearStartStr).reduce((s, [, v]) => s + v, 0);

    return { cells, months, maxCount, totalThisYear };
  }, [gamesData]);

  const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const getColor = (count) => {
    if (count === 0) return V.faint;
    const intensities = [
      `${V.primary}30`, `${V.primary}55`, `${V.primary}80`, `${V.primary}bb`, V.primary
    ];
    return intensities[Math.min(getIntensity(count), 4)];
  };

  // Agrupar por semana
  const weeks = [];
  for (let w = 0; w <= 52; w++) {
    weeks.push(cells.filter(c => c.week === w));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: V.muted }}>Atividade (últimos 12 meses)</p>
        <span className="text-xs font-black" style={{ color: V.primary }}>{totalThisYear} zerados este ano</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: '600px' }}>
          {/* Month labels */}
          <div className="flex mb-1 ml-6" style={{ gap: '2px' }}>
            {weeks.map((_, i) => {
              const monthInfo = months.find(m => m.week === i);
              return (
                <div key={i} style={{ width: '11px', flexShrink: 0 }}>
                  {monthInfo && <span className="text-[9px] font-bold" style={{ color: V.muted }}>{MONTH_NAMES[monthInfo.month]}</span>}
                </div>
              );
            })}
          </div>

          <div className="flex" style={{ gap: '2px' }}>
            {/* Day labels */}
            <div className="flex flex-col mr-1" style={{ gap: '2px' }}>
              {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                <div key={i} className="text-[9px] font-bold flex items-center justify-center" style={{ width: '11px', height: '11px', color: V.low }}>{i % 2 === 0 ? d : ''}</div>
              ))}
            </div>

            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: '2px' }}>
                {Array.from({ length: 7 }).map((_, di) => {
                  const cell = week.find(c => c.day === di);
                  if (!cell) return <div key={di} style={{ width: '11px', height: '11px' }} />;
                  return (
                    <div key={di}
                      title={`${cell.date.toLocaleDateString('pt-BR')}: ${cell.count} jogo${cell.count !== 1 ? 's' : ''} zerado${cell.count !== 1 ? 's' : ''}`}
                      className="rounded-sm transition-all hover:scale-150 cursor-default"
                      style={{ width: '11px', height: '11px', background: getColor(cell.count), border: cell.count > 0 ? `1px solid ${V.primary}40` : `1px solid ${V.faint}` }} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px]" style={{ color: V.low }}>Menos</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ background: i === 0 ? V.faint : `${V.primary}${['30','55','80','bb','ff'][i]}` }} />
        ))}
        <span className="text-[10px]" style={{ color: V.low }}>Mais</span>
      </div>
    </div>
  );
}