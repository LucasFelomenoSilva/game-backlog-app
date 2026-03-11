// src/hooks/useGamesState.js
// Estado e lógica dos jogos. Observa user e firestoreData do AuthContext
// para carregar dados automaticamente quando o utilizador logar.

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { saveUserData } from '../services/gameService';
import { useUndoDelete } from './useUndoDelete.jsx';

export function useGamesState(user) {
  const { firestoreData } = useAuth();
  const { deleteWithUndo } = useUndoDelete();

  const [gamesData,          setGamesData]          = useState([]);
  const [achievements,       setAchievements]       = useState([]);
  const [gameHistory,        setGameHistory]        = useState([]);
  const [totalFinishedGames, setTotalFinishedGames] = useState(0);
  const [selectedCategory,   setSelectedCategory]   = useState(null);
  const [selectedGame,       setSelectedGame]       = useState(null);

  const initialLoadDone = useRef(false);

  // ── Carrega dados quando firestoreData muda (login/logout) ─────────────────
  useEffect(() => {
    if (!firestoreData) {
      // Logout
      setGamesData([]);
      setAchievements([]);
      setGameHistory([]);
      setTotalFinishedGames(0);
      initialLoadDone.current = false;
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

    setTimeout(() => { initialLoadDone.current = true; }, 100);
  }, [firestoreData]);

  // ── Auto-save com debounce ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !initialLoadDone.current) return;
    const handler = setTimeout(() => {
      saveUserData(user.uid, { gamesData, achievements, gameHistory, photoBase64: user.photoBase64 || null })
        .catch(err => console.error('Erro ao salvar:', err));
    }, 1500);
    return () => clearTimeout(handler);
  }, [gamesData, achievements, gameHistory, user]);

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
  const groupedGames = useMemo(() =>
    gamesData.reduce((acc, game) => {
      if (!acc[game.status]) acc[game.status] = [];
      acc[game.status].push(game);
      return acc;
    }, { playing: [], installed: [], backlog: [], zerados: [], desejados: [] }),
  [gamesData]);

  const getCategoryProgress = useCallback(
    (cat) => gamesData.filter(g => g.status === cat).length,
    [gamesData]
  );

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleAddNewGame = useCallback((newGame) => {
    const game = { ...newGame, id: Date.now().toString() };
    if (game.status === 'zerados' && !game.finishedDate) game.finishedDate = new Date().toISOString();
    setGamesData(prev => { const next = [...prev, game]; calculateStats(next); return next; });
    if (newGame.status === 'zerados') {
      setGameHistory(prev => [...prev, { game: newGame.nome, status: 'zerado', date: new Date().toISOString().split('T')[0] }]);
    }
    toast.success('Jogo salvo!');
  }, [calculateStats]);

  const handleEditGame = useCallback((updated) => {
    if (updated.status === 'zerados' && !updated.finishedDate) updated.finishedDate = new Date().toISOString();
    setGamesData(prev => { const next = prev.map(g => g.id === updated.id ? updated : g); calculateStats(next); return next; });
    setSelectedGame(prev => prev?.id === updated.id ? updated : prev);
    toast.success('Jogo atualizado!');
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
    const updated = { ...gameToReview, status: 'zerados', originalStatus: gameToReview.status, ...reviewData, finishedDate: today };
    setGamesData(prev => { const next = prev.map(g => g.id === gameToReview.id ? updated : g); calculateStats(next); return next; });
    setSelectedGame(updated);
    setGameHistory(prev => [...prev, { game: updated.nome, status: 'zerado', date: today.split('T')[0] }]);
    onConfetti?.();
  }, [calculateStats]);

  const handleRestoreData = useCallback(({ gamesData: g, achievements: a, gameHistory: h }) => {
    setGamesData(g); setAchievements(a); setGameHistory(h); calculateStats(g);
  }, [calculateStats]);

  const handleDragEnd = useCallback((result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    handleUpdateGameStatus(draggableId, destination.droppableId);
  }, [handleUpdateGameStatus]);

  return {
    gamesData, groupedGames, achievements, gameHistory, totalFinishedGames,
    selectedCategory, selectedGame,
    setSelectedCategory, setSelectedGame,
    handleAddNewGame, handleEditGame, handleDeleteGame,
    handleUpdateGameStatus, handleCompleteGameFinish,
    handleRestoreData, handleDragEnd, getCategoryProgress,
  };
}
