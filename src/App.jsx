// src/App.jsx

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { DragDropContext } from '@hello-pangea/dnd';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { useGamesState } from './hooks/useGamesState';
import { subscribeToSocialProfile } from './services/socialService';

import CategorySelector    from './components/CategorySelector';
import GameList            from './components/GameListModern';
import GameDetail          from './components/GameDetailModern';
import BottomNavigation    from './components/BottomNavigation';
import AddGameModal        from './components/AddGameModal';
import ReviewGameModal     from './components/ReviewGameModal';
import PublicProfilePage   from './features/profile/PublicProfilePage';
import LoginScreen         from './features/auth/LoginScreen';
import LoadingScreen       from './features/auth/LoadingScreen';
import ChatScreen          from './components/ChatScreen';
import FriendProfileScreen from './components/FriendProfileScreen';
import AIRecommendationsModal from './components/AIRecommendationsModal';

import {
  LazyProgressScreen, LazyProfileScreen, LazyEnhancedAchievements,
  LazyFriendsScreen, LazyWrappedScreen,
  LazyBackupRestore, LazyWeeklyMissions, LazySurpriseMe,
  LazyCollabList, LazyLevelUpOverlay,
} from './lazyComponents';

const isPublicRoute = window.location.pathname.startsWith('/u/');
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
const CONFETTI_COLORS = ['#f43f5e', '#22c55e', '#3b82f6', '#facc15', '#ec4899', '#06b6d4'];
const CONFETTI_PIECES = Array.from({ length: 50 }, (_, id) => ({
  id,
  left: `${(id * 47) % 100}%`,
  delay: `${(id % 10) * 0.05}s`,
  color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
}));

const ModalLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
  </div>
);

const Confetti = React.memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {CONFETTI_PIECES.map(p => (
        <div key={p.id} className="absolute w-3 h-3 animate-[fall_3s_ease-in_forwards]"
          style={{ left: p.left, top: '-10px', backgroundColor: p.color, animationDelay: p.delay }} />
      ))}
    </div>
  );
});

const pageTransitionVariants = {
  initial: { opacity: 0, x: -12, scale: 0.99 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 12, scale: 0.99 }
};

