// src/components/ProfileScreen.jsx
import React, { useMemo, useState } from 'react';
import {
  LogOut, Camera, Trophy, Star, Clock, ChevronLeft,
  CheckCircle, Award, Database, Gamepad2, Monitor,
  Heart, TrendingUp, Edit3, Plus, X, Check,
} from 'lucide-react';

// ─── design tokens ────────────────────────────────────────────────────────────

const C = {
  bg:      '#0d0b14',       // fundo profundo, quase preto com toque roxo
  card:    '#13101f',       // superfície dos cards
  card2:   '#1a1628',       // superfície alternativa (zebra)
  border:  'rgba(139,92,246,0.14)',  // borda levemente roxa
  border2: 'rgba(255,255,255,0.05)',
  violet:  '#8b5cf6',       // roxo principal
  indigo:  '#6366f1',       // índigo
  soft:    '#a78bfa',       // roxo suave (texto accent)
  glow:    'rgba(139,92,246,0.35)',
  text:    '#f1eeff',       // branco com toque levemente violeta
  muted:   'rgba(241,238,255,0.38)',
  faint:   'rgba(139,92,246,0.08)',
};

// ─── badge definitions ────────────────────────────────────────────────────────

const BADGES = [
  { emoji: '🎮', label: 'Fundador',  req: 0  },
  { emoji: '🏆', label: 'Platina',   req: 1  },
  { emoji: '🔥', label: 'Streak',    req: 3  },
  { emoji: '🎯', label: 'Foco',      req: 5  },
  { emoji: '⚔️',  label: 'Veterano', req: 10 },
  { emoji: '🧠', label: 'Crítico',   req: 15 },
  { emoji: '💎', label: '100%',      req: 20 },
  { emoji: '🌟', label: 'Lendário',  req: 25 },
];

// ─── FavoritePicker ───────────────────────────────────────────────────────────

