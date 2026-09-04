// src/components/BottomNavigation.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Joystick, TrendingUp, Trophy, User, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const TAB_DEFS = [
  { id: 'categories',   key: 'tab.backlog',  icon: Joystick },
  { id: 'progress',     key: 'tab.stats',    icon: TrendingUp },
  { id: 'friends',      key: 'tab.social',   icon: Users },
  { id: 'achievements', key: 'tab.trophies', icon: Trophy },
  { id: 'profile',      key: 'tab.profile',  icon: User },
];

export default function BottomNavigation({
  activeTab,
  setActiveTab,
  friendRequestCount = 0,
  user,
  totalFinishedGames = 0,
}) {
  const { theme: V } = useTheme();
  const { t } = useLanguage();
  const avatar = user?.photoBase64 || user?.photoURL;
  const firstName = user?.displayName?.split(' ')[0] || 'Gamer';
  const tabs = TAB_DEFS.map(tDef => ({ ...tDef, label: t(tDef.key) }));

  return (
    <>
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r px-4 py-5 lg:flex"
        style={{ background: V.bg, borderColor: V.border }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className="flex items-center gap-3 rounded-2xl px-2 py-2 text-left"
          aria-label="Abrir o backlog"
        >
          <span
            className="grid h-10 w-10 place-items-center rounded-xl text-white shadow-lg"
            style={{ background: V.grad, boxShadow: `0 10px 28px ${V.glow}` }}
          >
            <Gamepad2 className="h-5 w-5" />
          </span>
          <span>
            <strong className="block text-lg font-black leading-none tracking-tight" style={{ color: V.text }}>XpLog</strong>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: V.muted }}>Game backlog</span>
          </span>
        </button>

        <nav className="mt-7 space-y-1" aria-label="Navegação principal">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasBadge = tab.id === 'friends' && friendRequestCount > 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-sm font-bold transition-colors"
                style={{ color: isActive ? V.soft : V.muted }}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="desktop-navigation-active"
                    className="absolute inset-0 rounded-xl border"
                    style={{ background: V.faint, borderColor: `${V.primary}45` }}
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className="relative h-[18px] w-[18px]" />
                <span className="relative flex-1 text-left">{tab.label}</span>
                {hasBadge && (
                  <span className="relative grid min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                    {friendRequestCount > 9 ? '9+' : friendRequestCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border p-3" style={{ background: V.card, borderColor: V.border }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl border" style={{ borderColor: V.border, background: V.faint }}>
              {avatar
                ? <img src={avatar} alt="Perfil" className="h-full w-full object-cover" />
                : <span className="grid h-full w-full place-items-center text-sm font-black" style={{ color: V.soft }}>{firstName.charAt(0)}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold" style={{ color: V.text }}>{firstName}</p>
              <p className="truncate text-[11px]" style={{ color: V.muted }}>{totalFinishedGames} {t('nav.completed_games')}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="absolute inset-x-0 bottom-0 h-28"
          style={{ background: `linear-gradient(to top, ${V.bg} 0%, ${V.bg}d8 50%, transparent 100%)` }} />

        <div className="glass-panel pointer-events-auto relative mx-auto max-w-xl rounded-[1.4rem] p-1.5 shadow-2xl">
        <div className="flex items-center justify-between gap-1">
          {tabs.map((tab) => {
            const Icon    = tab.icon;
            const isActive = activeTab === tab.id;
            const hasBadge = tab.id === 'friends' && friendRequestCount > 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="group relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition-all duration-300 sm:flex-row sm:gap-2"
                aria-label={`Abrir ${tab.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && <motion.div layoutId="mobile-navigation-active" className="absolute inset-0 rounded-2xl" style={{ background: V.faint, border: `1px solid ${V.border}` }} transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}

                <div className={`relative z-10 rounded-xl p-2 transition-all duration-300 ${
                  isActive ? 'shadow-lg' : ''
                }`}
                  style={{
                    background: isActive ? `linear-gradient(to bottom right, ${V.primary}, ${V.secondary})` : V.faint,
                    boxShadow: isActive ? `0 4px 16px ${V.glow}` : 'none'
                  }}>
                  <Icon className={`w-4 h-4 transition-all duration-300`} style={{ color: isActive ? '#fff' : V.muted }} />

                  {hasBadge && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center animate-pulse"
                      style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)', border: `2px solid ${V.bg}` }}>
                      <span className="text-[8px] font-black text-white">
                        {friendRequestCount > 9 ? '9+' : friendRequestCount}
                      </span>
                    </div>
                  )}
                </div>

                <span className="relative z-10 text-[9px] font-bold transition-all duration-300 sm:text-[11px]" style={{ color: isActive ? V.text : V.low }}>
                  {tab.label}
                </span>

              </button>
            );
          })}
        </div>
        </div>
      </div>
    </>
  );
}
