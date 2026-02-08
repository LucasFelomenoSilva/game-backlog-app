import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Gamepad2, List, Trophy, Clock, Star, PlusCircle, Sparkles, Monitor, Box } from "lucide-react";
import { categoryNames } from "../data/categories";

// Componente do Cartão do Jogo (Draggable)
const GameCard = ({ game, index, onClick }) => {
  return (
    <Draggable draggableId={game.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(game)}
          className={`
            mb-3 p-3 rounded-xl border border-gray-700/50 shadow-lg backdrop-blur-md transition-all group
            ${snapshot.isDragging ? "bg-cyan-900/80 scale-105 z-50 ring-2 ring-cyan-400" : "bg-gray-800/60 hover:bg-gray-700/80 hover:border-cyan-500/30"}
          `}
          style={provided.draggableProps.style}
        >
          <div className="flex gap-3 items-center">
            {/* Imagem Pequena (Thumbnail) */}
            <div className="w-12 h-16 rounded-lg bg-gray-900 overflow-hidden flex-shrink-0 border border-gray-700">
              {game.imageBase64 ? (
                <img src={game.imageBase64} alt={game.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <Gamepad2 size={20} />
                </div>
              )}
            </div>

            {/* Informações */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-100 text-sm truncate leading-tight mb-1 group-hover:text-cyan-400 transition-colors">
                {game.nome}
              </h4>
              <p className="text-xs text-gray-400 truncate mb-1">{game.platform}</p>
              
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                {game.rating && (
                   <span className="text-yellow-500 flex items-center gap-0.5 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                     <Star size={10} fill="currentColor" /> {game.rating}
                   </span>
                )}
                {game.timeToBeat > 0 && (
                   <span className="flex items-center gap-0.5 bg-gray-700/50 px-1.5 py-0.5 rounded">
                     <Clock size={10} /> {game.timeToBeat}h
                   </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

// Componente da Coluna (Droppable)
const KanbanColumn = ({ id, title, games, icon: Icon, color, onHeaderClick, onGameClick }) => {
  return (
    <div className="flex flex-col h-full min-w-[280px] md:w-1/3 bg-gray-900/40 rounded-2xl border border-gray-800/50 overflow-hidden">
      {/* Cabeçalho da Coluna */}
      <div 
        onClick={() => onHeaderClick(id)}
        className={`p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 ${color}`}
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <Icon size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-100">{title}</span>
        </div>
        <span className="text-xs font-bold bg-gray-900/50 px-2 py-1 rounded-md text-gray-400 border border-gray-700">
          {games.length}
        </span>
      </div>

      {/* Área de Drop */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 p-3 overflow-y-auto custom-scrollbar transition-colors
              ${snapshot.isDraggingOver ? "bg-cyan-500/5" : "bg-transparent"}
            `}
            style={{ minHeight: "200px" }}
          >
            {games.length > 0 ? (
              games.map((game, index) => (
                <GameCard key={game.id} game={game} index={index} onClick={onGameClick} />
              ))
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-60">
                  <Box size={32} strokeWidth={1.5} className="mb-2" />
                  <p className="text-xs font-medium">Arraste jogos aqui</p>
               </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default function CategorySelector({
  games,
  setSelectedCategory,
  setSelectedGame,
  getCategoryProgress,
  user,
  totalFinishedGames,
  setIsAddGameModalOpen
}) {
  
  // Define quais colunas mostrar. Você pode ajustar isso conforme sua preferência.
  // Aqui estou focando nas 3 principais que formam o fluxo: Jogando -> Backlog -> Zerados
  const columns = [
    { id: "playing", title: categoryNames.playing || "Jogando", icon: Gamepad2, color: "text-orange-400" },
    { id: "backlog", title: categoryNames.backlog || "Backlog", icon: List, color: "text-purple-400" },
    { id: "zerados", title: categoryNames.zerados || "Zerados", icon: Trophy, color: "text-emerald-400" }
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header Rápido */}
      <div className="flex items-center justify-between mb-6 shrink-0">
         <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{user.displayName?.split(' ')[0]}</span> 👋
            </h2>
            <p className="text-gray-400 text-sm flex items-center gap-2">
               <Trophy size={14} className="text-yellow-500" /> 
               {totalFinishedGames} Jogos Zerados
            </p>
         </div>
         
         <div className="flex gap-2">
            <button
                onClick={() => setIsAddGameModalOpen(true)}
                className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95 flex items-center gap-2 font-bold"
            >
                <PlusCircle size={20} />
                <span className="hidden md:inline">Novo Jogo</span>
            </button>
         </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex flex-col md:flex-row gap-4 h-full min-w-full md:min-w-0">
            {columns.map(col => (
                <KanbanColumn
                    key={col.id}
                    id={col.id}
                    title={col.title}
                    icon={col.icon}
                    color={col.color}
                    games={games[col.id] || []}
                    onHeaderClick={setSelectedCategory} // Clicar no título abre a lista completa
                    onGameClick={setSelectedGame}       // Clicar no card abre os detalhes
                />
            ))}
        </div>
      </div>
      
      {/* Atalhos para categorias secundárias (se houver jogos nelas) */}
      <div className="flex gap-2 mt-2 overflow-x-auto pb-2 shrink-0">
          {['installed', 'desejados'].map(cat => {
              const count = games[cat]?.length || 0;
              if (count === 0) return null;
              return (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-xs font-bold text-gray-400 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>{categoryNames[cat]}</span>
                    <span className="bg-gray-700 px-1.5 py-0.5 rounded text-[10px] text-gray-300">{count}</span>
                  </button>
              )
          })}
      </div>

    </div>
  );
}