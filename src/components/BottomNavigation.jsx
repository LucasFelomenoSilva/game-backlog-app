// src/components/BottomNavigation.jsx
import React from 'react';
import { Joystick, TrendingUp, Trophy, User, Users } from 'lucide-react';

export default function BottomNavigation({ activeTab, setActiveTab, friendRequestCount = 0 }) {
  const tabs = [
    { id: 'categories', label: 'Backlog', icon: Joystick, color: 'from-purple-500 to-pink-500' },
    { id: 'progress', label: 'Stats', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
    { id: 'friends', label: 'Amigos', icon: Users, color: 'from-cyan-500 to-teal-500', badge: friendRequestCount },
    { id: 'achievements', label: 'Troféus', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
    { id: 'profile', label: 'Perfil', icon: User, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent backdrop-blur-2xl border-t border-white/10"></div>
      
      <div className="relative max-w-md mx-auto px-3 py-3">
        <div className="flex items-center justify-between gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-2xl transition-all duration-300 group flex-1"
              >
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${tab.color} opacity-20 rounded-2xl blur-xl transition-opacity duration-300`}></div>
                )}
                
                <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${tab.color} shadow-lg scale-110` 
                    : 'bg-gray-800/50 group-hover:bg-gray-700/50'
                }`}>
                  <Icon 
                    className={`w-4 h-4 transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                    }`} 
                  />
                  
                  {/* Badge de notificação */}
                  {tab.badge > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-gray-900 animate-pulse">
                      <span className="text-[8px] font-black text-white">{tab.badge > 9 ? '9+' : tab.badge}</span>
                    </div>
                  )}
                </div>
                
                <span className={`text-[9px] font-semibold transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'
                }`}>
                  {tab.label}
                </span>
                
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