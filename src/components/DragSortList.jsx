import React, { useState, useRef, useCallback } from 'react';
import { GripVertical, Gamepad2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function DragSortList({ games, categoryId, onReorder }) {
  const { theme: V } = useTheme();
  const [items, setItems] = useState(games);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  React.useEffect(() => { setItems(games); }, [games]);

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    setDragging(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
    setDragOver(index);
  };

  const handleDragEnd = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      setDragging(null); setDragOver(null);
      return;
    }
    const newItems = [...items];
    const [moved] = newItems.splice(dragItem.current, 1);
    newItems.splice(dragOverItem.current, 0, moved);
    setItems(newItems);
    setDragging(null); setDragOver(null);
    dragItem.current = null; dragOverItem.current = null;

    // Apenas avisa o GameList da nova ordem (o App.jsx tratará de guardar no Firebase)
    onReorder?.(newItems);
  }, [items, onReorder]);

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <div className="space-y-2">
        {items.map((game, index) => {
          const isDragging = dragging === index;
          const isOver = dragOver === index;
          return (
            <div
              key={game.id}
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragEnter={e => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              className="flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all select-none"
              style={{
                background: isDragging ? `${V.primary}15` : isOver ? `${V.primary}08` : V.faint,
                border: `1px solid ${isDragging ? V.primary : isOver ? `${V.primary}40` : V.border}`,
                opacity: isDragging ? 0.5 : 1,
                transform: isOver && !isDragging ? 'translateY(2px)' : 'none',
                boxShadow: isDragging ? `0 8px 24px ${V.glow}` : 'none',
              }}>
              <GripVertical className="w-4 h-4 flex-shrink-0" style={{ color: V.low }} />
              <span className="text-xs font-black w-4 text-center" style={{ color: V.low }}>{index + 1}</span>
              {game.imageBase64
                ? <img src={game.imageBase64} className="w-8 h-10 rounded-lg object-cover flex-shrink-0" alt={game.nome} />
                : <div className="w-8 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: V.card }}><Gamepad2 className="w-4 h-4" style={{ color: V.muted }} /></div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: V.text }}>{game.nome}</p>
                <p className="text-[10px]" style={{ color: V.muted }}>{game.platform}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}