function FavoritePicker({ gamesData, favorites, onToggle, onClose }) {
  const [q, setQ] = useState('');
  const list = gamesData.filter(g => g.nome?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(14px)' }}
    >
      <div
        className="w-full max-w-sm overflow-hidden shadow-2xl"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 22,
          boxShadow: `0 0 60px ${C.glow}`,
        }}
      >
        <div className="sm:hidden w-8 h-1 rounded-full mx-auto mt-3 mb-1"
          style={{ background: C.border }} />

        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-sm font-semibold" style={{ color: C.text }}>Jogos Favoritos</p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{favorites.length}/5 selecionados</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full"
            style={{ background: C.faint }}>
            <X className="w-3.5 h-3.5" style={{ color: C.muted }} />
          </button>
        </div>

        {/* search */}
        <div className="px-5 pb-3">
          <input
            autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Buscar jogo…"
            className="w-full px-4 py-2.5 text-sm rounded-xl outline-none"
            style={{
              background: C.faint,
              border: `1px solid ${C.border}`,
              color: C.text,
            }}
          />
        </div>

        {/* list */}
        <div className="px-2 pb-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {list.length === 0 && (
            <p className="text-center text-sm py-8" style={{ color: C.muted }}>Nenhum resultado</p>
          )}
          {list.map(game => {
            const on   = favorites.some(f => f.id === game.id);
            const full = !on && favorites.length >= 5;
            return (
              <button key={game.id} disabled={full} onClick={() => !full && onToggle(game)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                style={{
                  opacity: full ? 0.3 : 1,
                  background: on ? C.faint : 'transparent',
                  cursor: full ? 'not-allowed' : 'pointer',
                }}>
                <div className="w-9 h-12 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ border: `1px solid ${C.border}`, background: C.faint }}>
                  {game.imageBase64
                    ? <img src={game.imageBase64} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="w-3.5 h-3.5" style={{ color: C.muted }} />
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: C.text }}>{game.nome}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>{game.platform}</p>
                </div>
                <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: on ? C.violet : 'transparent',
                    borderColor: on ? C.violet : C.border,
                  }}>
                  {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t" style={{ borderColor: C.border }}>
          <button onClick={onClose}
            className="w-full py-3 text-sm font-semibold rounded-xl text-white transition-all active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})` }}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: C.card, border: `1px solid ${C.border}` }}>
      {/* ambient */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none"
        style={{ background: C.glow, opacity: 0.25 }} />
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: C.faint, border: `1px solid ${C.border}` }}>
        <Icon className="w-4 h-4" style={{ color: C.soft }} />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: C.muted }}>{label}</p>
        <p className="text-2xl font-bold" style={{ color: C.text }}>{value}</p>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function ProfileScreen({
  user,
  handleSignOut,
  totalFinishedGames,
  handleProfileImageUpload,
  gamesData = [],
  goBack,
  onOpenBackup,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [favorites, setFavorites]   = useState([]);

  const toggle = (game) =>
    setFavorites(prev =>
      prev.some(f => f.id === game.id)
        ? prev.filter(f => f.id !== game.id)
        : prev.length < 5 ? [...prev, game] : prev
    );

  const S = useMemo(() => {
    const finished = gamesData.filter(g => g.status === 'zerados');
    const total    = gamesData.length;
    const hours    = gamesData.reduce((s, g) => s + (parseInt(g.timeToBeat) || 0), 0);
    const platinas = finished.filter(g => g.isPlatinum).length;
    const rated    = finished.filter(g => g.rating > 0);
    const avgRating = rated.length
      ? (rated.reduce((s, g) => s + parseFloat(g.rating), 0) / rated.length).toFixed(1)
      : '—';
    const completePct = total > 0 ? Math.round((finished.length / total) * 100) : 0;
    const pm = {};
    gamesData.forEach(g =>
      g.platform?.split(' | ').forEach(p => { pm[p.trim()] = (pm[p.trim()] || 0) + 1; })
    );
    const topPlatform = Object.entries(pm).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const gm = {};
    finished.forEach(g => { if (g.genre) gm[g.genre] = (gm[g.genre] || 0) + 1; });
    const favGenre = Object.entries(gm).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    return { total, finished: finished.length, hours, platinas, avgRating, completePct, topPlatform, favGenre };
  }, [gamesData]);

  const name    = user?.displayName || 'Gamer';
  const level   = Math.floor(totalFinishedGames / 5) + 1;
  const xp      = (totalFinishedGames % 5) * 20;
  const initial = name.charAt(0).toUpperCase();
  const unlocked = BADGES.filter(b => totalFinishedGames >= b.req).length;

  return (
    <>
      {pickerOpen && (
        <FavoritePicker
          gamesData={gamesData} favorites={favorites}
          onToggle={toggle} onClose={() => setPickerOpen(false)}
        />
      )}

      <div
        className="min-h-screen pb-20"
        style={{
          background: C.bg,
          fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* subtle top glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${C.glow} 0%, transparent 70%)`,
            opacity: 0.45,
          }} />

        {/* ── NAV ── */}
        <nav className="sticky top-0 z-50 border-b"
          style={{
            background: `${C.bg}d0`,
            backdropFilter: 'blur(20px)',
            borderColor: C.border,
          }}>
          <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
            <button onClick={goBack}
              className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: C.soft }}>
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
            <span className="text-sm font-semibold" style={{ color: C.text }}>Perfil</span>
            <div className="flex items-center gap-2">
              {onOpenBackup && (
                <button onClick={onOpenBackup}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: C.faint }}>
                  <Database className="w-3.5 h-3.5" style={{ color: C.muted }} />
                </button>
              )}
              <button onClick={handleSignOut}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: C.faint }}>
                <LogOut className="w-3.5 h-3.5" style={{ color: C.muted }} />
              </button>
            </div>
          </div>
        </nav>

        <div className="relative max-w-xl mx-auto px-5 py-8 space-y-5">

          {/* ── HERO ── */}
          <div className="relative overflow-hidden rounded-3xl p-6"
            style={{ background: C.card, border: `1px solid ${C.border}` }}>
            {/* decorative glow blobs */}
            <div className="absolute -top-14 -left-14 w-52 h-52 rounded-full blur-3xl pointer-events-none"
              style={{ background: C.violet, opacity: 0.12 }} />
            <div className="absolute -bottom-14 -right-10 w-44 h-44 rounded-full blur-3xl pointer-events-none"
              style={{ background: C.indigo, opacity: 0.10 }} />

            <div className="relative flex items-center gap-5">
              {/* avatar */}
              <label className="relative cursor-pointer group flex-shrink-0">
                <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden"
                  style={{ border: `2px solid ${C.border}` }}>
                  {user?.photoBase64 || user?.photoURL
                    ? <img src={user.photoBase64 || user.photoURL} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})` }}>
                        {initial}
                      </div>
                  }
                </div>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.55)' }}>
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => handleProfileImageUpload(e.target.files[0])} />
                {/* level badge */}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold text-white whitespace-nowrap"
                  style={{
                    background: `linear-gradient(135deg, ${C.violet}, ${C.indigo})`,
                    border: `2px solid ${C.bg}`,
                    boxShadow: `0 2px 10px ${C.glow}`,
                  }}>
                  LVL {level}
                </div>
              </label>

              {/* text */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h1 className="text-xl font-bold" style={{ color: C.text }}>{name}</h1>
                  <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                    style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)' }}>
                    Fundador
                  </span>
                </div>
                {user?.email && (
                  <p className="text-xs truncate mb-3" style={{ color: C.muted }}>{user.email}</p>
                )}
                {/* XP bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]" style={{ color: C.muted }}>
                    <span>Nível {level}</span>
                    <span style={{ color: C.soft }}>{xp}%</span>
                  </div>
                  <div className="h-[5px] rounded-full overflow-hidden" style={{ background: C.faint }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${xp || 2}%`,
                        background: `linear-gradient(90deg, ${C.violet}, ${C.indigo})`,
                        boxShadow: `0 0 8px ${C.glow}`,
                      }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── STATS 2×2 ── */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] px-1 mb-3"
              style={{ color: C.muted }}>Estatísticas</p>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Jogados"    value={S.total}       icon={Gamepad2}    />
              <StatCard label="Zerados"    value={S.finished}    icon={CheckCircle} />
              <StatCard label="Horas"      value={`${S.hours}h`} icon={Clock}       />
              <StatCard label="Nota Média" value={S.avgRating}   icon={Star}        />
            </div>
          </div>

          {/* ── FAVORITOS ── */}
          <div>
            <div className="flex items-center justify-between px-1 mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: C.muted }}>
                Jogos Favoritos
              </p>
              <button onClick={() => setPickerOpen(true)}
                className="flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-60"
                style={{ color: C.soft }}>
                <Edit3 className="w-3 h-3" />
                Editar
              </button>
            </div>

            <div className="flex gap-2">
              {Array.from({ length: 5 }, (_, i) => {
                const g = favorites[i];
                return g ? (
                  <div key={g.id} className="flex-1 relative">
                    <div className="w-full rounded-2xl overflow-hidden"
                      style={{ aspectRatio: '2/3', border: `1px solid ${C.border}`, background: C.faint }}>
                      {g.imageBase64
                        ? <img src={g.imageBase64} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <Gamepad2 className="w-5 h-5" style={{ color: C.muted }} />
                          </div>
                      }
                    </div>
                    {g.rating > 0 && (
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: `${C.violet}cc`, backdropFilter: 'blur(4px)' }}>
                        {g.rating}
                      </div>
                    )}
                    {g.isPlatinum && (
                      <div className="absolute top-1.5 right-1.5 text-sm">🏆</div>
                    )}
                  </div>
                ) : (
                  <button key={`e-${i}`} onClick={() => setPickerOpen(true)}
                    className="flex-1 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all hover:opacity-60"
                    style={{ aspectRatio: '2/3', borderColor: C.border, background: C.faint }}>
                    <Plus className="w-4 h-4" style={{ color: C.muted }} />
                  </button>
                );
              })}
            </div>

            {favorites.length > 0 && (
              <div className="flex gap-2 mt-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex-1">
                    {favorites[i] && (
                      <p className="text-[9px] text-center leading-tight line-clamp-2" style={{ color: C.muted }}>
                        {favorites[i].nome}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── DESTAQUES ── */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] px-1 mb-3"
              style={{ color: C.muted }}>Destaques</p>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              {[
                { label: 'Plataforma favorita', value: S.topPlatform,       icon: Monitor     },
                { label: 'Gênero favorito',     value: S.favGenre,          icon: Heart       },
                { label: 'Platinas',            value: S.platinas,          icon: Trophy      },
                { label: 'Taxa de conclusão',   value: `${S.completePct}%`, icon: TrendingUp  },
              ].map(({ label, value, icon: Icon }, i, arr) => (
                <div key={label}
                  className="flex items-center justify-between px-5 py-4"
                  style={{
                    background: i % 2 === 0 ? C.card : C.card2,
                    borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.soft }} />
                    <span className="text-sm" style={{ color: C.muted }}>{label}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: C.text }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── INSÍGNIAS ── */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] px-1 mb-3"
              style={{ color: C.muted }}>Insígnias</p>
            <div className="rounded-2xl p-5 space-y-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="grid grid-cols-4 gap-2.5">
                {BADGES.map(({ emoji, label, req }) => {
                  const on = totalFinishedGames >= req;
                  return (
                    <div key={label}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl"
                      style={{
                        background: on ? C.faint : 'transparent',
                        border: `1px solid ${on ? C.border : 'transparent'}`,
                        opacity: on ? 1 : 0.28,
                      }}>
                      <span className="text-xl leading-none">{emoji}</span>
                      <span className="text-[9px] font-medium text-center" style={{ color: C.muted }}>{label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: C.border }}>
                <div className="flex justify-between text-[11px]" style={{ color: C.muted }}>
                  <span>{unlocked} de {BADGES.length} desbloqueadas</span>
                  <span style={{ color: C.soft }}>{Math.round((unlocked / BADGES.length) * 100)}%</span>
                </div>
                <div className="h-[5px] rounded-full overflow-hidden" style={{ background: C.faint }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(unlocked / BADGES.length) * 100}%`,
                      background: `linear-gradient(90deg, ${C.violet}, ${C.indigo})`,
                      boxShadow: `0 0 8px ${C.glow}`,
                    }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}