import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Gamepad2,
  GripVertical,
  Search,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { categoryNames } from '../data/categories';
import { useTheme } from '../context/ThemeContext';
import { getRatingHex } from '../utils/gameUtils';
import { TagBadge } from './CustomTags';
import DragSortList from './DragSortList';

const CATEGORY_COPY = {
  playing: 'O que está ocupando seu tempo agora.',
  backlog: 'Sua fila de próximas aventuras.',
  installed: 'Prontos para começar quando você quiser.',
  zerados: 'A história daquilo que você já conquistou.',
  desejados: 'Jogos que ainda estão no seu radar.',
};

const formatDate = value => {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function GameListModern({
  selectedCategory,
  setSelectedCategory,
  games,
  setSelectedGame,
  setGamesData,
}) {
  const { theme: V } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortOption, setSortOption] = useState(selectedCategory === 'zerados' ? 'date_desc' : 'manual');
  const [showPlatinumOnly, setShowPlatinumOnly] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef(null);

  const categoryGames = games?.[selectedCategory] || [];
  const isFinishedList = selectedCategory === 'zerados';
  const categoryName = categoryNames[selectedCategory] || 'Coleção';

  const years = useMemo(() => [...new Set(categoryGames
    .filter(game => game.finishedDate)
    .map(game => new Date(game.finishedDate).getFullYear()))]
    .sort((a, b) => b - a), [categoryGames]);

  const stats = useMemo(() => {
    const rated = categoryGames.filter(game => Number(game.rating) > 0);
    return {
      hours: categoryGames.reduce((sum, game) => sum + (Number(game.timeToBeat) || 0), 0),
      average: rated.length
        ? (rated.reduce((sum, game) => sum + Number(game.rating), 0) / rated.length).toFixed(1)
        : '—',
      platinum: categoryGames.filter(game => game.isPlatinum).length,
    };
  }, [categoryGames]);

  const filteredGames = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('pt-BR');
    const result = categoryGames.filter(game => {
      const matchesQuery = !query || [game.nome, game.platform, game.genre]
        .some(value => value?.toLocaleLowerCase('pt-BR').includes(query));
      const matchesYear = selectedYear === 'all'
        || (game.finishedDate && String(new Date(game.finishedDate).getFullYear()) === selectedYear);
      const matchesPlatinum = !showPlatinumOnly || game.isPlatinum;
      return matchesQuery && matchesYear && matchesPlatinum;
    });

    return [...result].sort((a, b) => {
      if (sortOption === 'rating_desc') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (sortOption === 'date_desc') return new Date(b.finishedDate || 0) - new Date(a.finishedDate || 0);
      if (sortOption === 'date_asc') return new Date(a.finishedDate || 0) - new Date(b.finishedDate || 0);
      if (sortOption === 'name_asc') return (a.nome || '').localeCompare(b.nome || '', 'pt-BR');
      return (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999);
    });
  }, [categoryGames, searchTerm, selectedYear, showPlatinumOnly, sortOption]);

  const toggleReorder = () => {
    setDragMode(current => {
      const next = !current;
      if (next) {
        setSearchTerm('');
        setSelectedYear('all');
        setShowPlatinumOnly(false);
        setSortOption('manual');
      }
      return next;
    });
  };

  const handleReorder = reorderedGames => {
    if (!setGamesData) return;
    const updates = new Map(reorderedGames.map((game, index) => [String(game.id), { ...game, sortOrder: index }]));
    setGamesData(previous => previous.map(game => updates.get(String(game.id)) || game));
    toast.success('Nova ordem salva.');
  };

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    toast.loading('Preparando sua retrospectiva...', { id: 'collection-export' });
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(exportRef.current, { backgroundColor: V.bg, scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `xplog-${selectedCategory}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Imagem salva.', { id: 'collection-export' });
    } catch {
      toast.error('Não foi possível gerar a imagem.', { id: 'collection-export' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app-page pb-20">
      <header className="sticky top-0 z-40 border-b backdrop-blur-2xl" style={{ borderColor: V.border, background: `${V.bg}df` }}>
        <div className="app-shell flex min-h-20 items-center gap-3 py-3">
          <button type="button" onClick={() => setSelectedCategory(null)} className="surface-card rounded-2xl p-3 transition hover:-translate-x-0.5" aria-label="Voltar">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Coleção · {categoryGames.length} jogos</p>
            <h1 className="truncate text-xl font-black tracking-tight sm:text-2xl">{categoryName}</h1>
          </div>
          <button
            type="button"
            onClick={toggleReorder}
            className="surface-card flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold transition"
            style={dragMode ? { background: V.faint, borderColor: V.primary, color: V.soft } : undefined}
          >
            <GripVertical className="h-4 w-4" />
            <span className="hidden sm:inline">{dragMode ? 'Concluir' : 'Reordenar'}</span>
          </button>
          {isFinishedList && categoryGames.length > 0 && (
            <button type="button" disabled={isExporting} onClick={handleExport} className="rounded-2xl p-3 text-white disabled:opacity-50" style={{ background: V.grad }} aria-label="Exportar coleção">
              <Download className={`h-5 w-5 ${isExporting ? 'animate-bounce' : ''}`} />
            </button>
          )}
        </div>
      </header>

      <main className="app-shell pt-7">
        <section className="mb-6 grid gap-5 lg:grid-cols-[1.45fr_1fr]">
          <div className="glass-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full blur-3xl" style={{ background: V.glow }} />
            <div className="relative">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: V.faint, color: V.soft }}>
                {isFinishedList ? <Trophy className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              </div>
              <p className="eyebrow mb-2">{isFinishedList ? 'Seu histórico' : 'Seu espaço'}</p>
              <h2 className="max-w-xl text-3xl font-black leading-tight tracking-[-0.035em] sm:text-4xl">{categoryName}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 sm:text-base" style={{ color: V.muted }}>{CATEGORY_COPY[selectedCategory]}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {[
              { label: 'Jogos', value: categoryGames.length, icon: Gamepad2 },
              { label: isFinishedList ? 'Média' : 'Horas', value: isFinishedList ? stats.average : `${stats.hours}h`, icon: isFinishedList ? Star : Clock3 },
              { label: isFinishedList ? 'Platinas' : 'Planejadas', value: isFinishedList ? stats.platinum : stats.hours, icon: isFinishedList ? Trophy : CalendarDays },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="surface-card flex flex-col justify-between rounded-2xl p-4 lg:flex-row lg:items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: V.muted }}>{label}</p>
                  <p className="mt-1 text-xl font-black sm:text-2xl">{value}</p>
                </div>
                <Icon className="mt-3 h-4 w-4 lg:mt-0" style={{ color: V.soft }} />
              </div>
            ))}
          </div>
        </section>

        {!dragMode && (
          <section className="glass-panel mb-6 grid gap-3 rounded-3xl p-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: V.muted }} />
              <input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Buscar por jogo, gênero ou plataforma" className="w-full rounded-2xl border bg-transparent py-3 pl-11 pr-4 text-sm outline-none" style={{ borderColor: V.border, color: V.text }} />
            </label>
            {isFinishedList && years.length > 0 && (
              <select value={selectedYear} onChange={event => setSelectedYear(event.target.value)} className="rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none" style={{ borderColor: V.border, color: V.text, backgroundColor: V.card }}>
                <option value="all">Todos os anos</option>
                {years.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            )}
            {isFinishedList && stats.platinum > 0 && (
              <button type="button" onClick={() => setShowPlatinumOnly(value => !value)} className="flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold" style={{ borderColor: showPlatinumOnly ? '#f59e0b' : V.border, color: showPlatinumOnly ? '#fbbf24' : V.muted, background: showPlatinumOnly ? 'rgba(245,158,11,.1)' : 'transparent' }}>
                <Trophy className="h-4 w-4" /> Platinas
              </button>
            )}
            <label className="relative">
              <ArrowDownUp className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: V.muted }} />
              <select value={sortOption} onChange={event => setSortOption(event.target.value)} className="h-full w-full appearance-none rounded-2xl border py-3 pl-11 pr-8 text-sm outline-none" style={{ borderColor: V.border, color: V.text, backgroundColor: V.card }}>
                <option value="manual">Ordem manual</option>
                <option value="name_asc">Nome A–Z</option>
                {isFinishedList && <option value="rating_desc">Maior nota</option>}
                {isFinishedList && <option value="date_desc">Mais recentes</option>}
                {isFinishedList && <option value="date_asc">Mais antigos</option>}
              </select>
            </label>
          </section>
        )}

        {dragMode ? (
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: V.border, background: V.faint, color: V.muted }}>
              Arraste pelo marcador para definir a ordem. A alteração é salva automaticamente.
            </div>
            <DragSortList games={[...categoryGames].sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999))} onReorder={handleReorder} />
          </div>
        ) : filteredGames.length ? (
          <motion.section initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.045 } } }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredGames.map(game => {
              const isFinished = game.status === 'zerados';
              return (
                <motion.button
                  key={game.id}
                  type="button"
                  variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                  onClick={() => setSelectedGame(game)}
                  className="surface-card interactive-card group overflow-hidden rounded-3xl text-left"
                >
                  <div className="flex min-h-44">
                    <div className="relative w-28 flex-shrink-0 overflow-hidden sm:w-32">
                      {game.imageBase64 ? <img src={game.imageBase64} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center" style={{ background: `linear-gradient(145deg, ${V.card2}, ${V.faint})` }}><Gamepad2 className="h-8 w-8" style={{ color: V.low }} /></div>}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col p-4">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <span className="rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: V.muted, borderColor: V.border, background: V.faint }}>{game.platform || 'Sem plataforma'}</span>
                        <ChevronRight className="h-4 w-4 flex-shrink-0 transition group-hover:translate-x-1" style={{ color: V.low }} />
                      </div>
                      <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-tight">{game.nome}</h3>
                      <p className="mt-1 text-xs" style={{ color: V.muted }}>{game.genre || 'Gênero não informado'}</p>
                      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                        {isFinished && Number(game.rating) > 0 && <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-black text-white" style={{ background: getRatingHex(game.rating) }}><Star className="h-3 w-3 fill-current" />{game.rating}</span>}
                        {game.isPlatinum && <span className="flex items-center gap-1 rounded-lg bg-amber-400/15 px-2 py-1 text-xs font-bold text-amber-300"><Trophy className="h-3 w-3" /> Platina</span>}
                        {isFinished ? <span className="flex items-center gap-1 text-[10px]" style={{ color: V.muted }}><CalendarDays className="h-3 w-3" />{formatDate(game.finishedDate)}</span> : Number(game.timeToBeat) > 0 && <span className="flex items-center gap-1 text-[10px]" style={{ color: V.muted }}><Clock3 className="h-3 w-3" />{game.timeToBeat}h</span>}
                      </div>
                      {game.tags?.length > 0 && <div className="mt-3 flex flex-wrap gap-1">{game.tags.slice(0, 2).map(tag => <TagBadge key={tag} tag={tag} small />)}</div>}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.section>
        ) : (
          <div className="glass-panel rounded-[2rem] px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: V.faint }}><Gamepad2 className="h-6 w-6" style={{ color: V.soft }} /></div>
            <h3 className="text-lg font-black">Nada por aqui ainda</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: V.muted }}>{categoryGames.length ? 'Tente remover algum filtro ou buscar outro termo.' : 'Adicione ou mova um jogo para esta coleção.'}</p>
          </div>
        )}
      </main>

      <div className="fixed left-[-9999px] top-0" aria-hidden="true">
        <div ref={exportRef} style={{ width: 960, padding: 56, background: V.bg, color: V.text, fontFamily: 'system-ui' }}>
          <p style={{ color: V.soft, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase' }}>XPLOG · RETROSPECTIVA</p>
          <h2 style={{ fontSize: 52, lineHeight: 1, marginTop: 18, fontWeight: 900 }}>{categoryName}</h2>
          <p style={{ color: V.muted, fontSize: 20, marginTop: 12 }}>{categoryGames.length} jogos · média {stats.average} · {stats.platinum} platinas</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 36 }}>
            {filteredGames.slice(0, 16).map(game => <div key={game.id} style={{ padding: 18, borderRadius: 18, background: V.card, border: `1px solid ${V.border}`, fontWeight: 800 }}>{game.nome}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
