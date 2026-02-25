import React, { useState, useMemo, useRef } from 'react';
import { ChevronLeft, Clock, Star, Trophy, Gamepad2, Search, ArrowDownUp, Calendar, Filter, Share2, Download } from 'lucide-react';
import { categoryNames } from '../data/categories';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';

const getRatingColor = (rating) => {
  if (rating >= 9) return 'from-emerald-500 to-teal-500';
  if (rating >= 7) return 'from-cyan-500 to-blue-500';
  if (rating >= 5) return 'from-yellow-500 to-orange-500';
  return 'from-red-500 to-pink-500';
};

const getRatingHex = (rating) => {
  if (rating >= 9) return '#10b981';
  if (rating >= 7) return '#06b6d4';
  if (rating >= 5) return '#f59e0b';
  return '#ef4444';
};

const getCategoryGradient = (category) => {
  const gradients = {
    playing: 'from-orange-500 to-red-500',
    installed: 'from-blue-500 to-cyan-500',
    backlog: 'from-purple-500 to-pink-500',
    zerados: 'from-green-500 to-emerald-500',
    desejados: 'from-yellow-500 to-amber-500',
  };
  return gradients[category] || 'from-gray-500 to-gray-600';
};

const ListHeader = ({
  categoryName, categoryGradient, count, onBack,
  searchTerm, setSearchTerm, sortOption, setSortOption,
  selectedYear, setSelectedYear, availableYears,
  showFilters, onExport, isExporting,
  showPlatinumOnly, setShowPlatinumOnly, platinumCount
}) => (
  <div className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50 -mx-4 px-4 py-4 mb-6 shadow-xl">
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="group flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl border border-gray-700/50 transition-all duration-300 hover:scale-105">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div className="flex-1 text-center min-w-0">
          <div className={`inline-block px-4 py-1.5 bg-gradient-to-r ${categoryGradient} rounded-full max-w-full`}>
            <h2 className="text-sm sm:text-base font-black text-white tracking-wide uppercase truncate">{categoryName}</h2>
          </div>
        </div>
        {showFilters && count > 0 && (
          <button onClick={onExport} disabled={isExporting}
            className="flex-shrink-0 p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            title="Exportar imagem da coleção">
            {isExporting ? <Download className="w-5 h-5 animate-bounce" /> : <Share2 className="w-5 h-5" />}
          </button>
        )}
      </div>

      {showFilters && platinumCount > 0 && (
        <div className="flex justify-center">
          <button onClick={() => setShowPlatinumOnly(!showPlatinumOnly)}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              showPlatinumOnly
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-900 border-2 border-yellow-400'
                : 'bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-gray-700/80'
            }`}>
            <Trophy className={`w-4 h-4 ${showPlatinumOnly ? 'fill-yellow-900' : ''}`} />
            {showPlatinumOnly ? `Platinas (${platinumCount})` : `Ver Platinas (${platinumCount})`}
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Buscar..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all" />
        </div>
        {showFilters && availableYears.length > 0 && (
          <div className="relative flex-shrink-0 w-24 sm:w-28">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full pl-8 pr-2 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-xs sm:text-sm text-white appearance-none focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer">
              <option value="all">Todos</option>
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        )}
        <div className="relative flex-shrink-0">
          <ArrowDownUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}
            className="pl-9 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white appearance-none focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer">
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortOption, setSortOption] = useState(selectedCategory === 'zerados' ? 'date_desc' : 'name_asc');
  const [showPlatinumOnly, setShowPlatinumOnly] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef(null);

  const safeGames = games || {};
  const categoryGames = safeGames[selectedCategory] || [];
  const categoryName = categoryNames[selectedCategory] || 'Categoria';
  const categoryGradient = getCategoryGradient(selectedCategory);

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

  // Jogos para exportação (sem filtro de busca, com filtro de ano)
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
    const avgRating = rated.length > 0
      ? (rated.reduce((s, g) => s + parseFloat(g.rating), 0) / rated.length).toFixed(1)
      : '—';
    const totalHours = exportGames.reduce((s, g) => s + (parseInt(g.timeToBeat) || 0), 0);
    const platinas = exportGames.filter(g => g.isPlatinum).length;
    const topGame = rated.length > 0
      ? [...rated].sort((a, b) => b.rating - a.rating)[0]
      : null;
    return { avgRating, totalHours, platinas, topGame };
  }, [exportGames]);

  // ── EXPORTAÇÃO CORRIGIDA ────────────────────────────────────────────────
  const handleExportImage = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    const toastId = 'export-toast';
    toast.loading('Gerando imagem da coleção...', { id: toastId });

    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#0f172a',
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
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao gerar imagem.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const commonProps = {
    categoryName, categoryGradient,
    count: filteredGames.length,
    onBack: () => setSelectedCategory(null),
    searchTerm, setSearchTerm,
    sortOption, setSortOption,
    selectedYear, setSelectedYear, availableYears,
    showFilters: selectedCategory === 'zerados',
    onExport: handleExportImage, isExporting,
    showPlatinumOnly, setShowPlatinumOnly, platinumCount,
  };

  if (categoryGames.length === 0 && !searchTerm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <ListHeader {...commonProps} />
        <div className="max-w-md mx-auto px-4 pb-20">
          <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <Gamepad2 className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400">Nenhum jogo nesta categoria.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <ListHeader {...commonProps} />

      <div className="max-w-md mx-auto px-4 pb-20">
        <div className="space-y-3">
          {filteredGames.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Nenhum jogo encontrado {selectedYear !== 'all' ? `em ${selectedYear}` : ''}
            </div>
          ) : (
            filteredGames.map((game) => {
              const isFinished = game.status === 'zerados';
              const isPlatinum = game.isPlatinum;
              return (
                <button key={game.id} onClick={() => setSelectedGame(game)}
                  className={`group w-full rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] text-left shadow-lg overflow-hidden relative ${
                    isFinished
                      ? isPlatinum
                        ? 'bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-500/40 hover:border-yellow-400/60'
                        : 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30 hover:border-green-400/50'
                      : 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
                  }`}>
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-base mb-2 truncate ${
                        isPlatinum ? 'text-yellow-200' : isFinished ? 'text-green-200' : 'text-white'
                      }`}>{game.nome}</h3>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="px-2 py-0.5 bg-gray-900/50 rounded text-[10px] uppercase font-bold text-gray-400 border border-gray-700/50">
                          {game.platform}
                        </span>
                        {isPlatinum && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-yellow-500 to-amber-500">
                            <Trophy className="w-3 h-3 fill-yellow-900 text-yellow-900" />
                            <span className="text-xs font-black text-yellow-900">PLATINA</span>
                          </div>
                        )}
                        {isFinished && game.rating && (
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r ${getRatingColor(game.rating)}`}>
                            <Star className="w-3 h-3 fill-white text-white" />
                            <span className="text-xs font-bold text-white">{game.rating}</span>
                          </div>
                        )}
                        {isFinished && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-md">
                            <Calendar className="w-3 h-3 text-green-400" />
                            <span className="text-xs font-medium text-green-300">
                              {game.finishedDate
                                ? new Date(game.finishedDate).toLocaleDateString('pt-BR', {
                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                  })
                                : 'Sem data'}
                            </span>
                          </div>
                        )}
                        {!isFinished && game.timeToBeat > 0 && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-900/30 border border-blue-500/30 rounded-md">
                            <Clock className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-blue-200">{game.timeToBeat}h</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isFinished && <Trophy className={`w-4 h-4 ${isPlatinum ? 'text-yellow-500 fill-yellow-500' : 'text-green-500'}`} />}
                      <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors rotate-180" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── DIV DE EXPORTAÇÃO CORRIGIDO ── renderizado fora da viewport */}
      <div data-export-root className="fixed top-0 left-[-9999px] pointer-events-none" aria-hidden="true">
        <div
          ref={exportRef}
          style={{
            width: '1080px',
            minHeight: '1080px',
            background: 'linear-gradient(135deg, #0f172a 0%, #0c1a2e 50%, #0f172a 100%)',
            padding: '64px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflow: 'hidden',
            color: 'white',
          }}
        >
          {/* Decoração de fundo */}
          <div style={{
            position: 'absolute', top: '-200px', right: '-200px',
            width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-200px', left: '-200px',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Header */}
          <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '50px', padding: '6px 18px', marginBottom: '14px',
              }}>
                <span style={{ fontSize: '16px' }}>✅</span>
                <span style={{ color: 'white', fontWeight: 900, fontSize: '12px', letterSpacing: '2px' }}>
                  JOGOS ZERADOS
                </span>
              </div>
              <div style={{
                fontSize: '48px', fontWeight: 900, lineHeight: 1.1, color: 'white',
              }}>
                Minha Coleção
              </div>
              {selectedYear !== 'all' && (
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#06b6d4', marginTop: '4px' }}>
                  {selectedYear}
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {[
                { label: 'Total', value: exportGames.length, color: '#10b981' },
                { label: 'Nota Média', value: exportStats.avgRating, color: '#f59e0b' },
                { label: 'Horas', value: `${exportStats.totalHours}h`, color: '#06b6d4' },
                ...(exportStats.platinas > 0 ? [{ label: 'Platinas 🏆', value: exportStats.platinas, color: '#fbbf24' }] : []),
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px', padding: '14px 18px', minWidth: '80px',
                }}>
                  <div style={{ fontSize: '26px', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid de capas */}
          {exportGames.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(Math.max(exportGames.length, 4), 9)}, 1fr)`,
              gap: '10px',
              marginBottom: '36px',
            }}>
              {exportGames.slice(0, 36).map((game) => (
                <div key={game.id} style={{ position: 'relative' }}>
                  <div style={{
                    aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden',
                    border: game.isPlatinum ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                    background: '#1e293b',
                    boxShadow: game.isPlatinum ? '0 0 14px rgba(245,158,11,0.35)' : '0 4px 12px rgba(0,0,0,0.5)',
                  }}>
                    {game.imageBase64 ? (
                      <img
                        src={game.imageBase64}
                        alt={game.nome}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        fontSize: '24px',
                      }}>🎮</div>
                    )}
                  </div>
                  {game.rating > 0 && (
                    <div style={{
                      position: 'absolute', top: '-5px', right: '-5px',
                      background: getRatingHex(game.rating),
                      borderRadius: '50%', width: '22px', height: '22px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '9px', fontWeight: 900, color: 'white',
                      border: '2px solid #0f172a', lineHeight: 1,
                    }}>{game.rating}</div>
                  )}
                  {game.isPlatinum && (
                    <div style={{
                      position: 'absolute', bottom: '-5px', left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      borderRadius: '4px', padding: '1px 5px',
                      fontSize: '8px', color: '#78350f', fontWeight: 900,
                    }}>🏆</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Lista detalhada */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '7px', marginBottom: '36px',
          }}>
            {exportGames.slice(0, 24).map((game, i) => (
              <div key={game.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px', padding: '9px 12px',
              }}>
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#1e293b', minWidth: '22px' }}>
                  #{i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '12px', fontWeight: 700,
                    color: game.isPlatinum ? '#fcd34d' : '#e2e8f0',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {game.nome}{game.isPlatinum ? ' 🏆' : ''}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>
                    {game.platform}
                    {game.finishedDate && ` · ${new Date(game.finishedDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`}
                  </div>
                </div>
                {game.rating > 0 && (
                  <div style={{
                    fontSize: '12px', fontWeight: 900,
                    color: getRatingHex(game.rating), minWidth: '30px', textAlign: 'right',
                  }}>{game.rating}/10</div>
                )}
              </div>
            ))}
          </div>

          {exportGames.length > 24 && (
            <div style={{ textAlign: 'center', color: '#334155', fontSize: '12px', marginBottom: '28px' }}>
              + {exportGames.length - 24} jogos não listados
            </div>
          )}

          {/* Rodapé */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🎮</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Game Backlog</span>
            </div>
            {exportStats.topGame && (
              <div style={{ fontSize: '11px', color: '#334155' }}>
                Melhor jogo: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{exportStats.topGame.nome}</span>
              </div>
            )}
            <div style={{ fontSize: '11px', color: '#1e293b' }}>
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}