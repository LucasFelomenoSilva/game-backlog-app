import React, { useState, useRef, useCallback } from 'react';
import { GripVertical, Gamepad2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export default function DragSortList({ games, categoryId, onReorder }) {
  const { theme: V } = useTheme();
  const [items, setItems] = useState(games);
  const [dragging, setDragging] = useState(null);
  const dragItem = useRef(null);

  React.useEffect(() => { setItems(games); }, [games]);

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    setDragging(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, index) => {
    if (dragItem.current === null || dragItem.current === index) return;
    
    const newItems = [...items];
    const [moved] = newItems.splice(dragItem.current, 1);
    newItems.splice(index, 0, moved);
    
    dragItem.current = index;
    setItems(newItems);
  };

  const handleDragEnd = useCallback(() => {
    setDragging(null);
    dragItem.current = null;
    onReorder?.(items);
  }, [items, onReorder]);

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <div className="space-y-2">
        {items.map((game, index) => {
          const isDragging = dragging === index;
          return (
            <motion.div
              layout
              key={game.id}
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragEnter={e => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              className="flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing select-none"
              style={{
                background: isDragging ? `${V.primary}25` : V.faint,
                border: `1px solid ${isDragging ? V.primary : V.border}`,
                opacity: isDragging ? 0.7 : 1,
                boxShadow: isDragging ? `0 8px 24px ${V.glow}` : 'none',
              }}
              whileHover={{ scale: isDragging ? 1 : 1.015, x: 2 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}