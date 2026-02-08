import React from 'react';
import { Joystick, TrendingUp, Trophy, User } from 'lucide-react';

export default function BottomNavigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'categories', label: 'Backlog', icon: Joystick, color: 'from-purple-500 to-pink-500' },
    { id: 'progress', label: 'Estatísticas', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
    { id: 'achievements', label: 'Conquistas', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
    { id: 'profile', label: 'Perfil', icon: User, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent backdrop-blur-2xl border-t border-white/10"></div>
      
      <div className="relative max-w-md mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 group"
              >
                {/* Active Background Glow */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${tab.color} opacity-20 rounded-2xl blur-xl transition-opacity duration-300`}></div>
                )}
                
                {/* Icon Container */}
                <div className={`relative z-10 p-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${tab.color} shadow-lg scale-110` 
                    : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                }`}>
                  <Icon 
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                    }`} 
                  />
                </div>
                
                {/* Label */}
                <span className={`text-[10px] font-semibold transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'
                }`}>
                  {tab.label}
                </span>
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <div className={`absolute -bottom-1 w-1.5 h-1.5 bg-gradient-to-r ${tab.color} rounded-full animate-pulse`}></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}