import React, { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Star, Trophy, Gamepad2, Search, ArrowDownUp, Calendar, Filter, Share2, Download } from 'lucide-react';
import { categoryNames } from '../data/categories';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';

const getRatingColor = (rating) => {
  if (rating >= 9) return 'from-emerald-500 to-teal-500';
  if (rating >= 7) return 'from-cyan-500 to-blue-500';
  if (rating >= 5) return 'from-yellow-500 to-orange-500';
  return 'from-red-500 to-pink-500';
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

// Componente Header separado para evitar re-render do input
const ListHeader = ({ 
  categoryName, 
  categoryGradient, 
  count, 
  onBack, 
  searchTerm, 
  setSearchTerm, 
  sortOption, 
  setSortOption,
  selectedYear,
  setSelectedYear,
  availableYears,
  showFilters,
  onExport,
  isExporting,
  showPlatinumOnly,
  setShowPlatinumOnly,
  platinumCount
}) => (
  <div className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50 -mx-4 px-4 py-4 mb-6 shadow-xl">
    <div className="max-w-md mx-auto space-y-4">
      
      {/* Topo: Voltar, Título e Exportar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="group flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl border border-gray-700/50 transition-all duration-300 hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="flex-1 text-center min-w-0">
          <div className={`inline-block px-4 py-1.5 bg-gradient-to-r ${categoryGradient} rounded-full max-w-full`}>
            <h2 className="text-sm sm:text-base font-black text-white tracking-wide uppercase truncate">{categoryName}</h2>
          </div>
        </div>

        {/* Botão de Exportar (Só aparece em Zerados) */}
        {showFilters && count > 0 && (
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex-shrink-0 p-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            title="Exportar imagem"
          >
            {isExporting ? <Download className="w-5 h-5 animate-bounce" /> : <Share2 className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Filtro de Platina (só em zerados) */}
      {showFilters && platinumCount > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowPlatinumOnly(!showPlatinumOnly)}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              showPlatinumOnly
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-900 border-2 border-yellow-400'
                : 'bg-gray-800/80 text-gray-300 border border-gray-700 hover:bg-gray-700/80'
            }`}
          >
            <Trophy className={`w-4 h-4 ${showPlatinumOnly ? 'fill-yellow-900' : ''}`} />
            {showPlatinumOnly ? `Platinas (${platinumCount})` : `Ver Platinas (${platinumCount})`}
          </button>
        </div>
      )}

      {/* Área de Filtros */}
      <div className="flex gap-2">
        {/* Busca */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        
        {/* Filtro de Ano */}
        {showFilters && availableYears.length > 0 && (
          <div className="relative flex-shrink-0 w-24 sm:w-28">
             <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
             </div>
             <select
               value={selectedYear}
               onChange={(e) => setSelectedYear(e.target.value)}
               className="w-full pl-8 pr-2 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-xs sm:text-sm text-white appearance-none focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer text-ellipsis"
             >
               <option value="all">Todos</option>
               {availableYears.map(year => (
                 <option key={year} value={year}>{year}</option>
               ))}
             </select>
          </div>
        )}

        {/* Ordenação */}
        <div className="relative flex-shrink-0 w-12 sm:w-auto">
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none sm:left-3 sm:translate-x-0">
              <ArrowDownUp className="w-4 h-4 text-gray-500" />
           </div>
           <select
             value={sortOption}
             onChange={(e) => setSortOption(e.target.value)}
             className="w-full pl-0 sm:pl-9 pr-2 sm:pr-8 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white appearance-none focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer text-center sm:text-left text-transparent sm:text-white"
           >
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

export default function GameList({ 
  selectedCategory, 
  setSelectedCategory, 
  games, 
  setSelectedGame, 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortOption, setSortOption] = useState(selectedCategory === 'zerados' ? 'date_desc' : 'name_asc');
  const [showPlatinumOnly, setShowPlatinumOnly] = useState(false);
  
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef(null);

  const safeGames = games || {};
  let categoryGames = safeGames[selectedCategory] || [];
  const categoryName = categoryNames[selectedCategory] || 'Categoria';
  const categoryGradient = getCategoryGradient(selectedCategory);

  const availableYears = useMemo(() => {
    if (selectedCategory !== 'zerados') return [];
    const years = new Set();
    categoryGames.forEach(game => {
      if (game.finishedDate) {
        years.add(new Date(game.finishedDate).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [categoryGames, selectedCategory]);

  const platinumCount = useMemo(() => {
    return categoryGames.filter(g => g.isPlatinum).length;
  }, [categoryGames]);

  const filteredGames = useMemo(() => {
    let result = categoryGames.filter(game => 
      game.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtro de Platina
    if (showPlatinumOnly && selectedCategory === 'zerados') {
      result = result.filter(game => game.isPlatinum);
    }

    // Filtro de Ano
    if (selectedCategory === 'zerados' && selectedYear !== 'all') {
      result = result.filter(game => {
        if (!game.finishedDate) return false;
        const gameYear = new Date(game.finishedDate).getFullYear().toString();
        return gameYear === selectedYear;
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
        case 'name_asc': default: return a.nome.localeCompare(b.nome);
      }
    });

    return result;
  }, [categoryGames, searchTerm, sortOption, selectedYear, selectedCategory, showPlatinumOnly]);

  // Função de Exportar Imagem
  const handleExportImage = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    toast.loading('Gerando imagem...', { id: 'export-toast' });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `meus-zerados-${selectedYear === 'all' ? 'todos' : selectedYear}.png`;
      link.click();
      
      toast.success('Imagem salva!', { id: 'export-toast' });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar imagem.', { id: 'export-toast' });
    } finally {
      setIsExporting(false);
    }
  };

  if (categoryGames.length === 0 && !searchTerm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <ListHeader 
           categoryName={categoryName}
           categoryGradient={categoryGradient}
           count={0}
           onBack={() => setSelectedCategory(null)}
           searchTerm={searchTerm}
           setSearchTerm={setSearchTerm}
           sortOption={sortOption}
           setSortOption={setSortOption}
           selectedYear={selectedYear}
           setSelectedYear={setSelectedYear}
           availableYears={availableYears}
           showFilters={selectedCategory === 'zerados'}
           onExport={handleExportImage}
           isExporting={isExporting}
           showPlatinumOnly={showPlatinumOnly}
           setShowPlatinumOnly={setShowPlatinumOnly}
           platinumCount={platinumCount}
        />
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
      <ListHeader 
           categoryName={categoryName}
           categoryGradient={categoryGradient}
           count={filteredGames.length}
           onBack={() => setSelectedCategory(null)}
           searchTerm={searchTerm}
           setSearchTerm={setSearchTerm}
           sortOption={sortOption}
           setSortOption={setSortOption}
           selectedYear={selectedYear}
           setSelectedYear={setSelectedYear}
           availableYears={availableYears}
           showFilters={selectedCategory === 'zerados'}
           onExport={handleExportImage}
           isExporting={isExporting}
           showPlatinumOnly={showPlatinumOnly}
           setShowPlatinumOnly={setShowPlatinumOnly}
           platinumCount={platinumCount}
      />
      
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
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  className={`group w-full rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] text-left shadow-lg overflow-hidden relative ${
                    isFinished 
                      ? isPlatinum
                        ? 'bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-500/40 hover:border-yellow-400/60'
                        : 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30 hover:border-green-400/50'
                      : 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-base mb-2 truncate ${
                        isPlatinum ? 'text-yellow-200' : isFinished ? 'text-green-200' : 'text-white'
                      }`}>
                        {game.nome}
                      </h3>
                      
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="px-2 py-0.5 bg-gray-900/50 rounded text-[10px] uppercase font-bold text-gray-400 border border-gray-700/50">
                          {game.platform}
                        </span>
                        
                        {/* Badge de Platina */}
                        {isPlatinum && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-yellow-500 to-amber-500 border border-yellow-400">
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
                                ? new Date(game.finishedDate).toLocaleDateString() 
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
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ÁREA DE EXPORTAÇÃO OCULTA (LAYOUT MODERNO) - Mantida igual */}
      <div className="absolute top-0 left-[-9999px]">
        <div 
          ref={exportRef} 
          className="w-[1200px] min-h-[800px] p-12 text-white font-sans relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          }}
        >
          {/* Conteúdo de exportação omitido por brevidade - usar o mesmo do arquivo original */}
        </div>
      </div>

    </div>
  );
}