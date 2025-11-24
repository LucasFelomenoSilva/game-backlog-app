import React from 'react';
import { Trophy, Star, Crown, CheckCircle, Lock, Gamepad, List } from 'lucide-react';

export default function EnhancedAchievements({ achievements }) {
  
  // Lista de Conquistas do Jogo
  const allAchievements = [
    { 
      id: 'first_game', 
      title: 'Primeiro Jogo Zerado', 
      description: 'Marque o seu primeiro jogo como finalizado.',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      points: 100
    },
    {
      id: 'five_games',
      title: 'Colecionador Nível 1',
      description: 'Zere 5 jogos no total.',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      points: 300
    },
    { 
      id: 'rpg_master', 
      title: 'Mestre do Gênero', 
      description: 'Zere 3 jogos do mesmo gênero (Ex: RPG).',
      icon: Gamepad,
      color: 'from-purple-500 to-pink-500',
      points: 200
    },
    {
      id: 'full_backlog',
      title: 'Backlog Cheio',
      description: 'Tenha mais de 15 jogos listados em seu backlog.',
      icon: List,
      color: 'from-blue-500 to-indigo-500',
      points: 150
    },
];

  const unlockedCount = achievements.length;
  const totalPoints = allAchievements
    .filter(ach => achievements.includes(ach.id))
    .reduce((sum, ach) => sum + ach.points, 0);

  // Componente de Conquista
  const AchievementCard = ({ achievement, isUnlocked }) => {
    const Icon = achievement.icon;
    
    return (
      <div
        className={`relative bg-gray-800/50 backdrop-blur rounded-2xl p-4 border transition-all duration-300 ${
          isUnlocked 
            ? 'border-green-500/50 hover:scale-[1.02]' 
            : 'border-gray-700 opacity-70'
        }`}
      >
        {!isUnlocked && (
          <div className="absolute top-3 right-3">
            <Lock className="w-5 h-5 text-gray-500" />
          </div>
        )}
        
        <div className="flex items-start gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
              isUnlocked 
                ? `bg-gradient-to-br ${achievement.color}` 
                : 'bg-gray-700'
            }`}
          >
            <Icon className={`w-8 h-8 ${isUnlocked ? 'text-white' : 'text-gray-500'}`} />
          </div>
          
          <div className="flex-1">
            <h3 className={`font-semibold text-lg mb-1 ${
              isUnlocked ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {achievement.title}
            </h3>
            <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
            
            {isUnlocked && (
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-yellow-500/20 rounded-full text-xs text-yellow-400 font-semibold">
                  +{achievement.points} pontos
                </div>
                <div className="text-xs text-green-400">✓ Desbloqueada</div>
              </div>
            )}
            
            {!isUnlocked && (
              <div className="text-xs text-gray-500">Bloqueada</div>
            )}
          </div>
        </div>

        {isUnlocked && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <Star className="w-5 h-5 fill-white text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-24 pt-6">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Conquistas</h1>
          <p className="text-gray-400">Desbloqueie todas as conquistas de jogador</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur rounded-2xl p-4 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-300">Desbloqueadas</span>
            </div>
            <div className="text-3xl font-bold">{unlockedCount}/{allAchievements.length}</div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur rounded-2xl p-4 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-gray-300">Pontos</span>
            </div>
            <div className="text-3xl font-bold">{totalPoints}</div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
            {allAchievements.map((ach) => (
              <AchievementCard
                key={ach.id}
                achievement={ach}
                isUnlocked={achievements.includes(ach.id)}
              />
            ))}
        </div>

        {/* Progress Bar para Conquistas */}
        <div className="mt-6 bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progresso Total</span>
              <span className="text-sm font-semibold text-cyan-400">
                {Math.round((unlockedCount / allAchievements.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${(unlockedCount / allAchievements.length) * 100}%` }}
              />
            </div>
          </div>
      </div>
    </div>
  );
}