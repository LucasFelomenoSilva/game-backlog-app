// src/components/BottomNavigation.jsx
import React from 'react';
import { Joystick, TrendingUp, Trophy, User, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // <-- Importado

const TABS = [
  { id: 'categories',   label: 'Backlog',  icon: Joystick },
  { id: 'progress',     label: 'Stats',    icon: TrendingUp },
  { id: 'friends',      label: 'Social',   icon: Users },
  { id: 'achievements', label: 'Troféus',  icon: Trophy },
  { id: 'profile',      label: 'Perfil',   icon: User },
];

export default function BottomNavigation({ activeTab, setActiveTab, friendRequestCount = 0 }) {
  const { theme: V } = useTheme(); // <-- Usando as cores do tema

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
      <div className="absolute inset-x-0 bottom-0 h-28"
        style={{
          background: `linear-gradient(to top, ${V.bg} 0%, ${V.bg}d8 50%, transparent 100%)`,
        }} />

      <div className="glass-panel pointer-events-auto relative mx-auto max-w-xl rounded-[1.65rem] p-1.5 shadow-2xl">
        <div className="flex items-center justify-between gap-1">
          {TABS.map((tab) => {
            const Icon    = tab.icon;
            const isActive = activeTab === tab.id;
            const hasBadge = tab.id === 'friends' && friendRequestCount > 0;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="group relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition-all duration-300 sm:flex-row sm:gap-2"
                aria-label={`Abrir ${tab.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl" style={{ background: V.faint, border: `1px solid ${V.border}` }} />
                )}

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
  );
}
