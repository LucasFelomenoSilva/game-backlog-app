// src/components/ProfileScreen.jsx — Favoritos persistentes + Editar Perfil + Configurações
import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  LogOut, Camera, Trophy, Star, Clock, ChevronLeft,
  CheckCircle, Award, Database, Gamepad2, Monitor,
  Heart, TrendingUp, Edit3, Plus, X, Check, Zap,
  Flame, BarChart3, Target, Sparkles, Settings,
  User, Save, Loader2, Palette,
} from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const V = {
  bg:      '#09060f',
  card:    '#130e22',
  card2:   '#1a1330',
  border:  'rgba(139,92,246,0.18)',
  faint:   'rgba(139,92,246,0.08)',
  violet:  '#8b5cf6',
  indigo:  '#6366f1',
  pink:    '#ec4899',
  soft:    '#a78bfa',
  glow:    'rgba(139,92,246,0.4)',
  text:    '#f5f0ff',
  muted:   'rgba(245,240,255,0.50)',
  low:     'rgba(245,240,255,0.22)',
};

// ── Temas disponíveis ─────────────────────────────────────────────────────────
const THEMES_LIST = [
  { id: 'violet',  name: 'Roxo',     emoji: '💜', grad: 'linear-gradient(135deg,#8b5cf6,#6366f1)', primary: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' },
  { id: 'cyan',    name: 'Azul',     emoji: '🔵', grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)', primary: '#06b6d4', glow: 'rgba(6,182,212,0.4)'   },
  { id: 'emerald', name: 'Verde',    emoji: '💚', grad: 'linear-gradient(135deg,#10b981,#059669)', primary: '#10b981', glow: 'rgba(16,185,129,0.4)'  },
  { id: 'rose',    name: 'Vermelho', emoji: '❤️', grad: 'linear-gradient(135deg,#f43f5e,#e11d48)', primary: '#f43f5e', glow: 'rgba(244,63,94,0.4)'   },
  { id: 'amber',   name: 'Laranja',  emoji: '🟠', grad: 'linear-gradient(135deg,#f59e0b,#d97706)', primary: '#f59e0b', glow: 'rgba(245,158,11,0.4)'  },
  { id: 'pink',    name: 'Rosa',     emoji: '🌸', grad: 'linear-gradient(135deg,#ec4899,#db2777)', primary: '#ec4899', glow: 'rgba(236,72,153,0.4)'  },
];

// ── Badges ────────────────────────────────────────────────────────────────────
const BADGES = [
  { emoji: '🎮', label: 'Fundador',  req: 0  },
  { emoji: '🏆', label: 'Platina',   req: 1  },
  { emoji: '🔥', label: 'Streak',    req: 3  },
  { emoji: '🎯', label: 'Foco',      req: 5  },
  { emoji: '⚔️', label: 'Veterano',  req: 10 },
  { emoji: '🧠', label: 'Crítico',   req: 15 },
  { emoji: '💎', label: '100%',      req: 20 },
  { emoji: '🌟', label: 'Lendário',  req: 25 },
];

// ── Modal de Configurações de Tema ────────────────────────────────────────────
function ThemeModal({ currentTheme, onApply, onClose }) {
  const [selected, setSelected] = useState(currentTheme || 'violet');
  const theme = THEMES_LIST.find(t => t.id === selected) || THEMES_LIST[0];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: V.card, border: `1px solid ${V.border}`, boxShadow: `0 0 60px ${V.glow}` }}>

        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${V.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})`, boxShadow: `0 4px 16px ${V.glow}` }}>
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black" style={{ color: V.text }}>Tema de Cores</h2>
              <p className="text-xs" style={{ color: V.muted }}>Personalize sua experiência</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ background: V.faint, border: `1px solid ${V.border}` }}>
            <X className="w-4 h-4" style={{ color: V.muted }} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Grid de temas */}
          <div className="grid grid-cols-3 gap-3">
            {THEMES_LIST.map(t => {
              const isSelected = selected === t.id;
              return (
                <button key={t.id} onClick={() => setSelected(t.id)}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all duration-200"
                  style={{
                    background: isSelected ? `rgba(139,92,246,0.15)` : V.faint,
                    border: `2px solid ${isSelected ? t.primary : V.border}`,
                    boxShadow: isSelected ? `0 0 20px ${t.glow}` : 'none',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full" style={{ background: t.grad }} />
                    {isSelected && (
                      <div className="absolute inset-0 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.35)' }}>
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wide"
                    style={{ color: isSelected ? t.primary : V.muted }}>
                    {t.emoji} {t.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="rounded-2xl p-4 transition-all duration-300"
            style={{ background: `${theme.primary}15`, border: `1px solid ${theme.primary}40` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: theme.grad }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: V.text }}>Preview: {theme.name}</p>
                <p className="text-xs" style={{ color: V.muted }}>Assim ficará o app</p>
              </div>
              <div className="ml-auto w-6 h-6 rounded-full" style={{ background: theme.grad }} />
            </div>
          </div>

          <button onClick={() => onApply(selected)}
            className="w-full py-4 rounded-2xl font-black text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: theme.grad, boxShadow: `0 4px 20px ${theme.glow}` }}>
            Aplicar Tema {theme.emoji}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de Edição de Perfil ─────────────────────────────────────────────────
function EditProfileModal({ user, onSave, onClose }) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) { toast.error('Nome não pode ser vazio'); return; }
    setSaving(true);
    try {
      await onSave({ displayName: displayName.trim(), bio: bio.trim() });
      toast.success('Perfil atualizado!');
      onClose();
    } catch {
      toast.error('Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: V.card, border: `1px solid ${V.border}`, boxShadow: `0 0 60px ${V.glow}` }}>

        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${V.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})`, boxShadow: `0 4px 16px ${V.glow}` }}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black" style={{ color: V.text }}>Editar Perfil</h2>
              <p className="text-xs" style={{ color: V.muted }}>Atualize suas informações</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ background: V.faint, border: `1px solid ${V.border}` }}>
            <X className="w-4 h-4" style={{ color: V.muted }} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Avatar preview */}
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 rounded-2xl overflow-hidden"
              style={{ border: `2px solid ${V.border}` }}>
              {user?.photoBase64 || user?.photoURL
                ? <img src={user.photoBase64 || user.photoURL} className="w-full h-full object-cover" alt="avatar" />
                : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})` }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
              }
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: V.muted }}>
              Nome de exibição *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={30}
              placeholder="Seu nome no app"
              className="w-full px-4 py-3 rounded-xl outline-none text-sm"
              style={{ background: V.faint, border: `1px solid ${V.border}`, color: V.text, fontSize: 16 }}
            />
            <p className="text-[10px] mt-1 text-right" style={{ color: V.low }}>{displayName.length}/30</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: V.muted }}>
              Bio (opcional)
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={120}
              rows={3}
              placeholder="Uma frase sobre você como gamer..."
              className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
              style={{ background: V.faint, border: `1px solid ${V.border}`, color: V.text, fontSize: 16 }}
            />
            <p className="text-[10px] mt-1 text-right" style={{ color: V.low }}>{bio.length}/120</p>
          </div>

          {/* Email (somente leitura) */}
          {user?.email && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: V.muted }}>
                E-mail (Google)
              </label>
              <div className="px-4 py-3 rounded-xl text-sm"
                style={{ background: V.faint, border: `1px solid ${V.border}`, color: V.low }}>
                {user.email}
              </div>
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})`, boxShadow: `0 4px 20px ${V.glow}` }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FavoritePicker ────────────────────────────────────────────────────────────
function FavoritePicker({ gamesData, favorites, onToggle, onClose }) {
  const [q, setQ] = useState('');
  const list = gamesData.filter(g =>
    g.nome?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(16px)' }}>
      <div className="w-full max-w-sm overflow-hidden shadow-2xl"
        style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 24, boxShadow: `0 0 80px ${V.glow}` }}>

        <div className="sm:hidden w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: V.border }} />
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-sm font-bold" style={{ color: V.text }}>Jogos Favoritos</p>
            <p className="text-xs mt-0.5" style={{ color: V.muted }}>{favorites.length}/5 selecionados</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: V.faint, border: `1px solid ${V.border}` }}>
            <X className="w-4 h-4" style={{ color: V.muted }} />
          </button>
        </div>

        <div className="px-5 pb-3">
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Buscar jogo…"
            className="w-full px-4 py-2.5 text-sm rounded-xl outline-none"
            style={{ background: V.faint, border: `1px solid ${V.border}`, color: V.text, fontSize: 16 }} />
        </div>

        <div className="px-2 pb-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {list.length === 0 && <p className="text-center text-sm py-8" style={{ color: V.muted }}>Nenhum resultado</p>}
          {list.map(game => {
            const on   = favorites.some(f => f.id === game.id);
            const full = !on && favorites.length >= 5;
            return (
              <button key={game.id} disabled={full} onClick={() => !full && onToggle(game)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                style={{ opacity: full ? 0.3 : 1, background: on ? V.faint : 'transparent', cursor: full ? 'not-allowed' : 'pointer' }}>
                <div className="w-10 h-14 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ border: `1px solid ${V.border}`, background: V.faint }}>
                  {game.imageBase64
                    ? <img src={game.imageBase64} className="w-full h-full object-cover" alt={game.nome} />
                    : <div className="w-full h-full flex items-center justify-center"><Gamepad2 className="w-4 h-4" style={{ color: V.muted }} /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: V.text }}>{game.nome}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: V.muted }}>{game.platform}</p>
                </div>
                <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: on ? V.violet : 'transparent', borderColor: on ? V.violet : V.border }}>
                  {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t" style={{ borderColor: V.border }}>
          <button onClick={onClose} className="w-full py-3 text-sm font-bold rounded-xl text-white transition-all active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})`, boxShadow: `0 4px 20px ${V.glow}` }}>
            Confirmar Seleção
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl"
      style={{ background: V.faint, border: `1px solid ${V.border}` }}>
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: color || V.soft }} />
      <span className="text-lg font-black" style={{ color: V.text }}>{value}</span>
      <span className="text-[9px] uppercase tracking-widest font-semibold text-center" style={{ color: V.muted }}>{label}</span>
    </div>
  );
}

function HighlightRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-3 px-4" style={{ borderBottom: `1px solid ${V.border}` }}>
      <div className="flex items-center gap-2.5">
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: V.soft }} />
        <span className="text-sm" style={{ color: V.muted }}>{label}</span>
      </div>
      <span className="text-sm font-bold" style={{ color: V.text }}>{value}</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProfileScreen({
  user,
  handleSignOut,
  totalFinishedGames,
  handleProfileImageUpload,
  gamesData = [],
  goBack,
  onOpenBackup,
  onProfileUpdate,   // callback para atualizar user no App
}) {
  // Favoritos — carregados do Firestore via user data (persistência real)
  const [favorites, setFavorites]       = useState([]);
  const [pickerOpen, setPickerOpen]     = useState(false);
  const [showTheme, setShowTheme]       = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [savingFavs, setSavingFavs]     = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    try { return localStorage.getItem('gamebacklog_theme') || 'violet'; } catch { return 'violet'; }
  });
  const [localDisplayName, setLocalDisplayName] = useState(user?.displayName || '');
  const [localBio, setLocalBio] = useState(user?.bio || '');

  // Carrega favoritos salvos ao montar
  useEffect(() => {
    if (user?.favorites && Array.isArray(user.favorites)) {
      setFavorites(user.favorites);
    }
  }, [user?.uid]);

  // Sync nome/bio local quando user muda
  useEffect(() => {
    setLocalDisplayName(user?.displayName || '');
    setLocalBio(user?.bio || '');
  }, [user?.displayName, user?.bio]);

  const toggle = async (game) => {
    const newFavs = favorites.some(f => f.id === game.id)
      ? favorites.filter(f => f.id !== game.id)
      : favorites.length < 5 ? [...favorites, game] : favorites;
    setFavorites(newFavs);
    // Salva imediatamente no Firestore
    try {
      await updateDoc(doc(db, 'users', user.uid), { favorites: newFavs });
    } catch { toast.error('Erro ao salvar favoritos.'); }
  };

  const handleClosePicker = async () => {
    setPickerOpen(false);
    // Salva ao fechar o picker
    try {
      await updateDoc(doc(db, 'users', user.uid), { favorites });
    } catch {}
  };

  const handleApplyTheme = (themeId) => {
    setCurrentTheme(themeId);
    try { localStorage.setItem('gamebacklog_theme', themeId); } catch {}
    // Aplica CSS vars
    const themeObj = THEMES_LIST.find(t => t.id === themeId);
    if (themeObj) {
      document.documentElement.style.setProperty('--color-primary', themeObj.primary);
    }
    toast.success(`Tema ${THEMES_LIST.find(t => t.id === themeId)?.name} aplicado!`);
    setShowTheme(false);
  };

  const handleSaveProfile = async ({ displayName, bio }) => {
    if (!user?.uid) return;
    await updateDoc(doc(db, 'users', user.uid), { displayName, bio });
    setLocalDisplayName(displayName);
    setLocalBio(bio);
    if (onProfileUpdate) onProfileUpdate({ displayName, bio });
  };

  const S = useMemo(() => {
    const finished  = gamesData.filter(g => g.status === 'zerados');
    const total     = gamesData.length;
    const hours     = gamesData.reduce((s, g) => s + (parseInt(g.timeToBeat) || 0), 0);
    const platinas  = finished.filter(g => g.isPlatinum).length;
    const rated     = finished.filter(g => g.rating > 0);
    const avgRating = rated.length
      ? (rated.reduce((s, g) => s + parseFloat(g.rating), 0) / rated.length).toFixed(1)
      : '—';
    const completePct = total > 0 ? Math.round((finished.length / total) * 100) : 0;
    const pm = {};
    gamesData.forEach(g =>
      g.platform?.split(' | ').forEach(p => { const k = p.trim(); pm[k] = (pm[k] || 0) + 1; })
    );
    const topPlatform = Object.entries(pm).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const gm = {};
    finished.forEach(g => { if (g.genre) gm[g.genre] = (gm[g.genre] || 0) + 1; });
    const favGenre = Object.entries(gm).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const recent = [...finished]
      .filter(g => g.finishedDate)
      .sort((a, b) => new Date(b.finishedDate) - new Date(a.finishedDate))
      .slice(0, 3);
    const topRated = [...rated].sort((a, b) => b.rating - a.rating).slice(0, 1)[0] || null;
    return { total, finished: finished.length, hours, platinas, avgRating, completePct, topPlatform, favGenre, recent, topRated };
  }, [gamesData]);

  const name    = localDisplayName || user?.displayName || 'Gamer';
  const level   = Math.floor(totalFinishedGames / 5) + 1;
  const xpPct   = (totalFinishedGames % 5) * 20;
  const initial = name.charAt(0).toUpperCase();
  const unlocked = BADGES.filter(b => totalFinishedGames >= b.req).length;

  return (
    <>
      {pickerOpen && (
        <FavoritePicker gamesData={gamesData} favorites={favorites} onToggle={toggle} onClose={handleClosePicker} />
      )}
      {showTheme && (
        <ThemeModal currentTheme={currentTheme} onApply={handleApplyTheme} onClose={() => setShowTheme(false)} />
      )}
      {showEditProfile && (
        <EditProfileModal
          user={{ ...user, displayName: localDisplayName, bio: localBio }}
          onSave={handleSaveProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      <div className="min-h-screen pb-24" style={{ background: V.bg, fontFamily: '-apple-system, sans-serif' }}>

        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${V.glow} 0%, transparent 70%)`, opacity: 0.5 }} />

        {/* ── NAV ── */}
        <nav className="sticky top-0 z-50 border-b"
          style={{ background: `${V.bg}d8`, backdropFilter: 'blur(24px)', borderColor: V.border }}>
          <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
            <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: V.soft }}>
              <ChevronLeft className="w-4 h-4" />Voltar
            </button>
            <span className="text-sm font-bold tracking-wide" style={{ color: V.text }}>Perfil</span>
            <div className="flex items-center gap-2">
              {/* Botão de Configurações / Tema */}
              <button
                onClick={() => setShowTheme(true)}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:opacity-70"
                style={{ background: V.faint, border: `1px solid ${V.border}` }}
                title="Configurações de tema"
              >
                <Settings className="w-3.5 h-3.5" style={{ color: V.muted }} />
              </button>
              {onOpenBackup && (
                <button onClick={onOpenBackup} className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:opacity-70"
                  style={{ background: V.faint, border: `1px solid ${V.border}` }}>
                  <Database className="w-3.5 h-3.5" style={{ color: V.muted }} />
                </button>
              )}
              <button onClick={handleSignOut} className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:opacity-70"
                style={{ background: V.faint, border: `1px solid ${V.border}` }}>
                <LogOut className="w-3.5 h-3.5" style={{ color: V.muted }} />
              </button>
            </div>
          </div>
        </nav>

        <div className="relative max-w-xl mx-auto px-4 pt-6 space-y-5">

          {/* ── HERO CARD ── */}
          <div className="relative overflow-hidden rounded-3xl p-6"
            style={{ background: `linear-gradient(135deg, ${V.card} 0%, ${V.card2} 100%)`, border: `1px solid ${V.border}` }}>
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full blur-3xl pointer-events-none"
              style={{ background: V.violet, opacity: 0.12 }} />
            <div className="absolute -bottom-16 -right-8 w-48 h-48 rounded-full blur-3xl pointer-events-none"
              style={{ background: V.indigo, opacity: 0.10 }} />

            <div className="relative flex items-start gap-4">
              {/* Avatar */}
              <label className="relative cursor-pointer group flex-shrink-0">
                <div className="absolute -inset-1 rounded-2xl blur opacity-60"
                  style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})` }} />
                <div className="relative w-[76px] h-[76px] rounded-2xl overflow-hidden"
                  style={{ border: `2px solid rgba(139,92,246,0.4)` }}>
                  {user?.photoBase64 || user?.photoURL
                    ? <img src={user.photoBase64 || user.photoURL} className="w-full h-full object-cover" alt="avatar" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
                        style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})` }}>{initial}</div>
                  }
                </div>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => handleProfileImageUpload(e.target.files[0])} />
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black text-white whitespace-nowrap"
                  style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})`, border: `2px solid ${V.bg}`, boxShadow: `0 2px 12px ${V.glow}` }}>
                  LVL {level}
                </div>
              </label>

              {/* Info + botão editar */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-black truncate" style={{ color: V.text }}>{name}</h1>
                    {localBio ? (
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: V.muted }}>{localBio}</p>
                    ) : (
                      user?.email && <p className="text-xs truncate mt-0.5" style={{ color: V.muted }}>{user.email}</p>
                    )}
                  </div>
                  {/* Botão Editar Perfil */}
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:opacity-70"
                    style={{ background: V.faint, border: `1px solid ${V.border}` }}
                    title="Editar perfil"
                  >
                    <Edit3 className="w-3.5 h-3.5" style={{ color: V.soft }} />
                  </button>
                </div>

                {/* XP Bar */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between text-[11px]">
                    <span style={{ color: V.muted }}>Nível {level} → {level + 1}</span>
                    <span style={{ color: V.soft }}>{xpPct}%</span>
                  </div>
                  <div className="h-[5px] rounded-full overflow-hidden" style={{ background: V.faint }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${xpPct || 2}%`, background: `linear-gradient(90deg, ${V.violet}, ${V.pink})`, boxShadow: `0 0 10px ${V.glow}` }} />
                  </div>
                  <p className="text-[10px]" style={{ color: V.low }}>
                    {5 - (totalFinishedGames % 5)} jogos para o próximo nível
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="relative grid grid-cols-4 gap-2 mt-5 pt-4" style={{ borderTop: `1px solid ${V.border}` }}>
              {[
                { label: 'Zerados',  value: S.finished,    icon: CheckCircle, color: '#10b981' },
                { label: 'Total',    value: S.total,       icon: Gamepad2,    color: V.soft    },
                { label: 'Horas',    value: `${S.hours}h`, icon: Clock,       color: '#3b82f6' },
                { label: 'Platinas', value: S.platinas,    icon: Trophy,      color: '#f59e0b' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="text-xl font-black" style={{ color }}>{value}</span>
                  <span className="text-[9px] uppercase tracking-wider" style={{ color: V.muted }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── AÇÕES RÁPIDAS ── */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setShowEditProfile(true)}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:opacity-80"
              style={{ background: V.card, border: `1px solid ${V.border}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})` }}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: V.text }}>Editar Perfil</p>
                <p className="text-[10px]" style={{ color: V.muted }}>Nome e bio</p>
              </div>
            </button>
            <button onClick={() => setShowTheme(true)}
              className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:opacity-80"
              style={{ background: V.card, border: `1px solid ${V.border}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${V.pink}, ${V.violet})` }}>
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: V.text }}>Tema</p>
                <p className="text-[10px]" style={{ color: V.muted }}>Personalizar cores</p>
              </div>
            </button>
          </div>

          {/* ── JOGOS FAVORITOS ── */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.pink})` }}>
                  <Heart className="w-3 h-3 text-white fill-white" />
                </div>
                <span className="text-sm font-black" style={{ color: V.text }}>Jogos Favoritos</span>
              </div>
              <button onClick={() => setPickerOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                style={{ background: V.faint, border: `1px solid ${V.border}`, color: V.soft }}>
                <Edit3 className="w-3 h-3" />Editar
              </button>
            </div>

            {favorites.length === 0 ? (
              <button onClick={() => setPickerOpen(true)}
                className="w-full py-8 rounded-3xl border-2 border-dashed flex flex-col items-center gap-3 transition-all hover:opacity-80"
                style={{ borderColor: V.border, background: V.faint }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})`, boxShadow: `0 0 20px ${V.glow}` }}>
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold" style={{ color: V.soft }}>Adicione seus favoritos</p>
                  <p className="text-xs mt-0.5" style={{ color: V.muted }}>Destaque até 5 jogos especiais</p>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                {favorites[0] && (
                  <div className="relative rounded-3xl overflow-hidden h-44"
                    style={{ border: `1px solid ${V.border}` }}>
                    {favorites[0].imageBase64 ? (
                      <>
                        <img src={favorites[0].imageBase64} alt={favorites[0].nome}
                          className="w-full h-full object-cover scale-105"
                          style={{ filter: 'brightness(0.55) saturate(1.2)' }} />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,6,15,0.95) 0%, rgba(9,6,15,0.3) 60%, transparent 100%)' }} />
                      </>
                    ) : (
                      <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${V.card2}, ${V.bg})` }} />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                            style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.pink})`, color: 'white' }}>
                            ⭐ Favorito #1
                          </span>
                          {favorites[0].isPlatinum && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(245,158,11,0.25)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)' }}>
                              🏆 Platina
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-black text-white">{favorites[0].nome}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{favorites[0].platform} · {favorites[0].genre}</p>
                      </div>
                      {favorites[0].rating > 0 && (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
                          style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})`, boxShadow: `0 4px 16px ${V.glow}` }}>
                          <Star className="w-3.5 h-3.5 text-white fill-white" />
                          <span className="text-sm font-black text-white">{favorites[0].rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {favorites.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => {
                      const game = favorites[i + 1];
                      return game ? (
                        <div key={game.id} className="relative rounded-2xl overflow-hidden"
                          style={{ aspectRatio: '2/3', border: `1px solid ${V.border}` }}>
                          {game.imageBase64
                            ? <img src={game.imageBase64} className="w-full h-full object-cover" alt={game.nome} />
                            : <div className="w-full h-full flex items-center justify-center" style={{ background: V.card2 }}>
                                <Gamepad2 className="w-5 h-5" style={{ color: V.muted }} />
                              </div>
                          }
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,6,15,0.85) 0%, transparent 50%)' }} />
                          <div className="absolute bottom-1.5 left-0 right-0 px-1.5">
                            <p className="text-[9px] font-bold text-white truncate leading-tight">{game.nome}</p>
                          </div>
                          {game.rating > 0 && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})` }}>
                              <span className="text-[8px] font-black text-white">{game.rating}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button key={`e-${i}`} onClick={() => setPickerOpen(true)}
                          className="rounded-2xl border-2 border-dashed flex items-center justify-center transition-all hover:opacity-70"
                          style={{ aspectRatio: '2/3', borderColor: V.border, background: V.faint }}>
                          <Plus className="w-4 h-4" style={{ color: V.muted }} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── ESTATÍSTICAS ── */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${V.indigo}, ${V.violet})` }}>
                <BarChart3 className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-black" style={{ color: V.text }}>Estatísticas</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              <MiniStat label="Zerados"   value={S.finished}    icon={CheckCircle} color="#10b981" />
              <MiniStat label="Horas"     value={`${S.hours}h`} icon={Clock}       color="#3b82f6" />
              <MiniStat label="Nota Méd." value={S.avgRating}   icon={Star}        color="#f59e0b" />
              <MiniStat label="Platinas"  value={S.platinas}    icon={Trophy}      color="#f59e0b" />
            </div>
            <div className="rounded-2xl p-4" style={{ background: V.card, border: `1px solid ${V.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" style={{ color: V.soft }} />
                  <span className="text-sm font-semibold" style={{ color: V.muted }}>Taxa de Conclusão</span>
                </div>
                <span className="text-lg font-black" style={{ color: V.violet }}>{S.completePct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: V.faint }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${S.completePct}%`, background: `linear-gradient(90deg, ${V.violet}, ${V.pink})`, boxShadow: `0 0 8px ${V.glow}` }} />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: V.low }}>{S.total} jogos · {S.finished} zerados</p>
            </div>
          </section>

          {/* ── DESTAQUES ── */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${V.pink}, ${V.violet})` }}>
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-black" style={{ color: V.text }}>Destaques</span>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${V.border}` }}>
              <HighlightRow label="Plataforma favorita" value={S.topPlatform} icon={Monitor} />
              <HighlightRow label="Gênero favorito"     value={S.favGenre}    icon={Heart} />
              <HighlightRow label="Total de jogos"      value={S.total}       icon={Gamepad2} />
              <div className="flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: V.soft }} />
                  <span className="text-sm" style={{ color: V.muted }}>Nota média</span>
                </div>
                <span className="text-sm font-black" style={{ color: V.violet }}>{S.avgRating}</span>
              </div>
            </div>
          </section>

          {/* ── ZERADOS RECENTES ── */}
          {S.recent.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                  <Flame className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-black" style={{ color: V.text }}>Zerados Recentemente</span>
              </div>
              <div className="space-y-2">
                {S.recent.map(game => (
                  <div key={game.id} className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: V.card, border: `1px solid ${V.border}` }}>
                    <div className="w-10 h-14 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ border: `1px solid ${V.border}`, background: V.faint }}>
                      {game.imageBase64
                        ? <img src={game.imageBase64} className="w-full h-full object-cover" alt={game.nome} />
                        : <div className="w-full h-full flex items-center justify-center"><Gamepad2 className="w-4 h-4" style={{ color: V.muted }} /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: V.text }}>{game.nome}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: V.muted }}>{game.platform}</p>
                      {game.finishedDate && (
                        <p className="text-[10px] mt-1" style={{ color: '#10b981' }}>
                          {new Date(game.finishedDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {game.rating > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
                          style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})` }}>
                          <Star className="w-3 h-3 text-white fill-white" />
                          <span className="text-xs font-black text-white">{game.rating}</span>
                        </div>
                      )}
                      {game.isPlatinum && <span className="text-sm">🏆</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── INSÍGNIAS ── */}
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                <Award className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-black" style={{ color: V.text }}>Insígnias</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: V.faint, color: V.muted, border: `1px solid ${V.border}` }}>
                {unlocked}/{BADGES.length}
              </span>
            </div>
            <div className="rounded-2xl p-4" style={{ background: V.card, border: `1px solid ${V.border}` }}>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {BADGES.map(({ emoji, label, req }) => {
                  const on = totalFinishedGames >= req;
                  return (
                    <div key={label} className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                      style={{
                        background: on ? V.faint : 'transparent',
                        border: `1px solid ${on ? V.border : 'transparent'}`,
                        opacity: on ? 1 : 0.25,
                      }}>
                      <span className="text-xl leading-none">{emoji}</span>
                      <span className="text-[9px] font-medium text-center" style={{ color: V.muted }}>{label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-1.5 pt-3" style={{ borderTop: `1px solid ${V.border}` }}>
                <div className="flex justify-between text-[11px]">
                  <span style={{ color: V.muted }}>{unlocked} de {BADGES.length} desbloqueadas</span>
                  <span style={{ color: V.soft }}>{Math.round((unlocked / BADGES.length) * 100)}%</span>
                </div>
                <div className="h-[5px] rounded-full overflow-hidden" style={{ background: V.faint }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(unlocked / BADGES.length) * 100}%`, background: `linear-gradient(90deg, ${V.violet}, ${V.pink})`, boxShadow: `0 0 8px ${V.glow}` }} />
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}