function AppInner() {
  const { theme: V } = useTheme();
  const { t } = useLanguage();
  const { user, loading, loadingTip, signOut, updateAvatar } = useAuth();
  const games = useGamesState(user);

  const [activeTab,          setActiveTab]          = useState('categories');
  const [showConfetti,       setShowConfetti]       = useState(false);
  const [socialProfile,      setSocialProfile]      = useState(null);
  const [chatOpen,           setChatOpen]           = useState(null);
  const [viewingFriend,      setViewingFriend]      = useState(null);
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [gameToEdit,         setGameToEdit]         = useState(null);
  const [isReviewModalOpen,  setIsReviewModalOpen]  = useState(false);
  const [gameToReview,       setGameToReview]       = useState(null);
  const [isBackupOpen,       setIsBackupOpen]       = useState(false);
  const [showWrapped,        setShowWrapped]        = useState(false);
  const [showMissions,       setShowMissions]       = useState(false);
  const [showSurprise,       setShowSurprise]       = useState(false);
  const [showCollab,         setShowCollab]         = useState(false);
  const [showAIModal,        setShowAIModal]        = useState(false);
  const [levelUpData,        setLevelUpData]        = useState(null);
  const [konamiIndex,        setKonamiIndex]        = useState(0);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    const unsub = subscribeToSocialProfile(user.uid, setSocialProfile);
    return () => unsub();
  }, [user]);

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

  const handleCompleteFinish = useCallback((reviewData) => {
    games.handleCompleteGameFinish(gameToReview, reviewData, triggerConfetti);
    setIsReviewModalOpen(false); setGameToReview(null);
  }, [gameToReview, games, triggerConfetti]);

  const handleBoardDragEnd = useCallback((result) => {
    const isNewCompletion = result.destination?.droppableId === 'zerados'
      && result.source?.droppableId !== 'zerados';

    if (isNewCompletion) {
      const game = games.gamesData.find(item => String(item.id) === String(result.draggableId));
      if (game) {
        openReviewModal(game);
        return;
      }
    }

    games.handleDragEnd(result);
  }, [games, openReviewModal]);

  if (isPublicRoute) return <PublicProfilePage />;

  if (chatOpen) return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }} />
      <ChatScreen currentUser={user} friendUid={chatOpen.uid} friendProfile={chatOpen.profile} onBack={() => setChatOpen(null)} />
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
      case 'friends':      return <Suspense fallback={<ModalLoader />}><LazyFriendsScreen currentUser={{ ...user, photoURL: user.photoBase64 || user.photoURL }} socialProfile={socialProfile} onOpenChat={(uid, p) => setChatOpen({ uid, profile: p })} /></Suspense>;
      case 'profile':      return <Suspense fallback={<ModalLoader />}><LazyProfileScreen user={user} totalFinishedGames={games.totalFinishedGames} gamesData={games.gamesData} achievements={games.achievements} goBack={() => setActiveTab('categories')} onOpenBackup={() => setIsBackupOpen(true)} handleSignOut={signOut} handleProfileImageUpload={updateAvatar} /></Suspense>;
      default:             return null;
    }
  };

  const tabContent = renderTab();
  if (tabContent) return (
    <div style={{ background: V.bg }} className="min-h-screen overflow-x-hidden lg:pl-64">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }} />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.18 }}
          style={{ width: '100%' }}
        >
          {tabContent}
        </motion.div>
      </AnimatePresence>
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} friendRequestCount={socialProfile?.friendRequests?.length || 0} user={user} totalFinishedGames={games.totalFinishedGames} />
    </div>
  );

  const renderMain = () => {
    if (isReviewModalOpen && gameToReview)
      return <ReviewGameModal game={gameToReview} onClose={() => { setIsReviewModalOpen(false); setGameToReview(null); }} onReviewSubmit={handleCompleteFinish} />;
    if (games.selectedGame)
      return <GameDetail selectedGame={games.selectedGame} setSelectedGame={games.setSelectedGame} handleUpdateGameStatus={games.handleUpdateGameStatus} handleDeleteGame={games.handleDeleteGame} openEditModal={openEditModal} openReviewModal={openReviewModal} triggerConfetti={triggerConfetti} />;
    if (games.selectedCategory)
      return <GameList selectedCategory={games.selectedCategory} setSelectedCategory={games.setSelectedCategory} games={games.groupedGames} setSelectedGame={games.setSelectedGame} setGamesData={games.setGamesData} />;
    return (
      <DragDropContext onDragEnd={handleBoardDragEnd}>
        <CategorySelector games={games.groupedGames} setSelectedCategory={games.setSelectedCategory} setSelectedGame={games.setSelectedGame} getCategoryProgress={games.getCategoryProgress} user={user} totalFinishedGames={games.totalFinishedGames} setIsAddGameModalOpen={setIsAddGameModalOpen} openReviewModal={openReviewModal} gamesData={games.gamesData} />
      </DragDropContext>
    );
  };

  const mainKey = isReviewModalOpen && gameToReview
    ? 'review'
    : games.selectedGame
    ? 'detail-' + games.selectedGame.id
    : games.selectedCategory
    ? 'list-' + games.selectedCategory
    : 'selector';

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${!games.selectedGame && !isReviewModalOpen ? 'lg:pl-64' : ''}`} style={{ background: V.bg }}>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' } }} />
      {showConfetti && <Confetti />}
      {showWrapped  && <Suspense fallback={<ModalLoader />}><LazyWrappedScreen  gamesData={games.gamesData} onClose={() => setShowWrapped(false)} /></Suspense>}
      {showMissions && <Suspense fallback={<ModalLoader />}><LazyWeeklyMissions gamesData={games.gamesData} onClose={() => setShowMissions(false)} /></Suspense>}
      {showSurprise && <Suspense fallback={<ModalLoader />}><LazySurpriseMe     gamesData={games.gamesData} onClose={() => setShowSurprise(false)} /></Suspense>}
      {showCollab   && <Suspense fallback={<ModalLoader />}><LazyCollabList     currentUser={user}          onClose={() => setShowCollab(false)} /></Suspense>}
      {levelUpData  && <Suspense fallback={null}><LazyLevelUpOverlay level={levelUpData.level} onDone={() => setLevelUpData(null)} /></Suspense>}
      <div className="relative z-10 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mainKey}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.18 }}
            style={{ width: '100%' }}
          >
            {renderMain()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prévia da futura recomendação por IA */}
      {!games.selectedGame && !games.selectedCategory && activeTab === 'categories' && !isAddGameModalOpen && (
        <button
          onClick={() => setShowAIModal(true)}
          className="fixed bottom-24 right-6 z-30 flex items-center gap-2 rounded-full border-2 border-purple-400/30 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-white shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
          title={t('ai.title')}
          aria-label={t('ai.title')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
          <span className="text-xs font-black uppercase tracking-wider">{t('ai.badge_button')}</span>
        </button>
      )}

      {showAIModal && (
        <AIRecommendationsModal onClose={() => setShowAIModal(false)} />
      )}

      {isAddGameModalOpen && (
        <AddGameModal onClose={() => { setIsAddGameModalOpen(false); setGameToEdit(null); }} onSaveGame={handleSaveGame} gameToEdit={gameToEdit} gamesData={games.gamesData} />
      )}
      {isBackupOpen && (
        <Suspense fallback={<ModalLoader />}>
          <LazyBackupRestore gamesData={games.gamesData} achievements={games.achievements} gameHistory={games.gameHistory} onRestoreData={games.handleRestoreData} onClose={() => setIsBackupOpen(false)} />
        </Suspense>
      )}
      {!games.selectedGame && !isReviewModalOpen && (
        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} friendRequestCount={socialProfile?.friendRequests?.length || 0} user={user} totalFinishedGames={games.totalFinishedGames} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppInner />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
