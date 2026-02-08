import React, { useMemo } from 'react';
import { LogOut, User, Camera, Trophy, Star, Clock, Zap, Target, ChevronLeft, CheckCircle } from 'lucide-react';

export default function ProfileScreen({ 
  user, 
  handleSignOut, 
  totalFinishedGames, 
  handleProfileImageUpload,
  gamesData, 
  goBack
}) {
  
  // CÁLCULO DE ESTATÍSTICAS
  const stats = useMemo(() => {
    const safeGames = gamesData || [];
    const finishedGames = safeGames.filter(g => g.status === 'zerados');
    
    // 1. Total de Horas
    const totalHours = finishedGames.reduce((acc, curr) => acc + (parseInt(curr.timeToBeat) || 0), 0);
    
    // 2. Média de Notas
    const ratedGames = finishedGames.filter(g => g.rating > 0);
    const avgRating = ratedGames.length > 0 
        ? (ratedGames.reduce((acc, curr) => acc + parseFloat(curr.rating), 0) / ratedGames.length).toFixed(1)
        : '0.0';

    // 3. Gênero Favorito
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

  // Nível simples
  const level = Math.floor(totalFinishedGames / 5) + 1;
  const xp = (totalFinishedGames % 5) * 20; 

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      
      {/* HEADER ESTÁTICO */}
      <div className="flex items-center justify-between mb-6">
          <button 
            onClick={goBack}
            className="p-2 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-xl font-bold tracking-wide">Perfil</h2>
          <div className="w-10"></div> {/* Espaçador para manter o título centralizado */}
      </div>

      {/* CARD PRINCIPAL (SÓLIDO) */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6 flex flex-col items-center">
        
        {/* Avatar e Botão de Foto (Layout em Coluna, sem sobreposição) */}
        <div className="flex flex-col items-center gap-3 mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-gray-700 overflow-hidden bg-gray-900">
                {user.photoBase64 || user.photoURL ? (
                    <img src={user.photoBase64 || user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                        <User size={40} />
                    </div>
                )}
            </div>
            
            {/* Botão Estático de Alterar Foto */}
            <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 border border-gray-600 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                <Camera size={14} />
                <span>Alterar Foto</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleProfileImageUpload(e.target.files[0])} />
            </label>
        </div>

        <h2 className="text-xl font-bold text-white text-center">{user.displayName}</h2>
        <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-6">{user.email}</p>

        {/* Barra de XP Estática */}
        <div className="w-full">
            <div className="flex justify-between text-xs text-gray-400 font-bold mb-1">
                <span>Nível {level}</span>
                <span>{xp}% para o próximo</span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-3 overflow-hidden border border-gray-700">
                <div 
                    className="h-full bg-blue-600"
                    style={{ width: `${xp}%` }}
                ></div>
            </div>
        </div>
      </div>

      {/* ESTATÍSTICAS (GRID ESTÁTICO) */}
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" /> Estatísticas
      </h3>
      
      <div className="grid grid-cols-2 gap-3 mb-8">
           {/* Card: Nível */}
           <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
               <div className="mb-2 text-blue-500">
                   <Trophy className="w-6 h-6" />
               </div>
               <span className="text-2xl font-bold text-white">{level}</span>
               <span className="text-[10px] text-gray-400 uppercase font-bold">Nível Atual</span>
           </div>

           {/* Card: Zerados */}
           <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
               <div className="mb-2 text-green-500">
                   <CheckCircle className="w-6 h-6" />
               </div>
               <span className="text-2xl font-bold text-white">{totalFinishedGames}</span>
               <span className="text-[10px] text-gray-400 uppercase font-bold">Zerados</span>
           </div>

           {/* Card: Horas */}
           <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
               <div className="mb-2 text-orange-500">
                   <Clock className="w-6 h-6" />
               </div>
               <span className="text-2xl font-bold text-white">{stats.totalHours}h</span>
               <span className="text-[10px] text-gray-400 uppercase font-bold">Jogados</span>
           </div>

           {/* Card: Nota Média */}
           <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
               <div className="mb-2 text-yellow-500">
                   <Star className="w-6 h-6 fill-current" />
               </div>
               <span className="text-2xl font-bold text-white">{stats.avgRating}</span>
               <span className="text-[10px] text-gray-400 uppercase font-bold">Média</span>
           </div>

            {/* Card: Favorito (Full Width) */}
           <div className="col-span-2 bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
               <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">Gênero Favorito</span>
                    <span className="text-lg font-bold text-purple-400">{stats.favGenre}</span>
               </div>
               <div className="text-purple-500 bg-purple-500/10 p-2 rounded-lg">
                   <Zap className="w-6 h-6" />
               </div>
           </div>
      </div>

      <button
        onClick={handleSignOut}
        className="w-full py-4 bg-gray-800 border border-gray-700 text-red-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
      >
        <LogOut size={20} />
        Sair da Conta
      </button>

      <div className="mt-6 text-center text-xs text-gray-600 font-mono">
          ID: {user.uid ? user.uid.slice(0, 8) : '...'}
      </div>
    </div>
  );
}