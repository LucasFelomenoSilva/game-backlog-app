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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${V.bg}fa 0%, ${V.bg}e6 70%, transparent 100%)`,
          backdropFilter: 'blur(24px)',
          borderTop: `1px solid ${V.border}`,
        }} />

      <div className="relative max-w-md mx-auto px-2 py-3">
        <div className="flex items-center justify-between gap-1">
          {TABS.map((tab) => {
            const Icon    = tab.icon;
            const isActive = activeTab === tab.id;
            const hasBadge = tab.id === 'friends' && friendRequestCount > 0;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-2xl transition-all duration-300 group flex-1"
              >
                {isActive && (
                  <div className={`absolute inset-0 opacity-15 rounded-2xl blur-xl`} style={{ background: `linear-gradient(to bottom right, ${V.primary}, ${V.secondary})` }} />
                )}

                <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'shadow-lg scale-110' : ''
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

                <span className={`text-[9px] font-bold transition-all duration-300`} style={{ color: isActive ? V.text : V.low }}>
                  {tab.label}
                </span>

                {isActive && (
                  <div className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full`}
                    style={{ background: `linear-gradient(to right, ${V.primary}, ${V.secondary})`, boxShadow: `0 0 6px ${V.primary}cc` }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}