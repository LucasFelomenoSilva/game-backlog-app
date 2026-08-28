// src/components/WrappedScreen.jsx — Spotify Wrapped estilo Gaming
import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Star, Clock, Gamepad2, Heart, Zap, Award, ChevronRight, Share2, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
// html2canvas: import dinâmico na função de export
import { toast } from 'react-hot-toast';

const SLIDES = ['intro', 'topGame', 'stats', 'genre', 'timeline', 'platinum', 'finale'];
const WRAPPED_PARTICLES = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  size: 20 + ((index * 29) % 60),
  left: (index * 37) % 100,
  top: (index * 61) % 100,
  delay: (index % 10) * 0.3,
  duration: 2 + (index % 6) * 0.5,
}));

function useCountUp(target, duration = 1500, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return val;
}

// ── Slide: Intro ──────────────────────────────────────────────────────────────
function SlideIntro({ year, V }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 relative overflow-hidden">
      <div className="absolute inset-0">
        {WRAPPED_PARTICLES.map((particle) => (
          <div key={particle.id} className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              width: `${particle.size}px`, height: `${particle.size}px`,
              left: `${particle.left}%`, top: `${particle.top}%`,
              background: V.grad, animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }} />
        ))}
      </div>
      <div className="relative z-10">
        <div className="text-8xl mb-6 animate-bounce">🎮</div>
        <h1 className="text-5xl font-black mb-3" style={{ color: V.text, fontFamily: 'system-ui' }}>
          {year}
        </h1>
        <p className="text-2xl font-bold mb-2" style={{ background: V.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Gaming Wrapped
        </p>
        <p className="text-base" style={{ color: V.muted }}>Seu ano em jogos resumido</p>
      </div>
    </div>
  );
}

// ── Slide: Top Game ───────────────────────────────────────────────────────────
function SlideTopGame({ game, V }) {
  if (!game) return (
    <div className="flex flex-col items-center justify-center h-full" style={{ color: V.muted }}>
      <Gamepad2 className="w-16 h-16 mb-4 opacity-30" />
      <p>Nenhum jogo zerado este ano</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <p className="text-xs font-black uppercase tracking-widest mb-6 px-4 py-2 rounded-full" style={{ background: `${V.primary}25`, color: V.soft, border: `1px solid ${V.primary}40` }}>
        ⭐ Seu Jogo do Ano
      </p>
      <div className="relative mb-6">
        <div className="absolute -inset-2 rounded-3xl blur-2xl opacity-60" style={{ background: V.grad }} />
        <div className="relative w-48 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl" style={{ border: `3px solid ${V.primary}` }}>
          {game.imageBase64
            ? <img src={game.imageBase64} className="w-full h-full object-cover" alt={game.nome} />
            : <div className="w-full h-full flex items-center justify-center" style={{ background: V.card }}><Gamepad2 className="w-16 h-16" style={{ color: V.muted }} /></div>
          }
        </div>
        {game.rating > 0 && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-4 py-1.5 rounded-full font-black shadow-lg" style={{ background: V.grad, color: 'white' }}>
            <Star className="w-4 h-4 fill-white" />
            <span>{game.rating}/10</span>
          </div>
        )}
      </div>
      <h2 className="text-2xl font-black mt-4 mb-1" style={{ color: V.text }}>{game.nome}</h2>
      <p className="text-sm" style={{ color: V.muted }}>{game.platform} · {game.genre}</p>
    </div>
  );
}

