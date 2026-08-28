import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Gamepad2, GripVertical } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function DragSortList({ games, onReorder }) {
  const { theme: V } = useTheme();
  const [items, setItems] = useState(games);

  useEffect(() => setItems(games), [games]);

  const handleDragEnd = result => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const reordered = [...items];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);
    onReorder?.(reordered);
  };

  if (!items.length) return null;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="category-sort-list">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2 rounded-3xl p-2 transition-colors"
            style={{ background: snapshot.isDraggingOver ? V.faint : 'transparent' }}
          >
            {items.map((game, index) => (
              <Draggable key={game.id} draggableId={String(game.id)} index={index}>
                {(dragProvided, dragSnapshot) => {
                  const draggableCard = <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    style={{
                      ...dragProvided.draggableProps.style,
                      background: dragSnapshot.isDragging ? V.card2 : V.card,
                      borderColor: dragSnapshot.isDragging ? V.primary : V.border,
                      boxShadow: dragSnapshot.isDragging ? `0 18px 48px ${V.glow}` : '0 8px 24px rgba(0,0,0,.12)',
                    }}
                    className="flex items-center gap-3 rounded-2xl border p-3 select-none"
                  >
                    <button
                      type="button"
                      {...dragProvided.dragHandleProps}
                      className="cursor-grab rounded-xl p-2 active:cursor-grabbing"
                      style={{ background: V.faint, color: V.muted }}
                      aria-label={`Reordenar ${game.nome}`}
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <span className="w-5 text-center text-xs font-black" style={{ color: V.low }}>{index + 1}</span>
                    {game.imageBase64 ? (
                      <img src={game.imageBase64} className="h-14 w-11 flex-shrink-0 rounded-xl object-cover" alt="" />
                    ) : (
                      <div className="flex h-14 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: V.faint }}><Gamepad2 className="h-4 w-4" style={{ color: V.muted }} /></div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black" style={{ color: V.text }}>{game.nome}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: V.muted }}>{game.platform || 'Sem plataforma'}</p>
                    </div>
                  </div>;

                  return dragSnapshot.isDragging
                    ? createPortal(draggableCard, document.body)
                    : draggableCard;
                }}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
