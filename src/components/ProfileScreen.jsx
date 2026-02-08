import React from 'react';
import { LogOut, User, Camera, Trophy, Star, Gamepad2, ChevronLeft } from 'lucide-react';

export default function ProfileScreen({ 
  user, 
  handleSignOut, 
  totalFinishedGames, 
  totalAchievements,
  handleProfileImageUpload,
  goBack // Recebe a função aqui
}) {
  
  // Exemplo de cálculo de nível simples
  const level = Math.floor(totalFinishedGames / 5) + 1;
  const xp = (totalFinishedGames % 5) * 20; 

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      
      {/* HEADER COM BOTÃO VOLTAR */}
      <div className="flex items-center justify-between mb-6">
          <button 
            onClick={goBack}
            className="p-2 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-xl font-bold">Perfil do Jogador</h2>
          <div className="w-10"></div> {/* Espaçador para centralizar */}
      </div>

      <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700 mb-6 flex flex-col items-center relative overflow-hidden">
        {/* ... (o restante do código do perfil que você já tem, mantenha igual) ... */}
        {/* Vou resumir para garantir que você tenha a parte principal do voltar */}
        
        <div className="relative group mb-4">
            <div className="w-28 h-28 rounded-full border-4 border-cyan-500/30 overflow-hidden bg-gray-900">
                {user.photoBase64 || user.photoURL ? (
                    <img src={user.photoBase64 || user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                        <User size={40} />
                    </div>
                )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-cyan-600 rounded-full cursor-pointer hover:bg-cyan-500 transition-colors shadow-lg">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleProfileImageUpload(e.target.files[0])} />
            </label>
        </div>

        <h2 className="text-2xl font-bold mb-1">{user.displayName}</h2>
        <p className="text-gray-400 text-sm mb-4">{user.email}</p>

        <div className="grid grid-cols-2 gap-4 w-full mt-4">
           <div className="bg-gray-900/50 p-3 rounded-xl text-center border border-gray-700/50">
               <p className="text-xs text-gray-400 uppercase font-bold">Nível</p>
               <p className="text-xl font-bold text-cyan-400">{level}</p>
           </div>
           <div className="bg-gray-900/50 p-3 rounded-xl text-center border border-gray-700/50">
               <p className="text-xs text-gray-400 uppercase font-bold">XP</p>
               <p className="text-xl font-bold text-purple-400">{xp}%</p>
           </div>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="w-full py-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
      >
        <LogOut size={20} />
        Sair da Conta (Logout)
      </button>
    </div>
  );
}