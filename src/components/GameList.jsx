// src/components/GameList.jsx
import React, { useState, useMemo, useRef } from 'react';
import { ChevronLeft, Clock, Star, Trophy, Gamepad2, Search, ArrowDownUp, Calendar, Filter, Share2, Download } from 'lucide-react';
import { categoryNames } from '../data/categories';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext'; // <-- Importado

const getRatingHex = (rating) => {
  if (rating >= 9) return '#10b981';
  if (rating >= 7) return '#06b6d4';
  if (rating >= 5) return '#f59e0b';
  return '#ef4444';
};

const ListHeader = ({
  categoryName, count, onBack, searchTerm, setSearchTerm, sortOption, setSortOption,
  selectedYear, setSelectedYear, availableYears, showFilters, onExport, isExporting,
  showPlatinumOnly, setShowPlatinumOnly, platinumCount, V // <-- Recebe o tema
}) => (
  <div className="sticky top-0 z-50 -mx-4 px-4 py-4 mb-6 shadow-xl border-b"
       style={{ background: `${V.bg}e6`, backdropFilter: 'blur(20px)', borderColor: V.border }}>
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="group flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 hover:scale-105"
                style={{ background: V.card, borderColor: V.border }}>
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" style={{ color: V.text }} />
        </button>
        <div className="flex-1 text-center min-w-0">
          <div className={`inline-block px-4 py-1.5 rounded-full max-w-full`}
               style={{ background: `linear-gradient(to right, ${V.primary}, ${V.secondary})` }}>
            <h2 className="text-sm sm:text-base font-black text-white tracking-wide uppercase truncate">{categoryName}</h2>
          </div>
        </div>
        {showFilters && count > 0 && (
          <button onClick={onExport} disabled={isExporting}
            className="flex-shrink-0 p-2 rounded-xl text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: `linear-gradient(to right, ${V.accent}, ${V.primary})` }}
            title="Exportar imagem da coleção">
            {isExporting ? <Download className="w-5 h-5 animate-bounce" /> : <Share2 className="w-5 h-5" />}
          </button>
        )}
      </div>

      {showFilters && platinumCount > 0 && (
        <div className="flex justify-center">
          <button onClick={() => setShowPlatinumOnly(!showPlatinumOnly)}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border-2`}
            style={{
              background: showPlatinumOnly ? 'rgba(245,158,11,0.2)' : V.card,
              color: showPlatinumOnly ? '#fbbf24' : V.muted,
              borderColor: showPlatinumOnly ? '#f59e0b' : V.border
            }}>
            <Trophy className={`w-4 h-4 ${showPlatinumOnly ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            {showPlatinumOnly ? `Platinas (${platinumCount})` : `Ver Platinas (${platinumCount})`}
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: V.muted }} />
          <input type="text" placeholder="Buscar..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all border"
            style={{ background: V.card, borderColor: V.border, color: V.text }} />
        </div>
        {showFilters && availableYears.length > 0 && (
          <div className="relative flex-shrink-0 w-24 sm:w-28">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Filter className="w-3.5 h-3.5" style={{ color: V.muted }} />
            </div>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full pl-8 pr-2 py-2.5 rounded-xl text-xs sm:text-sm appearance-none outline-none cursor-pointer border"
              style={{ background: V.card, borderColor: V.border, color: V.text }}>
              <option value="all">Todos</option>
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        )}
        <div className="relative flex-shrink-0">
          <ArrowDownUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: V.muted }} />
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}
            className="pl-9 pr-3 py-2.5 rounded-xl text-sm appearance-none outline-none cursor-pointer border"
            style={{ background: V.card, borderColor: V.border, color: V.text }}>
            <option value="name_asc">A-Z</option>
            {showFilters && (
              <>
                <option value="rating_desc">Nota</option>
                <option value="date_desc">Novos</option>
                <option value="date_asc">Antigos</option>
              </>
            )}
          </select>
        </div>
      </div>
    </div>
  </div>
);

