import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Edit3,
  Gamepad2,
  Heart,
  Layers3,
  Quote,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Trophy,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { categoryNames } from '../data/categories';
import { useTheme } from '../context/ThemeContext';
import { getGameLengthInfo, getRatingHex, getRatingLabel } from '../utils/gameUtils';

const STATUS_OPTIONS = [
  { id: 'playing', label: 'Jogando', icon: Gamepad2 },
  { id: 'installed', label: 'Instalados', icon: Layers3 },
  { id: 'backlog', label: 'Na fila', icon: Sparkles },
  { id: 'desejados', label: 'Desejados', icon: Heart },
];

const formatDate = value => value
  ? new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  : 'Não informada';

export default function GameDetailModern({
  selectedGame,
  setSelectedGame,
  handleUpdateGameStatus,
  handleDeleteGame,
  openEditModal,
  openReviewModal,
}) {
  const { theme: V } = useTheme();
  const [activeSection, setActiveSection] = useState('overview');
  const isFinished = selectedGame.status === 'zerados';
  const lengthInfo = getGameLengthInfo(selectedGame.timeToBeat);
  const rating = Number(selectedGame.rating) || 0;
  const availableSections = [
    { id: 'overview', label: 'Visão geral' },
    ...(selectedGame.reviewText ? [{ id: 'review', label: 'Review' }] : []),
    ...(selectedGame.notes ? [{ id: 'notes', label: 'Anotações' }] : []),
  ];

  const finishOrReopen = () => {
    if (!isFinished) {
      openReviewModal(selectedGame);
      return;
    }
    const nextStatus = selectedGame.originalStatus || 'playing';
    const updated = { ...selectedGame, status: nextStatus, rating: null, reviewText: '', isPlatinum: false };
    handleUpdateGameStatus(selectedGame.id, nextStatus, updated);
    setSelectedGame(updated);
  };

  const moveTo = nextStatus => {
    const updated = isFinished
      ? { ...selectedGame, status: nextStatus, rating: null, reviewText: '', isPlatinum: false }
      : { ...selectedGame, status: nextStatus };
    handleUpdateGameStatus(selectedGame.id, nextStatus, updated);
    setSelectedGame(updated);
    toast.success(`Movido para ${categoryNames[nextStatus] || nextStatus}.`);
  };

  const share = async () => {
    const achievement = selectedGame.isPlatinum ? ' com platina' : '';
    const text = isFinished
      ? `Zerei ${selectedGame.nome}${achievement}! Minha nota: ${rating || 'sem nota'}/10.`
      : `${selectedGame.nome} está na minha coleção do XpLog.`;
    try {
      if (navigator.share) await navigator.share({ title: selectedGame.nome, text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success('Texto copiado.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') toast.error('Não foi possível compartilhar.');
    }
  };

  const remove = () => {
    if (!window.confirm(`Remover “${selectedGame.nome}” da sua coleção?`)) return;
    handleDeleteGame(selectedGame.id);
    setSelectedGame(null);
  };

  return (
    <div className="app-page min-h-screen pb-16">
      {selectedGame.imageBase64 && (
        <div className="pointer-events-none fixed inset-x-0 top-0 h-[42rem] overflow-hidden opacity-25">
          <img src={selectedGame.imageBase64} alt="" className="h-full w-full scale-110 object-cover blur-3xl saturate-150" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-bg)]/80 to-[var(--color-bg)]" />
        </div>
      )}

      <header className="sticky top-0 z-40 border-b backdrop-blur-2xl" style={{ borderColor: V.border, background: `${V.bg}dc` }}>
        <div className="app-shell flex min-h-20 items-center gap-3 py-3">
          <button type="button" onClick={() => setSelectedGame(null)} className="surface-card rounded-2xl p-3 transition hover:-translate-x-0.5" aria-label="Voltar">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Detalhes do jogo</p>
            <p className="truncate text-sm font-bold sm:text-base">{selectedGame.nome}</p>
          </div>
          <button type="button" onClick={share} className="surface-card rounded-2xl p-3" aria-label="Compartilhar"><Share2 className="h-4 w-4" /></button>
          <button type="button" onClick={() => openEditModal(selectedGame)} className="surface-card rounded-2xl p-3" aria-label="Editar"><Edit3 className="h-4 w-4" /></button>
          <button type="button" onClick={remove} className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-red-300" aria-label="Excluir"><Trash2 className="h-4 w-4" /></button>
        </div>
      </header>

      <main className="app-shell relative pt-7 sm:pt-10">
        <section className="glass-panel overflow-hidden rounded-[2rem] p-5 sm:p-8">
          <div className="grid gap-7 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-[1.75rem] shadow-2xl">
              {selectedGame.imageBase64 ? (
                <img src={selectedGame.imageBase64} alt={`Capa de ${selectedGame.nome}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center" style={{ background: `linear-gradient(145deg, ${V.card2}, ${V.faint})` }}><Gamepad2 className="h-14 w-14" style={{ color: V.low }} /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-lg">{categoryNames[selectedGame.status] || selectedGame.status}</span>
            </motion.div>

            <div className="flex min-w-0 flex-col justify-center">
              <div className="mb-4 flex flex-wrap gap-2">
                {[selectedGame.platform, selectedGame.genre].filter(Boolean).map(item => <span key={item} className="rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ borderColor: V.border, color: V.muted, background: V.faint }}>{item}</span>)}
                {selectedGame.isPlatinum && <span className="flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-300"><Trophy className="h-3 w-3" /> Platina</span>}
              </div>
              <p className="eyebrow mb-2">{isFinished ? 'Aventura concluída' : 'Na sua jornada'}</p>
              <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl lg:text-6xl">{selectedGame.nome}</h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 sm:text-base" style={{ color: V.muted }}>
                {isFinished
                  ? `Concluído em ${formatDate(selectedGame.finishedDate)}${rating ? `, com nota ${rating}/10.` : '.'}`
                  : `${lengthInfo ? `${lengthInfo.label} · ` : ''}${selectedGame.timeToBeat ? `${selectedGame.timeToBeat} horas estimadas` : 'Tempo ainda não informado'}.`}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={finishOrReopen} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5" style={{ background: isFinished ? `linear-gradient(135deg, ${V.card2}, ${V.card})` : V.grad, border: `1px solid ${isFinished ? V.border : 'transparent'}`, boxShadow: isFinished ? 'none' : `0 14px 32px ${V.glow}` }}>
                  <CheckCircle2 className="h-4 w-4" /> {isFinished ? 'Reabrir jornada' : 'Marcar como zerado'}
                </button>
                <button type="button" onClick={() => openEditModal(selectedGame)} className="surface-card flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-bold"><Edit3 className="h-4 w-4" /> Editar informações</button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Status', value: categoryNames[selectedGame.status] || selectedGame.status, icon: CheckCircle2 },
            { label: 'Tempo', value: selectedGame.timeToBeat ? `${selectedGame.timeToBeat}h` : '—', icon: Clock3 },
            { label: 'Nota', value: rating ? `${rating}/10` : '—', icon: Star, color: rating ? getRatingHex(rating) : undefined },
            { label: 'Conclusão', value: isFinished ? formatDate(selectedGame.finishedDate) : 'Em aberto', icon: CalendarDays },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="surface-card flex items-center gap-4 rounded-2xl p-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: color || V.faint, color: color ? 'white' : V.soft }}><Icon className="h-5 w-5" /></div>
              <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: V.muted }}>{label}</p><p className="mt-1 truncate text-sm font-black">{value}</p></div>
            </div>
          ))}
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0">
            <div className="mb-4 flex gap-1 overflow-x-auto rounded-2xl border p-1" style={{ borderColor: V.border, background: V.card }}>
              {availableSections.map(section => (
                <button key={section.id} type="button" onClick={() => setActiveSection(section.id)} className="relative whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold" style={{ color: activeSection === section.id ? V.text : V.muted }}>
                  {activeSection === section.id && <motion.span layoutId="detail-tab" className="absolute inset-0 rounded-xl" style={{ background: V.faint }} />}
                  <span className="relative">{section.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                {activeSection === 'overview' && (
                  <div className="glass-panel rounded-3xl p-6 sm:p-7">
                    <p className="eyebrow">Ficha da jornada</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[
                        ['Plataforma', selectedGame.platform || 'Não informada'],
                        ['Gênero', selectedGame.genre || 'Não informado'],
                        ['Duração', lengthInfo ? `${selectedGame.timeToBeat}h · ${lengthInfo.label}` : 'Não informada'],
                        ['Avaliação', rating ? `${getRatingLabel(rating)} · ${rating}/10` : 'Ainda sem avaliação'],
                      ].map(([label, value]) => <div key={label} className="rounded-2xl border p-4" style={{ borderColor: V.border, background: V.faint }}><p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: V.muted }}>{label}</p><p className="mt-1.5 text-sm font-bold">{value}</p></div>)}
                    </div>
                  </div>
                )}
                {activeSection === 'review' && selectedGame.reviewText && (
                  <div className="glass-panel relative overflow-hidden rounded-3xl p-7 sm:p-9">
                    <Quote className="absolute right-5 top-5 h-16 w-16 opacity-5" />
                    <div className="mb-5 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black text-white" style={{ background: getRatingHex(rating) }}>{rating}</div><div><p className="text-sm font-black">{getRatingLabel(rating)}</p><p className="text-xs" style={{ color: V.muted }}>Sua avaliação pessoal</p></div></div>
                    <p className="whitespace-pre-line text-base leading-8 sm:text-lg" style={{ color: V.text }}>{selectedGame.reviewText}</p>
                  </div>
                )}
                {activeSection === 'notes' && selectedGame.notes && (
                  <div className="glass-panel rounded-3xl p-7"><p className="eyebrow mb-4">Notas pessoais</p><p className="whitespace-pre-line text-sm leading-7" style={{ color: V.muted }}>{selectedGame.notes}</p></div>
                )}
              </motion.div>
            </AnimatePresence>
          </section>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="glass-panel rounded-3xl p-5">
              <p className="eyebrow">Mover para</p>
              <h2 className="mt-2 text-lg font-black">Organize sua coleção</h2>
              <div className="mt-4 space-y-2">
                {STATUS_OPTIONS.filter(option => option.id !== selectedGame.status).map(({ id, label, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => moveTo(id)} className="group flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition hover:translate-x-1" style={{ borderColor: V.border, background: V.faint }}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: V.card }}><Icon className="h-4 w-4" style={{ color: V.soft }} /></div>
                    <span className="flex-1 text-sm font-bold">{label}</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" style={{ color: V.low }} />
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
