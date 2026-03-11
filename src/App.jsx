// src/App.jsx

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { DragDropContext } from '@hello-pangea/dnd';
import { Loader2 } from 'lucide-react';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useGamesState } from './hooks/useGamesState';
import { subscribeToSocialProfile } from './services/socialService';

import CategorySelector    from './components/CategorySelector';
import GameList            from './components/GameList';
import GameDetail          from './components/GameDetail';
import BottomNavigation    from './components/BottomNavigation';
import AddGameModal        from './components/AddGameModal';
import ReviewGameModal     from './components/ReviewGameModal';
import PublicProfilePage   from './features/profile/PublicProfilePage';
import LoginScreen         from './features/auth/LoginScreen';
import LoadingScreen       from './features/auth/LoadingScreen';
import ChatScreen          from './components/ChatScreen';
import FriendProfileScreen from './components/FriendProfileScreen';

import {
  LazyProgressScreen, LazyProfileScreen, LazyEnhancedAchievements,
  LazyFriendsScreen, LazyWrappedScreen, LazyGameRecommender,
  LazyBackupRestore, LazyWeeklyMissions, LazySurpriseMe,
  LazyCollabList, LazyLevelUpOverlay,
} from './lazyComponents';

const isPublicRoute = window.location.pathname.startsWith('/u/');

const ModalLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
  </div>
);

