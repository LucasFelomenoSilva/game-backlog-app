import React, { useMemo } from 'react';
import { LogOut, User, Camera, Trophy, Star, Clock, Zap, Target, ChevronLeft, CheckCircle, Award, Sparkles } from 'lucide-react';

export default function ProfileScreen({ 
  user, 
  handleSignOut, 
  totalFinishedGames, 
  handleProfileImageUpload,
  gamesData, 
  goBack
}) {
  
  const stats = useMemo(() => {
    const safeGames = gamesData || [];
    const finishedGames = safeGames.filter(g => g.status === 'zerados');
    
    const totalHours = finishedGames.reduce((acc, curr) => acc + (parseInt(curr.timeToBeat) || 0), 0);
    
    const ratedGames = finishedGames.filter(g => g.rating > 0);
    const avgRating = ratedGames.length > 0 
        ? (ratedGames.reduce((acc, curr) => acc + parseFloat(curr.rating), 0) / ratedGames.length).toFixed(1)
        : '0.0';

    const genreCounts = {};
    finishedGames.forEach(g => {
        if (g.genre) genreCounts[g.genre] = (genreCounts[g.genre] || 0) + 1;
    });
    const favGenre = Object.entries(genreCounts).sort((a,b) => b[1] - a[1])[0];

    return {
        totalHours,
        avgRating,
        favGenre: favGenre ? favGenre[0] : '-'
    };
  }, [gamesData]);

  const level = Math.floor(totalFinishedGames / 5) + 1;
  const xp = (totalFinishedGames % 5) * 20; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4 pb-24">
      
      {/* Header Moderno */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={goBack}
          className="group p-3 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-0.5 transition-transform" />
        </button>
        
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Meu Perfil
          </h2>
        </div>
        
        <div className="w-12"></div>
      </div>

      {/* Card Principal com Avatar e Info */}
      <div className="relative group mb-8">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        
        <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          
          {/* Avatar com Glow Effect */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              {/* Glow Ring */}
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
              
              {/* Avatar Container */}
              <div className="relative w-28 h-28 rounded-full border-4 border-white/20 overflow-hidden bg-gray-900 shadow-2xl">
                {user.photoBase64 || user.photoURL ? (
                  <img src={user.photoBase64 || user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <User size={48} className="text-gray-600" />
                  </div>
                )}
              </div>
              
              {/* Level Badge */}
              <div className="absolute -bottom-2 -right-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-2 border-gray-900 shadow-lg">
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-bold text-white">LVL {level}</span>
                </div>
              </div>
            </div>
            
            {/* Botão de Foto Moderno */}
            <label className="group cursor-pointer mb-4">
              <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-xl transition-all duration-300 hover:scale-105">
                <Camera size={16} className="text-purple-400 group-hover:rotate-12 transition-transform" />
                <span className="text-sm font-semibold text-white">Alterar Foto</span>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleProfileImageUpload(e.target.files[0])} />
            </label>

            {/* Nome e Email */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {user.displayName}
            </h2>
            <p className="text-gray-400 text-sm font-medium">{user.email}</p>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-300">Experiência</span>
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {xp}% para nível {level + 1}
              </span>
            </div>
            
            <div className="relative w-full h-3 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-700/50">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 transition-all duration-700 relative"
                style={{ width: `${xp}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Estatísticas */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Estatísticas</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          
          {/* Card Nível */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
              <div className="mb-2 p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{level}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Nível</span>
            </div>
          </div>

          {/* Card Zerados */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
              <div className="mb-2 p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{totalFinishedGames}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Zerados</span>
            </div>
          </div>

          {/* Card Horas */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
              <div className="mb-2 p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{stats.totalHours}h</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Jogados</span>
            </div>
          </div>

          {/* Card Nota Média */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
              <div className="mb-2 p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <Star className="w-6 h-6 text-white fill-current" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{stats.avgRating}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Média</span>
            </div>
          </div>

          {/* Card Favorito (Full Width) */}
          <div className="col-span-2 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Gênero Favorito</span>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stats.favGenre}
                </span>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Botão de Logout Moderno */}
      <button
        onClick={handleSignOut}
        className="group w-full relative mt-6"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
        <div className="relative py-4 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-white/10 group-hover:border-red-500/30 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300">
          <LogOut size={20} className="text-red-400 group-hover:rotate-12 transition-transform" />
          <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Sair da Conta
          </span>
        </div>
      </button>

      {/* User ID */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/30 backdrop-blur-xl rounded-full border border-white/5">
          <span className="text-xs text-gray-600 font-mono">ID:</span>
          <span className="text-xs text-gray-500 font-mono">{user.uid ? user.uid.slice(0, 8) : '...'}</span>
        </div>
      </div>
    </div>
  );
}