// ── Slide: Stats ──────────────────────────────────────────────────────────────
function SlideStats({ stats, V, active }) {
  const zerados = useCountUp(stats.zerados, 1200, active);
  const horas = useCountUp(stats.horas, 1400, active);
  const platinas = useCountUp(stats.platinas, 1000, active);

  return (
    <div className="flex flex-col justify-center h-full px-6">
      <p className="text-xs font-black uppercase tracking-widest mb-8 text-center px-4 py-2 rounded-full w-fit mx-auto" style={{ background: `${V.accent}25`, color: V.soft, border: `1px solid ${V.accent}40` }}>
        📊 Seus Números
      </p>
      <div className="space-y-5">
        {[
          { label: 'jogos zerados', value: zerados, icon: '✅', color: '#10b981' },
          { label: 'horas jogadas', value: `${horas}h`, icon: '⏱️', color: V.primary },
          { label: 'platinas conquistadas', value: platinas, icon: '🏆', color: '#f59e0b' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="flex items-center gap-5 p-5 rounded-2xl" style={{ background: V.card, border: `1px solid ${V.border}` }}>
            <span className="text-4xl">{icon}</span>
            <div>
              <div className="text-4xl font-black" style={{ color }}>{value}</div>
              <div className="text-sm" style={{ color: V.muted }}>{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide: Gênero ─────────────────────────────────────────────────────────────
function SlideGenre({ genreData, V, active }) {
  const top = genreData[0];
  return (
    <div className="flex flex-col justify-center h-full px-6 text-center">
      <p className="text-xs font-black uppercase tracking-widest mb-6 px-4 py-2 rounded-full w-fit mx-auto" style={{ background: `${V.primary}25`, color: V.soft, border: `1px solid ${V.primary}40` }}>
        🎯 Seu Gênero
      </p>
      {top ? (
        <>
          <div className="text-7xl mb-4">🕹️</div>
          <h2 className="text-4xl font-black mb-2" style={{ background: V.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{top.genre}</h2>
          <p className="text-lg mb-8" style={{ color: V.muted }}>foi seu gênero favorito com <strong style={{ color: V.text }}>{top.count} jogos</strong></p>
          <div className="space-y-3">
            {genreData.slice(0, 4).map((g, i) => {
              const pct = Math.round((g.count / genreData[0].count) * 100);
              return (
                <div key={g.genre} className="flex items-center gap-3">
                  <span className="text-xs font-black w-4 text-right" style={{ color: V.muted }}>#{i + 1}</span>
                  <span className="text-sm font-bold w-24 text-left truncate" style={{ color: V.text }}>{g.genre}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: V.faint }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: active ? `${pct}%` : '0%', background: V.grad, transitionDelay: `${i * 150}ms` }} />
                  </div>
                  <span className="text-xs font-black" style={{ color: V.soft }}>{g.count}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : <p style={{ color: V.muted }}>Zere mais jogos para ver seu gênero favorito!</p>}
    </div>
  );
}

// ── Slide: Timeline ───────────────────────────────────────────────────────────
function SlideTimeline({ monthlyData, V, active }) {
  const max = Math.max(...monthlyData.map(m => m.count), 1);
  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  return (
    <div className="flex flex-col justify-center h-full px-6">
      <p className="text-xs font-black uppercase tracking-widest mb-6 px-4 py-2 rounded-full w-fit" style={{ background: `${V.accent}25`, color: V.soft, border: `1px solid ${V.accent}40` }}>
        📅 Sua Jornada
      </p>
      <div className="flex items-end gap-2 h-36">
        {MONTHS.map((month, i) => {
          const d = monthlyData.find(m => m.month === i) || { count: 0 };
          const h = max > 0 ? (d.count / max) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg transition-all duration-700 relative group" style={{ height: active ? `${Math.max(h, 4)}%` : '4%', background: d.count > 0 ? V.grad : V.faint, transitionDelay: `${i * 60}ms`, minHeight: '6px' }}>
                {d.count > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: V.primary }}>{d.count}</div>
                )}
              </div>
              <span className="text-[9px] font-bold" style={{ color: d.count > 0 ? V.soft : V.low }}>{month}</span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-sm mt-4" style={{ color: V.muted }}>Jogos zerados por mês</p>
    </div>
  );
}

// ── Slide: Platinas ───────────────────────────────────────────────────────────
function SlidePlatinum({ platinumGames, V }) {
  return (
    <div className="flex flex-col justify-center h-full px-6">
      <p className="text-xs font-black uppercase tracking-widest mb-6 px-4 py-2 rounded-full w-fit" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
        🏆 Hall da Fama
      </p>
      {platinumGames.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg font-bold" style={{ color: V.muted }}>Nenhuma platina ainda...</p>
          <p className="text-sm mt-2" style={{ color: V.low }}>Que tal tentar 100% em algum jogo?</p>
        </div>
      ) : (
        <>
          <p className="text-5xl font-black mb-2" style={{ color: '#f59e0b' }}>{platinumGames.length}</p>
          <p className="text-lg mb-6" style={{ color: V.muted }}>
            {platinumGames.length === 1 ? 'jogo platinado!' : 'jogos platinados!'} Incrível! 💪
          </p>
          <div className="space-y-3">
            {platinumGames.slice(0, 4).map((game) => (
              <div key={game.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <span className="text-xl">🏆</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: '#fbbf24' }}>{game.nome}</p>
                  <p className="text-xs" style={{ color: V.muted }}>{game.platform}</p>
                </div>
                {game.rating > 0 && (
                  <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}>{game.rating}/10</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Slide: Finale ─────────────────────────────────────────────────────────────
function SlideFinale({ stats, V, onExport, exporting }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {['🎮','⭐','🏆','🎯','💎','🔥','✅','🕹️'].map((emoji, i) => (
          <div key={i} className="absolute text-4xl animate-bounce opacity-20"
            style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.3}s` }}>
            {emoji}
          </div>
        ))}
      </div>
      <div className="relative z-10">
        <div className="text-7xl mb-6">🌟</div>
        <h2 className="text-3xl font-black mb-3" style={{ color: V.text }}>Que ano épico!</h2>
        <p className="text-base mb-8 leading-relaxed" style={{ color: V.muted }}>
          Você zerou <strong style={{ color: V.primary }}>{stats.zerados}</strong> jogos,<br/>
          acumulou <strong style={{ color: V.primary }}>{stats.horas}h</strong> de jogatina<br/>
          e conquistou <strong style={{ color: '#f59e0b' }}>{stats.platinas}</strong> platinas!
        </p>
        <button onClick={onExport} disabled={exporting}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white mx-auto transition-all hover:scale-105 shadow-xl"
          style={{ background: V.grad, boxShadow: `0 4px 20px ${V.glow}` }}>
          {exporting ? '⏳ Gerando...' : <><Share2 className="w-5 h-5" /> Compartilhar Wrapped</>}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function WrappedScreen({ gamesData, onClose }) {
  const { theme: V } = useTheme();
  const [slide, setSlide] = useState(0);
  const [active, setActive] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef(null);
  const year = new Date().getFullYear();

  useEffect(() => { setTimeout(() => setActive(true), 300); }, [slide]);

  const yearGames = gamesData.filter(g => {
    if (g.status !== 'zerados' || !g.finishedDate) return false;
    return new Date(g.finishedDate).getFullYear() === year;
  });

  const stats = {
    zerados: yearGames.length,
    horas: yearGames.reduce((s, g) => s + (parseInt(g.timeToBeat) || 0), 0),
    platinas: yearGames.filter(g => g.isPlatinum).length,
  };

  const topGame = yearGames.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0] || null;

  const genreData = Object.entries(
    yearGames.reduce((acc, g) => { if (g.genre) acc[g.genre] = (acc[g.genre] || 0) + 1; return acc; }, {})
  ).map(([genre, count]) => ({ genre, count })).sort((a, b) => b.count - a.count);

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    count: yearGames.filter(g => new Date(g.finishedDate).getMonth() === i).length,
  }));

  const platinumGames = yearGames.filter(g => g.isPlatinum);

  const goNext = () => {
    setActive(false);
    setTimeout(() => { setSlide(s => Math.min(s + 1, SLIDES.length - 1)); setActive(false); setTimeout(() => setActive(true), 100); }, 200);
  };
  const goPrev = () => {
    setActive(false);
    setTimeout(() => { setSlide(s => Math.max(s - 1, 0)); setActive(false); setTimeout(() => setActive(true), 100); }, 200);
  };

  const handleExport = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(exportRef.current, { backgroundColor: V.bg, scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `gaming-wrapped-${year}.png`;
      link.click();
      toast.success('Wrapped salvo!');
    } catch { toast.error('Erro ao exportar.'); }
    finally { setExporting(false); }
  };

  const slideComponents = [
    <SlideIntro year={year} V={V} active={active} />,
    <SlideTopGame game={topGame} V={V} active={active} />,
    <SlideStats stats={stats} V={V} active={active} />,
    <SlideGenre genreData={genreData} V={V} active={active} />,
    <SlideTimeline monthlyData={monthlyData} V={V} active={active} />,
    <SlidePlatinum platinumGames={platinumGames} V={V} active={active} />,
    <SlideFinale stats={stats} V={V} onExport={handleExport} exporting={exporting} />,
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}>
      <div ref={exportRef} className="relative w-full max-w-sm shadow-2xl overflow-hidden" style={{ height: '600px', borderRadius: '32px', background: `radial-gradient(ellipse at top, ${V.card2} 0%, ${V.bg} 100%)`, border: `1px solid ${V.border}`, boxShadow: `0 0 80px ${V.glow}` }}>

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${V.border}` }}>
          <X className="w-4 h-4" style={{ color: V.muted }} />
        </button>

        {/* Progress dots */}
        <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 z-20 px-8">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => { setActive(false); setSlide(i); setTimeout(() => setActive(true), 100); }}
              className="h-1 rounded-full transition-all duration-300"
              style={{ background: i <= slide ? V.primary : V.faint, width: i === slide ? '24px' : '8px' }} />
          ))}
        </div>

        {/* Content */}
        <div className="w-full h-full pt-12 pb-16 transition-opacity duration-300" style={{ opacity: active ? 1 : 0 }}>
          {slideComponents[slide]}
        </div>

        {/* Navigation */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-6 z-20">
          <button onClick={goPrev} disabled={slide === 0} className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
            style={{ background: V.faint, color: V.muted, border: `1px solid ${V.border}` }}>
            ←
          </button>
          <span className="text-xs font-bold" style={{ color: V.low }}>{slide + 1} / {SLIDES.length}</span>
          <button onClick={goNext} disabled={slide === SLIDES.length - 1} className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-30 flex items-center gap-1"
            style={{ background: V.grad, color: 'white' }}>
            {slide === SLIDES.length - 1 ? '🎉' : <>Próximo <ChevronRight className="w-3 h-3" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
