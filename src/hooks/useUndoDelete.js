// src/hooks/useUndoDelete.js
//
// CORREÇÃO DE BUG: o original tentava deleteDoc em users/{uid}/games/{id}
// mas os dados ficam em users/{uid}.gamesData (array no documento raiz).
// A deleção real é feita pelo callback onDeleted → setGamesData no useGamesState.
// Aqui apenas gerenciamos o timer e o toast de "desfazer".

import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export function useUndoDelete() {
  const pendingRef = useRef(null);

  const deleteWithUndo = useCallback((game, _userId, onDeleted) => {
    // Se havia um delete pendente, executa imediatamente antes de iniciar novo
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timer);
      pendingRef.current.execute();
    }

    let undone  = false;
    let toastId;

    const execute = () => {
      if (undone) return;
      // A deleção real acontece aqui via callback — o save automático
      // do useGamesState persiste a remoção no Firestore em 1.5s.
      onDeleted?.(game.id);
      pendingRef.current = null;
    };

    const timer = setTimeout(execute, 5000);
    pendingRef.current = { timer, execute };

    const ToastContent = () => {
      const [secs, setSecs] = useState(5);
      const intervalRef = useRef(null);

      useEffect(() => {
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
          <span style={{ fontSize: '14px' }}>
            🗑️ <strong style={{ color: '#fff' }}>{game.nome}</strong> excluído
          </span>
          <button
            onClick={() => {
              undone = true;
              clearTimeout(timer);
              pendingRef.current = null;
              toast.dismiss(toastId);
              toast.success('Exclusão cancelada!', { duration: 2000 });
            }}
            style={{
              background:   'rgba(255,255,255,0.15)',
              border:       '1px solid rgba(255,255,255,0.25)',
              color:        '#fff',
              padding:      '4px 10px',
              borderRadius: '8px',
              cursor:       'pointer',
              fontSize:     '12px',
              fontWeight:   'bold',
              whiteSpace:   'nowrap',
            }}
          >
            ↩ Desfazer ({secs}s)
          </button>
        </div>
      );
    };

    toastId = toast(
      () => <ToastContent />,
      {
        duration: 5500,
        style: {
          background:   '#1e1e2e',
          color:        '#cdd6f4',
          border:       '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          padding:      '12px 16px',
          maxWidth:     '380px',
        },
      }
    );

    return {
      undo: () => {
        undone = true;
        clearTimeout(timer);
        toast.dismiss(toastId);
      },
    };
  }, []);

  return { deleteWithUndo };
}
