// src/hooks/useGamesState.js
// Estado e lógica dos jogos. Observa user e firestoreData do AuthContext
// para carregar dados automaticamente quando o utilizador logar.

import { createElement, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { saveUserData } from '../services/gameService';
import { useUndoDelete } from './useUndoDelete.jsx';

export function useGamesState(user) {
  const { firestoreData } = useAuth();
  const { deleteWithUndo } = useUndoDelete();
  const userId = user?.uid || null;

  const [gamesData,          setGamesData]          = useState([]);
  const [achievements,       setAchievements]       = useState([]);
  const [gameHistory,        setGameHistory]        = useState([]);
  const [totalFinishedGames, setTotalFinishedGames] = useState(0);
  const [selectedCategory,   setSelectedCategory]   = useState(null);
  const [selectedGame,       setSelectedGame]       = useState(null);

  const [hydratedUserId, setHydratedUserId] = useState(null);
  const saveSequence = useRef(0);
  const pendingSaveMessage = useRef(null);

  // ── Carrega dados quando firestoreData muda (login/logout) ─────────────────
  useEffect(() => {
    if (!userId || !firestoreData) {
      // Logout
      setGamesData([]);
      setAchievements([]);
      setGameHistory([]);
      setTotalFinishedGames(0);
      setHydratedUserId(null);
      saveSequence.current += 1;
      return;
    }

    let games   = firestoreData.gamesData    || [];
    const hist  = firestoreData.gameHistory  || [];
    const achs  = firestoreData.achievements || [];

    // Migração de status legados
    const historyMap = {};
    hist.forEach(item => {
      if (item.status === 'zerado' && item.date) historyMap[item.game] = item.date;
    });

    games = games.map(game => {
      if (game.status === 'a_zerar' || game.status === 'jogando') return { ...game, status: 'playing' };
      if (game.status === 'zerados' && !game.finishedDate && historyMap[game.nome]) {
        return { ...game, finishedDate: new Date(historyMap[game.nome] + 'T12:00:00').toISOString() };
      }
      return game;
    });

    setGamesData(games);
    setAchievements(achs);
    setGameHistory(hist);
    setTotalFinishedGames(games.filter(g => g.status === 'zerados').length);

    // Este estado só muda no mesmo lote da hidratação acima. Assim o efeito de
    // persistência nunca consegue salvar o estado vazio inicial sobre a nuvem.
    setHydratedUserId(userId);
  }, [firestoreData, userId]);

  // ── Auto-save imediato ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId || hydratedUserId !== userId) return;

    const sequence = ++saveSequence.current;
    const successMessage = pendingSaveMessage.current;

    saveUserData(userId, {
      gamesData,
      achievements,
      gameHistory,
      photoBase64: user?.photoBase64 || null,
      photoURL: user?.photoURL || null,
    }).then(() => {
      if (sequence !== saveSequence.current) return;
      if (successMessage) {
        pendingSaveMessage.current = null;
        toast.success(successMessage);
      }
    }).catch(err => {
      console.error('Erro ao salvar:', err);
      if (sequence !== saveSequence.current) return;
      toast.error('Não foi possível salvar na nuvem. Mantenha o app aberto e tente novamente.');
    });
  }, [gamesData, achievements, gameHistory, hydratedUserId, userId, user?.photoBase64, user?.photoURL]);

  // ── calculateStats ─────────────────────────────────────────────────────────
  const calculateStats = useCallback((data) => {
    const count = data.filter(g => g.status === 'zerados').length;
    setTotalFinishedGames(count);
    setAchievements(prev => {
      const set = new Set(prev);
      let changed = false;
      if (count >= 1 && !set.has('first_game')) { set.add('first_game'); changed = true; }
      if (count >= 5 && !set.has('five_games')) { set.add('five_games'); changed = true; }
      return changed ? Array.from(set) : prev;
    });
  }, []);

  // ── groupedGames ───────────────────────────────────────────────────────────
  const groupedGames = useMemo(() => {
    const grouped = gamesData.reduce((acc, game, originalIndex) => {
      if (!acc[game.status]) acc[game.status] = [];
      acc[game.status].push({ ...game, __originalIndex: originalIndex });
      return acc;
    }, { playing: [], installed: [], backlog: [], zerados: [], desejados: [] });

    Object.keys(grouped).forEach((status) => {
      grouped[status] = grouped[status]
        .sort((a, b) => (a.sortOrder ?? a.__originalIndex) - (b.sortOrder ?? b.__originalIndex))
        .map(({ __originalIndex, ...game }) => game);
    });

    return grouped;
  }, [gamesData]);

  const getCategoryProgress = useCallback(
    (cat) => gamesData.filter(g => g.status === cat).length,
    [gamesData]
  );

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleAddNewGame = useCallback((newGame) => {
    const game = { ...newGame, id: Date.now().toString() };
    if (game.status === 'zerados' && !game.finishedDate) game.finishedDate = new Date().toISOString();
    pendingSaveMessage.current = 'Jogo salvo na nuvem!';
    setGamesData(prev => { const next = [...prev, game]; calculateStats(next); return next; });
    if (newGame.status === 'zerados') {
      setGameHistory(prev => [...prev, { game: newGame.nome, status: 'zerado', date: new Date().toISOString().split('T')[0] }]);
    }
  }, [calculateStats]);

  const handleEditGame = useCallback((updated) => {
    if (updated.status === 'zerados' && !updated.finishedDate) updated.finishedDate = new Date().toISOString();
    pendingSaveMessage.current = 'Jogo atualizado na nuvem!';
    setGamesData(prev => { const next = prev.map(g => g.id === updated.id ? updated : g); calculateStats(next); return next; });
    setSelectedGame(prev => prev?.id === updated.id ? updated : prev);
  }, [calculateStats]);

  const handleDeleteGame = useCallback((gameId) => {
    const game = gamesData.find(g => g.id === gameId);
    if (!game || !user) return;
    setSelectedGame(null);
    deleteWithUndo(game, user.uid, (id) => {
      setGamesData(prev => prev.filter(g => g.id !== id));
      setGameHistory(prev => prev.filter(h => h.game !== game.nome));
    });
  }, [gamesData, user, deleteWithUndo]);

  const handleUpdateGameStatus = useCallback((gameId, newStatus, override = null) => {
    const base = override || gamesData.find(g => g.id === gameId);
    if (!base) return;
    const updated = { ...base, status: newStatus };
    if (newStatus === 'zerados' && !updated.finishedDate) updated.finishedDate = new Date().toISOString();
    setGamesData(prev => { const next = prev.map(g => g.id === gameId ? updated : g); calculateStats(next); return next; });
  }, [gamesData, calculateStats]);

  const handleCompleteGameFinish = useCallback((gameToReview, reviewData, onConfetti) => {
    if (!gameToReview) return;
    const today = new Date().toISOString();
    const finishedDate = reviewData.finishedDate || today;
    const updated = { ...gameToReview, status: 'zerados', originalStatus: gameToReview.status, ...reviewData, finishedDate };
    setGamesData(prev => { const next = prev.map(g => g.id === gameToReview.id ? updated : g); calculateStats(next); return next; });
    setSelectedGame(updated);
    setGameHistory(prev => [...prev, { game: updated.nome, status: 'zerado', date: finishedDate.split('T')[0] }]);
    onConfetti?.();
  }, [calculateStats]);

  const handleRestoreData = useCallback(({ gamesData: g, achievements: a, gameHistory: h }) => {
    setGamesData(g); setAchievements(a); setGameHistory(h); calculateStats(g);
  }, [calculateStats]);

  const handleDragEnd = useCallback((result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceStatus = source.droppableId;
    const destinationStatus = destination.droppableId;

    const previousData = gamesData;
    const sortCategory = status => previousData
      .map((game, originalIndex) => ({ game, originalIndex }))
      .filter(({ game }) => game.status === status)
      .sort((a, b) => (a.game.sortOrder ?? a.originalIndex) - (b.game.sortOrder ?? b.originalIndex))
      .map(({ game }) => game);

    const sourceItems = sortCategory(sourceStatus);
    const destinationItems = sourceStatus === destinationStatus
      ? sourceItems
      : sortCategory(destinationStatus);
    const sourceIndex = sourceItems.findIndex(game => String(game.id) === String(draggableId));

    if (sourceIndex < 0) return;

    const [draggedGame] = sourceItems.splice(sourceIndex, 1);
    const movedGame = {
      ...draggedGame,
      status: destinationStatus,
      ...(destinationStatus === 'zerados' && !draggedGame.finishedDate
        ? { finishedDate: new Date().toISOString() }
        : {}),
    };

    destinationItems.splice(destination.index, 0, movedGame);

    const reordered = new Map();
    sourceItems.forEach((game, index) => reordered.set(String(game.id), { ...game, sortOrder: index }));
    destinationItems.forEach((game, index) => reordered.set(String(game.id), {
      ...game,
      status: destinationStatus,
      sortOrder: index,
    }));

    const next = previousData.map(game => reordered.get(String(game.id)) || game);
    setGamesData(next);
    calculateStats(next);

    const message = sourceStatus === destinationStatus
      ? `Ordem de ${draggedGame.nome} atualizada.`
      : `${draggedGame.nome} foi movido.`;
    toast(t => createElement('div', {
      style: { display: 'flex', alignItems: 'center', gap: '12px' },
    },
    createElement('span', null, message),
    createElement('button', {
      type: 'button',
      onClick: () => {
        setGamesData(previousData);
        calculateStats(previousData);
        toast.dismiss(t.id);
      },
      style: {
        border: '0',
        borderRadius: '10px',
        padding: '7px 10px',
        background: 'rgba(139,92,246,.18)',
        color: '#c4b5fd',
        fontWeight: 800,
        cursor: 'pointer',
      },
    }, 'Desfazer')), { duration: 6000 });
  }, [calculateStats, gamesData]);

  return {
    gamesData, groupedGames, achievements, gameHistory, totalFinishedGames,
    selectedCategory, selectedGame,
    setSelectedCategory, setSelectedGame,
    handleAddNewGame, handleEditGame, handleDeleteGame,
    handleUpdateGameStatus, handleCompleteGameFinish,
    handleRestoreData, handleDragEnd, getCategoryProgress,
    setGamesData,
  };
}
