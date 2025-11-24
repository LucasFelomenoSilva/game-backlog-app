import React from 'react';
import { Joystick, TrendingUp, Trophy, User } from 'lucide-react';

export default function BottomNavigation({ activeTab, setActiveTab }) {
  // Definição das abas de navegação
  const tabs = [
    { id: 'categories', label: 'Backlog', icon: Joystick },
    { id: 'progress', label: 'Estatísticas', icon: TrendingUp },
    { id: 'achievements', label: 'Conquistas', icon: Trophy },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-50 safe-area-bottom">
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/20' // Estilo ativo (Cyan)
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 mb-1 transition-all duration-300 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`} 
                />
                <span className={`text-xs font-medium ${
                  isActive ? 'font-semibold' : 'font-normal'
                }`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-8 h-1 bg-cyan-500 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}