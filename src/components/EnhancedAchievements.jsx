import React from 'react';
import { Trophy, Star, Crown, CheckCircle, Lock, Gamepad, List, Zap, Target } from 'lucide-react';

export default function EnhancedAchievements({ achievements }) {
  
  const allAchievements = [
    { 
      id: 'first_game', 
      title: 'Primeiro Jogo Zerado', 
      description: 'Marque o seu primeiro jogo como finalizado.',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      points: 100,
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
    {
      id: 'five_games',
      title: 'Colecionador Nível 1',
      description: 'Zere 5 jogos no total.',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      points: 300,
      gradient: 'from-yellow-500/20 to-orange-500/20'
    },
    { 
      id: 'rpg_master', 
      title: 'Mestre do Gênero', 
      description: 'Zere 3 jogos do mesmo gênero (Ex: RPG).',
      icon: Gamepad,
      color: 'from-purple-500 to-pink-500',
      points: 200,
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      id: 'full_backlog',
      title: 'Backlog Cheio',
      description: 'Tenha mais de 15 jogos listados em seu backlog.',
      icon: List,
      color: 'from-blue-500 to-indigo-500',
      points: 150,
      gradient: 'from-blue-500/20 to-indigo-500/20'
    },
  ];

  const unlockedCount = achievements.length;
  const totalPoints = allAchievements
    .filter(ach => achievements.includes(ach.id))
    .reduce((sum, ach) => sum + ach.points, 0);

  const AchievementCard = ({ achievement, isUnlocked }) => {
    const Icon = achievement.icon;
    
    return (
      <div className="group relative">
        {/* Glow Effect for Unlocked */}
        {isUnlocked && (
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${achievement.color} rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-300`}></div>
        )}
        
        <div className={`relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-5 border transition-all duration-300 ${
          isUnlocked 
            ? 'border-white/20 hover:border-white/30 hover:scale-[1.02]' 
            : 'border-gray-800/50 opacity-60'
        }`}>
          
          {/* Lock Icon for Locked Achievements */}
          {!isUnlocked && (
            <div className="absolute top-4 right-4">
              <div className="p-2 bg-gray-800/80 rounded-xl backdrop-blur-sm">
                <Lock className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-4">
            {/* Icon Container */}
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 ${
                isUnlocked 
                  ? `bg-gradient-to-br ${achievement.color} shadow-xl shadow-${achievement.color}/50` 
                  : 'bg-gray-800/50'
              }`}>
                <Icon className={`w-9 h-9 ${isUnlocked ? 'text-white' : 'text-gray-600'}`} />
              </div>
              
              {/* Sparkle Effect for Unlocked */}
              {isUnlocked && (
                <div className="absolute -top-1 -right-1">
                  <div className={`w-6 h-6 bg-gradient-to-br ${achievement.color} rounded-full flex items-center justify-center animate-pulse`}>
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 pt-1">
              <h3 className={`font-bold text-lg mb-1.5 ${
                isUnlocked ? 'text-white' : 'text-gray-500'
              }`}>
                {achievement.title}
              </h3>
              <p className={`text-sm leading-relaxed mb-3 ${
                isUnlocked ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {achievement.description}
              </p>
              
              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {isUnlocked ? (
                  <>
                    <div className={`px-3 py-1.5 bg-gradient-to-r ${achievement.gradient} backdrop-blur-sm rounded-full flex items-center gap-1.5`}>
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-xs font-bold text-yellow-400">+{achievement.points} XP</span>
                    </div>
                    <div className="px-3 py-1.5 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs font-bold text-green-400">Desbloqueada</span>
                    </div>
                  </>
                ) : (
                  <div className="px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-xs font-semibold text-gray-600">Bloqueada</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white pb-24 pt-6">
      <div className="max-w-md mx-auto px-4">
        
        {/* Header com gradiente */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg shadow-yellow-500/30">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Conquistas
              </h1>
              <p className="text-gray-400 text-sm">Desbloqueie todas as conquistas</p>
            </div>
          </div>
        </div>

        {/* Stats Cards com gradientes modernos */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Desbloqueadas */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Desbloqueadas</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {unlockedCount}<span className="text-2xl text-gray-500">/{allAchievements.length}</span>
              </div>
            </div>
          </div>

          {/* Pontos */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Total XP</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {totalPoints}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Conquistas */}
        <div className="space-y-4 mb-8">
          {allAchievements.map((ach) => (
            <AchievementCard
              key={ach.id}
              achievement={ach}
              isUnlocked={achievements.includes(ach.id)}
            />
          ))}
        </div>

        {/* Progress Bar Modernizada */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold text-gray-300">Progresso Total</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {Math.round((unlockedCount / allAchievements.length) * 100)}%
              </span>
            </div>
            
            <div className="relative w-full h-4 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-700/50">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-700 ease-out relative"
                style={{ width: `${(unlockedCount / allAchievements.length) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-400 text-center">
              {unlockedCount === allAchievements.length 
                ? '🎉 Parabéns! Todas as conquistas desbloqueadas!' 
                : `Faltam ${allAchievements.length - unlockedCount} conquistas para completar 100%`
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}