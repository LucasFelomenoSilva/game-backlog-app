// src/components/CategorySelector.jsx
import React from 'react';
import { TrendingUp, PlusCircle, CheckCircle, Heart, Clock, Gamepad2, HardDrive } from 'lucide-react';
import { categoryNames, categoryColors } from '../data/categories';
import { Droppable, Draggable } from '@hello-pangea/dnd';

export default function CategorySelector({
  games, 
  setSelectedCategory,
  setSelectedGame, 
  setIsAddGameModalOpen,
}) {
  
  const kanbanColumns = ['playing', 'installed', 'backlog'];
  const listCategories = ['zerados', 'desejados'];

  // PROTEÇÃO: Usa optional chaining (?.) e fallback para 0 caso a lista não exista
  const getCount = (cat) => games?.[cat]?.length || 0;
  
  const finishedGamesCount = getCount('zerados');
  const playingCount = getCount('playing'); // Protegido contra undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 pb-32 overflow-x-hidden">
      <div className="max-w-4xl mx-auto animate-fadeIn">
        
        {/* Header Compacto */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Meu Backlog
            </h1>
            <p className="text-xs text-gray-400">
               {/* PROTEÇÃO AQUI: games?.playing?.length */}
               Arraste para organizar • {playingCount} jogando
            </p>
          </div>
          <button
              onClick={() => setIsAddGameModalOpen(true)}
              className="p-3 bg-blue-600 rounded-full hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all"
          >
              <PlusCircle className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* ÁREA KANBAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {kanbanColumns.map((columnId) => {
                // PROTEÇÃO: Garante que columnGames seja sempre um array
                const columnGames = games?.[columnId] || [];
                
                return (
                    <div key={columnId} className="flex flex-col bg-gray-800/40 backdrop-blur border border-gray-700 rounded-2xl h-[500px]">
                        {/* Título da Coluna */}
                        <div className={`p-4 border-b border-gray-700 bg-gradient-to-r ${categoryColors[columnId] || 'from-gray-700 to-gray-600'} bg-opacity-10 rounded-t-2xl`}>
                            <h2 className="font-bold flex items-center gap-2">
                                {columnId === 'playing' && <Gamepad2 className="w-4 h-4" />}
                                {columnId === 'installed' && <HardDrive className="w-4 h-4" />}
                                {columnId === 'backlog' && <Clock className="w-4 h-4" />}
                                {categoryNames[columnId] || columnId}
                                <span className="ml-auto text-xs bg-black/30 px-2 py-1 rounded-full">{columnGames.length}</span>
                            </h2>
                        </div>

                        {/* Área Droppable */}
                        <Droppable droppableId={columnId}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${
                                        snapshot.isDraggingOver ? 'bg-gray-700/30' : ''
                                    }`}
                                >
                                    {columnGames.length === 0 && (
                                        <div className="text-center text-gray-500 text-sm mt-10 italic">
                                            Arraste jogos para cá
                                        </div>
                                    )}

                                    {columnGames.map((game, index) => (
                                        <Draggable key={game.id} draggableId={game.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={() => setSelectedGame(game)}
                                                    style={{ ...provided.draggableProps.style }}
                                                    className={`p-3 bg-gray-800 rounded-xl border border-gray-600 shadow-sm hover:border-gray-500 group relative
                                                        ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500 rotate-2 bg-gray-700' : ''}
                                                    `}
                                                >
                                                    {/* Imagem de Capa */}
                                                    {game.imageBase64 && (
                                                        <div className="h-24 w-full mb-2 rounded-lg overflow-hidden relative">
                                                            <img src={game.imageBase64} alt={game.nome} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                                        </div>
                                                    )}
                                                    
                                                    <h3 className="font-semibold text-sm truncate">{game.nome}</h3>
                                                    <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                                                        <span>{game.platform}</span>
                                                        {game.timeToBeat > 0 && <span>{game.timeToBeat}h</span>}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                );
            })}
        </div>

        {/* Listas Secundárias */}
        <div className="grid grid-cols-2 gap-4">
             {listCategories.map(cat => (
                 <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="p-4 bg-gray-800/60 border border-gray-700 rounded-2xl flex items-center justify-between hover:bg-gray-800 transition-all"
                 >
                     <div className="flex items-center gap-3">
                         {cat === 'zerados' ? <CheckCircle className="text-green-500" /> : <Heart className="text-yellow-500" />}
                         <div className="text-left">
                             <div className="font-bold text-sm">{categoryNames[cat] || cat}</div>
                             <div className="text-xs text-gray-400">{getCount(cat)} itens</div>
                         </div>
                     </div>
                 </button>
             ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 bg-gray-800/40 border border-gray-700 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-400">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold">{finishedGamesCount} Zerados</span>
            </div>
            <span className="text-xs text-gray-500">Continue assim!</span>
        </div>

      </div>
    </div>
  );
}