export default function GameList({ selectedCategory, setSelectedCategory, games, setSelectedGame }) {
  const { theme: V } = useTheme(); // <-- Usando as cores do tema
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortOption, setSortOption] = useState(selectedCategory === 'zerados' ? 'date_desc' : 'name_asc');
  const [showPlatinumOnly, setShowPlatinumOnly] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef(null);

  const safeGames = games || {};
  const categoryGames = safeGames[selectedCategory] || [];
  const categoryName = categoryNames[selectedCategory] || 'Categoria';

  const availableYears = useMemo(() => {
    if (selectedCategory !== 'zerados') return [];
    const years = new Set();
    categoryGames.forEach(game => {
      if (game.finishedDate) years.add(new Date(game.finishedDate).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [categoryGames, selectedCategory]);

  const platinumCount = useMemo(() => categoryGames.filter(g => g.isPlatinum).length, [categoryGames]);

  const filteredGames = useMemo(() => {
    let result = categoryGames.filter(game =>
      game.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (showPlatinumOnly && selectedCategory === 'zerados') {
      result = result.filter(game => game.isPlatinum);
    }
    if (selectedCategory === 'zerados' && selectedYear !== 'all') {
      result = result.filter(game => {
        if (!game.finishedDate) return false;
        return new Date(game.finishedDate).getFullYear().toString() === selectedYear;
      });
    }
    result.sort((a, b) => {
      switch (sortOption) {
        case 'rating_desc': return (b.rating || 0) - (a.rating || 0);
        case 'date_desc':
          if (!a.finishedDate) return 1;
          if (!b.finishedDate) return -1;
          return new Date(b.finishedDate) - new Date(a.finishedDate);
        case 'date_asc':
          if (!a.finishedDate) return 1;
          if (!b.finishedDate) return -1;
          return new Date(a.finishedDate) - new Date(b.finishedDate);
        default: return a.nome.localeCompare(b.nome);
      }
    });
    return result;
  }, [categoryGames, searchTerm, sortOption, selectedYear, selectedCategory, showPlatinumOnly]);

  const exportGames = useMemo(() => {
    let list = [...categoryGames];
    if (selectedYear !== 'all') {
      list = list.filter(g => g.finishedDate &&
        new Date(g.finishedDate).getFullYear().toString() === selectedYear);
    }
    return list.sort((a, b) => {
      if (!a.finishedDate) return 1;
      if (!b.finishedDate) return -1;
      return new Date(b.finishedDate) - new Date(a.finishedDate);
    });
  }, [categoryGames, selectedYear]);

  const exportStats = useMemo(() => {
    const rated = exportGames.filter(g => g.rating > 0);
    const avgRating = rated.length > 0 ? (rated.reduce((s, g) => s + parseFloat(g.rating), 0) / rated.length).toFixed(1) : '—';
    const totalHours = exportGames.reduce((s, g) => s + (parseInt(g.timeToBeat) || 0), 0);
    const platinas = exportGames.filter(g => g.isPlatinum).length;
    const topGame = rated.length > 0 ? [...rated].sort((a, b) => b.rating - a.rating)[0] : null;
    return { avgRating, totalHours, platinas, topGame };
  }, [exportGames]);

  const handleExportImage = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    const toastId = 'export-toast';
    toast.loading('Gerando imagem da coleção...', { id: toastId });

    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: V.bg,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector('[data-export-root]');
          if (el) el.style.left = '0';
        },
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `meus-zerados${selectedYear !== 'all' ? `-${selectedYear}` : ''}.png`;
      link.click();
      toast.success('Imagem salva!', { id: toastId });
    } catch (error) {
      toast.error('Erro ao gerar imagem.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const commonProps = {
    categoryName, count: filteredGames.length, onBack: () => setSelectedCategory(null),
    searchTerm, setSearchTerm, sortOption, setSortOption, selectedYear, setSelectedYear, availableYears,
    showFilters: selectedCategory === 'zerados', onExport: handleExportImage, isExporting,
    showPlatinumOnly, setShowPlatinumOnly, platinumCount, V
  };

  if (categoryGames.length === 0 && !searchTerm) {
    return (
      <div className="min-h-screen" style={{ background: V.bg }}>
        <ListHeader {...commonProps} />
        <div className="max-w-md mx-auto px-4 pb-20">
          <div className="text-center py-20 rounded-3xl border" style={{ background: V.card, borderColor: V.border }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: V.faint }}>
              <Gamepad2 className="w-8 h-8" style={{ color: V.muted }} />
            </div>
            <p style={{ color: V.muted }}>Nenhum jogo nesta categoria.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: V.bg }}>
      <ListHeader {...commonProps} />

      <div className="max-w-md mx-auto px-4 pb-20">
        <div className="space-y-3">
          {filteredGames.length === 0 ? (
            <div className="text-center py-10" style={{ color: V.muted }}>
              Nenhum jogo encontrado {selectedYear !== 'all' ? `em ${selectedYear}` : ''}
            </div>
          ) : (
            filteredGames.map((game) => {
              const isFinished = game.status === 'zerados';
              const isPlatinum = game.isPlatinum;
              return (
                <button key={game.id} onClick={() => setSelectedGame(game)}
                  className={`group w-full rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] text-left shadow-lg overflow-hidden relative`}
                  style={{
                    background: isFinished ? (isPlatinum ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)') : V.card,
                    borderColor: isFinished ? (isPlatinum ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)') : V.border
                  }}>
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-base mb-2 truncate`}
                          style={{ color: isPlatinum ? '#fbbf24' : isFinished ? '#34d399' : V.text }}>
                        {game.nome}
                      </h3>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold border"
                              style={{ background: V.faint, color: V.muted, borderColor: V.border }}>
                          {game.platform}
                        </span>
                        {isPlatinum && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)' }}>
                            <Trophy className="w-3 h-3 fill-yellow-900 text-yellow-900" />
                            <span className="text-xs font-black text-yellow-900">PLATINA</span>
                          </div>
                        )}
                        {isFinished && game.rating > 0 && (
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md`} style={{ background: getRatingHex(game.rating) }}>
                            <Star className="w-3 h-3 fill-white text-white" />
                            <span className="text-xs font-bold text-white">{game.rating}</span>
                          </div>
                        )}
                        {isFinished && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' }}>
                            <Calendar className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-300">
                              {game.finishedDate ? new Date(game.finishedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Sem data'}
                            </span>
                          </div>
                        )}
                        {!isFinished && game.timeToBeat > 0 && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border" style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)' }}>
                            <Clock className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-blue-300">{game.timeToBeat}h</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isFinished && <Trophy className={`w-4 h-4 ${isPlatinum ? 'text-yellow-500 fill-yellow-500' : 'text-emerald-500'}`} />}
                      <ChevronLeft className="w-5 h-5 transition-colors rotate-180" style={{ color: V.muted }} />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div data-export-root className="fixed top-0 left-[-9999px] pointer-events-none" aria-hidden="true">
        <div ref={exportRef}
          style={{
            width: '1080px', minHeight: '1080px',
            background: `linear-gradient(135deg, ${V.bg} 0%, ${V.card} 50%, ${V.bg} 100%)`,
            padding: '64px', fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative', overflow: 'hidden', color: V.text,
          }}>
          {/* Header e layout de exportação mantidos similares, mas usando V.text/V.primary */}
          <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `linear-gradient(135deg, ${V.primary}, ${V.secondary})`, borderRadius: '50px', padding: '6px 18px', marginBottom: '14px' }}>
                <span style={{ fontSize: '16px' }}>✅</span>
                <span style={{ color: 'white', fontWeight: 900, fontSize: '12px', letterSpacing: '2px' }}>JOGOS ZERADOS</span>
              </div>
              <div style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.1, color: V.text }}>Minha Coleção</div>
              {selectedYear !== 'all' && <div style={{ fontSize: '32px', fontWeight: 900, color: V.accent, marginTop: '4px' }}>{selectedYear}</div>}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {[
                { label: 'Total', value: exportGames.length, color: V.primary },
                { label: 'Nota Média', value: exportStats.avgRating, color: '#f59e0b' },
                { label: 'Horas', value: `${exportStats.totalHours}h`, color: V.accent },
                ...(exportStats.platinas > 0 ? [{ label: 'Platinas 🏆', value: exportStats.platinas, color: '#fbbf24' }] : []),
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center', background: V.faint, border: `1px solid ${V.border}`, borderRadius: '14px', padding: '14px 18px', minWidth: '80px' }}>
                  <div style={{ fontSize: '26px', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '10px', color: V.muted, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {exportGames.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(Math.max(exportGames.length, 4), 9)}, 1fr)`, gap: '10px', marginBottom: '36px' }}>
              {exportGames.slice(0, 36).map((game) => (
                <div key={game.id} style={{ position: 'relative' }}>
                  <div style={{ aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden', border: game.isPlatinum ? '2px solid #f59e0b' : `1px solid ${V.border}`, background: V.card2 }}>
                    {game.imageBase64 ? (
                      <img src={game.imageBase64} alt={game.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} crossOrigin="anonymous" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: V.card, fontSize: '24px' }}>🎮</div>
                    )}
                  </div>
                  {game.rating > 0 && (
                    <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: getRatingHex(game.rating), borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900, color: 'white', border: `2px solid ${V.bg}`, lineHeight: 1 }}>{game.rating}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}