const Confetti = React.memo(() => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  const pieces = useMemo(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      id:    i,
      left:  `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
    })), []
  );
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map(p => (
        <div key={p.id} className="absolute w-3 h-3 animate-[fall_3s_ease-in_forwards]"
          style={{ left: p.left, top: '-10px', backgroundColor: p.color, animationDelay: p.delay }} />
      ))}
    </div>
  );
});

function AppInner() {
  const { theme: V } = useTheme();
  const { user, loading, loadingTip, signOut, updateAvatar } = useAuth();
  const games = useGamesState(user);

  const [activeTab,          setActiveTab]          = useState('categories');
  const [showConfetti,       setShowConfetti]       = useState(false);
  const [socialProfile,      setSocialProfile]      = useState(null);
  const [chatOpen,           setChatOpen]           = useState(null);
  const [viewingFriend,      setViewingFriend]      = useState(null);
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [gameToEdit,         setGameToEdit]         = useState(null);
  const [draftGame,          setDraftGame]          = useState(null);
  const [isReviewModalOpen,  setIsReviewModalOpen]  = useState(false);
  const [gameToReview,       setGameToReview]       = useState(null);
  const [isRecommenderOpen,  setIsRecommenderOpen]  = useState(false);
  const [isBackupOpen,       setIsBackupOpen]       = useState(false);
  const [showWrapped,        setShowWrapped]        = useState(false);
  const [showMissions,       setShowMissions]       = useState(false);
  const [showSurprise,       setShowSurprise]       = useState(false);
  const [showCollab,         setShowCollab]         = useState(false);
  const [levelUpData,        setLevelUpData]        = useState(null);
  const [konamiIndex,        setKonamiIndex]        = useState(0);

  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  useEffect(() => {
    if (!user) { setSocialProfile(null); return; }
    const unsub = subscribeToSocialProfile(user.uid, setSocialProfile);
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === KONAMI[konamiIndex]) {
        const next = konamiIndex + 1;
        if (next === KONAMI.length) { triggerConfetti(); setKonamiIndex(0); }
        else setKonamiIndex(next);
      } else { setKonamiIndex(0); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [konamiIndex, triggerConfetti]);

  const openEditModal   = useCallback(() => { setGameToEdit(games.selectedGame); setIsAddGameModalOpen(true); }, [games.selectedGame]);
  const openReviewModal = useCallback((game) => { setGameToReview(game); setIsReviewModalOpen(true); }, []);

  const handleSaveGame = useCallback((gameData) => {
    if (gameToEdit) games.handleEditGame(gameData);
    else            games.handleAddNewGame(gameData);
    setIsAddGameModalOpen(false);
    setGameToEdit(null);
  }, [gameToEdit, games]);

  const handleSelectRecommendation = useCallback((game) => {
    setDraftGame(game); setIsRecommenderOpen(false); setIsAddGameModalOpen(true);
  }, []);

  const handleCompleteFinish = useCallback((reviewData) => {
    games.handleCompleteGameFinish(gameToReview, reviewData, triggerConfetti);
    setIsReviewModalOpen(false); setGameToReview(null);
  }, [gameToReview, games, triggerConfetti]);

  if (isPublicRoute) return <PublicProfilePage />;

  if (chatOpen) return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }} />
      <ChatScreen currentUser={{ ...user, photoURL: user?.photoBase64 || user?.photoURL }} friendUid={chatOpen.uid} friendProfile={chatOpen.profile} onBack={() => setChatOpen(null)} />
    </>
  );

  if (viewingFriend) return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }} />
      <FriendProfileScreen friendUid={viewingFriend.uid} friendProfile={viewingFriend.profile} onBack={() => setViewingFriend(null)} onOpenChat={(uid, profile) => setChatOpen({ uid, profile })} />
    </>
  );

  if (loading) return <LoadingScreen tip={loadingTip} />;
  if (!user)   return <LoginScreen />;

  const renderTab = () => {
    switch (activeTab) {
      case 'progress':     return <Suspense fallback={<ModalLoader />}><LazyProgressScreen gameHistory={games.gameHistory} gamesData={games.gamesData} totalFinishedGames={games.totalFinishedGames} /></Suspense>;
      case 'achievements': return <Suspense fallback={<ModalLoader />}><LazyEnhancedAchievements achievements={games.achievements} gamesData={games.gamesData} /></Suspense>;
      case 'friends':      return <Suspense fallback={<ModalLoader />}><LazyFriendsScreen currentUser={{ ...user, photoURL: user.photoBase64 || user.photoURL }} socialProfile={socialProfile} onOpenChat={(uid, p) => setChatOpen({ uid, profile: p })} onViewFriendProfile={(uid, p) => setViewingFriend({ uid, profile: p })} /></Suspense>;
      case 'profile':      return <Suspense fallback={<ModalLoader />}><LazyProfileScreen user={user} totalFinishedGames={games.totalFinishedGames} gamesData={games.gamesData} achievements={games.achievements} goBack={() => setActiveTab('categories')} onOpenBackup={() => setIsBackupOpen(true)} handleSignOut={signOut} handleProfileImageUpload={updateAvatar} /></Suspense>;
      default:             return null;
    }
  };

  const tabContent = renderTab();
  if (tabContent) return (
    <div style={{ background: V.bg }} className="min-h-screen">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }} />
      {tabContent}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} friendRequestCount={socialProfile?.friendRequests?.length || 0} />
    </div>
  );

  const renderMain = () => {
    if (isReviewModalOpen && gameToReview)
      return <ReviewGameModal game={gameToReview} onClose={() => { setIsReviewModalOpen(false); setGameToReview(null); }} onReviewSubmit={handleCompleteFinish} />;
    if (isRecommenderOpen)
      return <Suspense fallback={<ModalLoader />}><LazyGameRecommender onClose={() => setIsRecommenderOpen(false)} onSelectGame={handleSelectRecommendation} /></Suspense>;
    if (games.selectedGame)
      return <GameDetail selectedGame={games.selectedGame} setSelectedGame={games.setSelectedGame} handleUpdateGameStatus={games.handleUpdateGameStatus} handleDeleteGame={games.handleDeleteGame} openEditModal={openEditModal} openReviewModal={openReviewModal} triggerConfetti={triggerConfetti} />;
    if (games.selectedCategory)
      return <GameList selectedCategory={games.selectedCategory} setSelectedCategory={games.setSelectedCategory} games={games.groupedGames} setSelectedGame={games.setSelectedGame} gamesData={games.gamesData} setGamesData={() => {}} />;
    return (
      <DragDropContext onDragEnd={games.handleDragEnd}>
        <CategorySelector games={games.groupedGames} setSelectedCategory={games.setSelectedCategory} setSelectedGame={games.setSelectedGame} getCategoryProgress={games.getCategoryProgress} user={user} totalFinishedGames={games.totalFinishedGames} setIsAddGameModalOpen={setIsAddGameModalOpen} openReviewModal={openReviewModal} gamesData={games.gamesData} />
      </DragDropContext>
    );
  };

  return (
    <div className="relative min-h-screen bg-gray-900">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }} />
      {showConfetti && <Confetti />}
      {showWrapped  && <Suspense fallback={<ModalLoader />}><LazyWrappedScreen  gamesData={games.gamesData} onClose={() => setShowWrapped(false)} /></Suspense>}
      {showMissions && <Suspense fallback={<ModalLoader />}><LazyWeeklyMissions gamesData={games.gamesData} onClose={() => setShowMissions(false)} /></Suspense>}
      {showSurprise && <Suspense fallback={<ModalLoader />}><LazySurpriseMe     gamesData={games.gamesData} onClose={() => setShowSurprise(false)} /></Suspense>}
      {showCollab   && <Suspense fallback={<ModalLoader />}><LazyCollabList     currentUser={user}          onClose={() => setShowCollab(false)} /></Suspense>}
      {levelUpData  && <Suspense fallback={null}><LazyLevelUpOverlay level={levelUpData.level} onDone={() => setLevelUpData(null)} /></Suspense>}
      <div className="relative z-10">{renderMain()}</div>
      {isAddGameModalOpen && (
        <AddGameModal onClose={() => { setIsAddGameModalOpen(false); setGameToEdit(null); setDraftGame(null); }} onSaveGame={handleSaveGame} gameToEdit={gameToEdit} initialData={draftGame} />
      )}
      {isBackupOpen && (
        <Suspense fallback={<ModalLoader />}>
          <LazyBackupRestore gamesData={games.gamesData} achievements={games.achievements} gameHistory={games.gameHistory} onRestoreData={games.handleRestoreData} onClose={() => setIsBackupOpen(false)} />
        </Suspense>
      )}
      {!games.selectedGame && !isReviewModalOpen && (
        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} friendRequestCount={socialProfile?.friendRequests?.length || 0} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}
