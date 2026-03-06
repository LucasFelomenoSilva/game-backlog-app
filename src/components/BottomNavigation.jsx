// src/components/BottomNavigation.jsx — Tema roxo/violeta
import React from 'react';
import { Joystick, TrendingUp, Trophy, User, Users } from 'lucide-react';

const TABS = [
  { id: 'categories',   label: 'Backlog',  icon: Joystick,   grad: 'from-violet-500 to-indigo-600'  },
  { id: 'progress',     label: 'Stats',    icon: TrendingUp,  grad: 'from-purple-500 to-violet-600'  },
  { id: 'friends',      label: 'Social',   icon: Users,       grad: 'from-indigo-500 to-violet-500'  },
  { id: 'achievements', label: 'Troféus',  icon: Trophy,      grad: 'from-violet-600 to-purple-600'  },
  { id: 'profile',      label: 'Perfil',   icon: User,        grad: 'from-purple-500 to-pink-600'    },
];

export default function BottomNavigation({ activeTab, setActiveTab, friendRequestCount = 0 }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Blur backdrop */}
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(9,6,15,0.98) 0%, rgba(9,6,15,0.90) 70%, transparent 100%)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(139,92,246,0.15)',
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
                {/* Glow behind active tab */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${tab.grad} opacity-15 rounded-2xl blur-xl`} />
                )}

                {/* Icon container */}
                <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-br ${tab.grad} shadow-lg scale-110`
                    : 'bg-[rgba(139,92,246,0.06)] group-hover:bg-[rgba(139,92,246,0.12)]'
                }`}
                  style={isActive ? { boxShadow: '0 4px 16px rgba(139,92,246,0.45)' } : {}}>
                  <Icon className={`w-4 h-4 transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-purple-300/50 group-hover:text-purple-300/70'
                  }`} />

                  {/* Badge notificação */}
                  {hasBadge && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center animate-pulse"
                      style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)', border: '2px solid #09060f' }}>
                      <span className="text-[8px] font-black text-white">
                        {friendRequestCount > 9 ? '9+' : friendRequestCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Label */}
                <span className={`text-[9px] font-bold transition-all duration-300 ${
                  isActive ? 'text-purple-200' : 'text-purple-300/35 group-hover:text-purple-300/50'
                }`}>
                  {tab.label}
                </span>

                {/* Active dot */}
                {isActive && (
                  <div className={`absolute -bottom-1 w-1.5 h-1.5 bg-gradient-to-r ${tab.grad} rounded-full`}
                    style={{ boxShadow: '0 0 6px rgba(139,92,246,0.8)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}