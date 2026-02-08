import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { categoryNames, categoryIcons, categoryColors } from '../data/categories';
import { Plus, Trophy, Dice5 } from 'lucide-react'; // Importe o Dice5
import { toast } from 'react-hot-toast';

export default function CategorySelector({ 
  games, 
  setSelectedCategory, 
  setSelectedGame, // Precisamos disto para abrir o jogo
  getCategoryProgress, 
  user,
  totalFinishedGames,
  setIsAddGameModalOpen 
}) {
  
  // FUNÇÃO CRIATIVA: Backlog Buster
  const handleRandomPick = (e) => {
    e.stopPropagation();
    
    // Junta jogos que são jogáveis (exclui zerados e desejados se quiser focar no backlog)
    const playableGames = [
        ...(games['playing'] || []),
        ...(games['installed'] || []),
        ...(games['backlog'] || [])
    ];

    if (playableGames.length === 0) {
        toast.error("Adicione jogos ao backlog primeiro!");
        return;
    }

    // Efeito de "Rolagem"
    const toastId = toast.loading('Rolando os dados do destino...');
    
    setTimeout(() => {
        const randomGame = playableGames[Math.floor(Math.random() * playableGames.length)];
        toast.dismiss(toastId);
        toast.success(`O destino escolheu: ${randomGame.nome}`, { duration: 4000 });
        setSelectedGame(randomGame); // Abre o jogo diretamente
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 pb-24">
      {/* Header com Perfil */}
      <div className="flex items-center justify-between mb-8 pt-2">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-transform group-hover:scale-105">
               {user?.photoBase64 || user?.photoURL ? (
                  <img src={user.photoBase64 || user.photoURL} alt="Perfil" className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                    {user?.displayName?.charAt(0) || 'G'}
                  </div>
               )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5">
               <div className="bg-yellow-500 text-[10px] font-bold px-1.5 rounded-full text-black flex items-center gap-0.5">
                 <Trophy className="w-2 h-2" />
                 {totalFinishedGames}
               </div>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold">Olá, {user?.displayName?.split(' ')[0] || 'Gamer'}!</h1>
            <p className="text-xs text-gray-400">Pronto para jogar?</p>
          </div>
        </div>
        
        <div className="flex gap-2">
            {/* BOTÃO BACKLOG BUSTER */}
            <button
                onClick={handleRandomPick}
                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all"
                title="Escolher jogo aleatório"
            >
                <Dice5 className="w-5 h-5 text-white animate-pulse" />
            </button>

            <button
                onClick={() => setIsAddGameModalOpen(true)}
                className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all"
            >
                <Plus className="w-5 h-5 text-white" />
            </button>
        </div>
      </div>

      {/* Grid de Categorias (Kanban) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
         {Object.entries(categoryNames).map(([key, label]) => {
           // ... (Mantenha o código existente do map aqui)
           // Apenas certifique-se de que está tudo igual ao anterior
           const Icon = categoryIcons[key];
           const colorClass = categoryColors[key];
           const count = getCategoryProgress(key);
           
           return (
             <Droppable droppableId={key} key={key}>
               {(provided, snapshot) => (
                 <div
                   ref={provided.innerRef}
                   {...provided.droppableProps}
                   onClick={() => setSelectedCategory(key)}
                   className={`relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group ${
                     snapshot.isDraggingOver 
                       ? 'bg-gray-700 border-white scale-105 shadow-xl z-10' 
                       : 'bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:shadow-lg'
                   }`}
                 >
                   <div className={`absolute top-0 right-0 p-2 opacity-10 transition-opacity group-hover:opacity-20`}>
                     <Icon className="w-16 h-16" />
                   </div>
                   
                   <div className="relative z-10">
                     <div className={`w-10 h-10 rounded-xl ${colorClass} bg-opacity-20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                       <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
                     </div>
                     <div className="text-2xl font-bold mb-1">{count}</div>
                     <div className="text-sm text-gray-400 font-medium">{label}</div>
                   </div>
                   {provided.placeholder}
                 </div>
               )}
             </Droppable>
           );
         })}
      </div>
    </div>
  );
}