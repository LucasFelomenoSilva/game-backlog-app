// src/hooks/useUndoDelete.js — Undo delete com toast de 5 segundos
import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function useUndoDelete() {
  const pendingRef = useRef(null);

  const deleteWithUndo = useCallback((game, userId, onDeleted) => {
    // Cancela delete anterior se ainda pendente
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timer);
      pendingRef.current.execute();
    }

    let undone = false;
    let toastId;

    const execute = async () => {
      if (undone) return;
      try {
        await deleteDoc(doc(db, 'users', userId, 'games', game.id));
        onDeleted?.(game.id);
      } catch (e) {
        console.error('Erro ao deletar:', e);
      }
      pendingRef.current = null;
    };

    const timer = setTimeout(execute, 5000);
    pendingRef.current = { timer, execute };

    toastId = toast(
      (t) => {
        const ToastContent = () => {
          const [secs, setSecs] = useState(5);
          const intervalRef = useRef(null);

          useState(() => {
            intervalRef.current = setInterval(() => {
              setSecs(s => {
                if (s <= 1) { clearInterval(intervalRef.current); return 0; }
                return s - 1;
              });
            }, 1000);
            return () => clearInterval(intervalRef.current);
          });

          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px' }}>🗑️ <strong style={{ color: '#fff' }}>{game.nome}</strong> excluído</span>
              <button
                onClick={() => {
                  undone = true;
                  clearTimeout(timer);
                  pendingRef.current = null;
                  toast.dismiss(t.id);
                  toast.success('Exclusão cancelada!', { duration: 2000 });
                }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                }}>
                ↩ Desfazer ({secs}s)
              </button>
            </div>
          );
        };
        return <ToastContent />;
      },
      {
        duration: 5500,
        style: {
          background: '#1e1e2e',
          color: '#cdd6f4',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          padding: '12px 16px',
          maxWidth: '380px',
        },
      }
    );

    return { undo: () => { undone = true; clearTimeout(timer); toast.dismiss(toastId); } };
  }, []);

  return { deleteWithUndo };
}