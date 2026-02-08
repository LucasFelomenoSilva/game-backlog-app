import React, { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from 'react-hot-toast';
import { categoryNames } from "./data/categories"; 
import CategorySelector from "./components/CategorySelector";
import GameList from "./components/GameList";
import GameDetail from "./components/GameDetail";
import BottomNavigation from "./components/BottomNavigation";
import ProgressScreen from "./components/ProgressScreen";
import ProfileScreen from "./components/ProfileScreen";
import EnhancedAchievements from "./components/EnhancedAchievements";
import AddGameModal from "./components/AddGameModal"; 
import ReviewGameModal from "./components/ReviewGameModal"; 
import GameRecommender from "./components/GameRecommender"; 
import { Joystick, Sparkles, Gamepad2, Plus } from "lucide-react"; 
import imageCompression from "browser-image-compression";
import { DragDropContext } from '@hello-pangea/dnd';
import { auth, db, googleProvider } from "./firebase"; 
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div 
            key={i}
            className={`particle p-${(i % 3) + 1}`}
            style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: 0.3
            }}
        />
      ))}
    </div>
  );
};

const LOADING_TIPS = [
    "Carregando texturas...",
    "Spawnando NPCs...",
    "Is it dangerous to go alone? Take this app!",
    "Limpando o cartucho...",
    "Gerando mundos procedurais...",
    "A princesa está em outro castelo...",
    "Recarregando mana..."
];

const Confetti = () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const pieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {pieces.map(piece => (
          <div
            key={piece.id}
            className="absolute w-3 h-3 animate-[fall_3s_ease-in_forwards]"
            style={{
              left: piece.left,
              top: '-10px',
              backgroundColor: piece.color,
              animationDelay: piece.delay,
            }}
          />
        ))}
      </div>
    );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("categories"); 
  const [showConfetti, setShowConfetti] = useState(false);
  const [darkMode] = useState(true);

  const [gamesData, setGamesData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false); 
  const [gameToEdit, setGameToEdit] = useState(null); 
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); 
  const [gameToReview, setGameToReview] = useState(null); 
  const [isRecommenderOpen, setIsRecommenderOpen] = useState(false);
  const [draftGame, setDraftGame] = useState(null);

  const [totalFinishedGames, setTotalFinishedGames] = useState(0); 
  const [achievements, setAchievements] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [loadingTip, setLoadingTip] = useState(LOADING_TIPS[0]);

  const [konamiIndex, setKonamiIndex] = useState(0);
  const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            const nextIndex = konamiIndex + 1;
            if (nextIndex === konamiCode.length) {
                triggerConfetti();
                toast('🌟 GOD MODE ACTIVATED! 🌟', {
                    icon: '🎮',
                    style: { background: '#FFD700', color: '#000', fontWeight: 'bold' },
                    duration: 5000
                });
                setKonamiIndex(0);
            } else {
                setKonamiIndex(nextIndex);
            }
        } else {
            setKonamiIndex(0);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiIndex]);

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizcIGWi7eefTRAMUKfj+LZjHAY4ktfzznksBS');
    audio.volume = 0.3;
    audio.play().catch(() => {}); 
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    playNotificationSound();
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Player 1 Connected!'); 
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error('Erro ao conectar controle (Login).');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Player 1 Disconnected.');
    } catch (error) {
      toast.error('Erro ao fazer logout.');
    }
  };
  
  const handleProfileImageUpload = async (file) => {
    try {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 200, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result;
        setUser(prev => ({ ...prev, photoBase64: base64String }));
        if (user) {
          await updateDoc(doc(db, "users", user.uid), { photoBase64: base64String });
          toast.success('Avatar atualizado!');
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      toast.error('Erro ao atualizar avatar.');
    }
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
  }, [darkMode]);

  const calculateStats = useCallback((data) => {
     const finishedCount = data.filter(g => g.status === 'zerados').length;
     setTotalFinishedGames(finishedCount);
     
     setAchievements(prevAchievements => {
       const newAchievements = new Set(prevAchievements);
       let madeChange = false;
       if (finishedCount >= 1 && !newAchievements.has("first_game")) { newAchievements.add("first_game"); madeChange = true; }
       if (finishedCount >= 5 && !newAchievements.has("five_games")) { newAchievements.add("five_games"); madeChange = true; }
       if (madeChange) { triggerConfetti(); return Array.from(newAchievements); }
       return prevAchievements;
     });
  }, []);

  useEffect(() => {
    setLoadingTip(LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]);
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let firestoreData = {};
        if (userDocSnap.exists()) {
          firestoreData = userDocSnap.data();
        } else {
          const initialData = { gamesData: [], achievements: [], gameHistory: [] };
          await setDoc(userDocRef, initialData);
          firestoreData = initialData;
        }
        setUser({ ...currentUser, photoBase64: firestoreData.photoBase64 || null });
        
        let fetchedGamesData = firestoreData.gamesData || [];
        fetchedGamesData = fetchedGamesData.map(game => {
             if(game.status === 'a_zerar' || game.status === 'jogando') return { ...game, status: 'playing' };
             return game;
        });

        setGamesData(fetchedGamesData);
        setAchievements(firestoreData.achievements || []);
        setGameHistory(firestoreData.gameHistory || []);
        calculateStats(fetchedGamesData); 
      } else {
        setUser(null);
        setGamesData([]);
        setTotalFinishedGames(0);
        setAchievements([]);
        setGameHistory([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [calculateStats]);

  const saveDataToFirestore = useCallback(async (currentGamesData, currentAchievements, currentHistory) => {
    if (!user || loading) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
          gamesData: currentGamesData,
          achievements: currentAchievements,
          gameHistory: currentHistory,
          photoBase64: user.photoBase64 || null,
      });
    } catch (error) { console.error(error); }
  }, [user, loading]);
  
  useEffect(() => {
    if (loading || !user) return;
    const handler = setTimeout(() => saveDataToFirestore(gamesData, achievements, gameHistory), 1500);
    return () => clearTimeout(handler);
  }, [gamesData, achievements, gameHistory, saveDataToFirestore, loading, user]);

  const handleAddNewGame = (newGame) => {
      const gameWithId = { ...newGame, id: Date.now().toString() };
      setGamesData(prev => [...prev, gameWithId]);
      if (newGame.status === 'zerados') {
          setGameHistory(prev => [...prev, { game: newGame.nome, status: 'zerado', date: new Date().toISOString().split('T')[0] }]);
          triggerConfetti();
      }
      toast.success('Jogo salvo!');
      setIsAddGameModalOpen(false);
      setDraftGame(null);
  };

  const handleSelectRecommendation = (game) => {
    setDraftGame(game);        
    setIsRecommenderOpen(false); 
    setIsAddGameModalOpen(true); 
  };

  const handleEditGame = (updatedGame) => {
    const newGamesData = gamesData.map(game => game.id === updatedGame.id ? updatedGame : game);
    setGamesData(newGamesData);
    if (selectedGame && selectedGame.id === updatedGame.id) setSelectedGame(updatedGame);
    setGameToEdit(null); 
    toast.success('Jogo atualizado!');
  };
  
  const handleDeleteGame = async (gameId) => {
    const gameToDelete = gamesData.find(g => g.id === gameId);
    setGamesData(prev => prev.filter(game => game.id !== gameId));
    setGameHistory(prev => prev.filter(item => item.game !== gameToDelete?.nome));
    toast.success('Jogo removido!');
    setSelectedGame(null); 
  };

  const handleSaveGame = (gameData) => {
    if (gameToEdit) handleEditGame(gameData);
    else handleAddNewGame(gameData);
    setIsAddGameModalOpen(false); 
    setGameToEdit(null); 
  }
  
  const openEditModal = () => { setGameToEdit(selectedGame); setIsAddGameModalOpen(true); };
  const openReviewModal = (game) => { setGameToReview(game); setIsReviewModalOpen(true); };
  
  const handleCompleteGameFinish = (reviewData) => {
      if (!gameToReview) return;
      const updatedGame = {
          ...gameToReview,
          status: 'zerados',
          originalStatus: gameToReview.status, 
          rating: reviewData.rating,
          reviewText: reviewData.reviewText,
      };
      const newGamesData = gamesData.map(game => game.id === gameToReview.id ? updatedGame : game);
      setGamesData(newGamesData);
      calculateStats(newGamesData); 
      setSelectedGame(updatedGame); 
      setGameHistory(prev => [...prev, { game: updatedGame.nome, status: 'zerado', date: new Date().toISOString().split('T')[0] }]);
      triggerConfetti();
      setIsReviewModalOpen(false);
      setGameToReview(null);
  }

  const handleUpdateGameStatus = (gameId, newStatus, gameToUpdate = null) => {
    const gameToMap = gameToUpdate || gamesData.find(g => g.id === gameId);
    if (!gameToMap) return;
    const newGamesData = gamesData.map(game => game.id === gameId ? { ...gameToMap, status: newStatus } : game);
    setGamesData(newGamesData);
    calculateStats(newGamesData); 
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    handleUpdateGameStatus(draggableId, destination.droppableId);
  };
  
  const getCategoryProgress = useCallback((category) => {
    return gamesData.filter(g => g.status === category).length;
  }, [gamesData]);

  const groupedGames = gamesData.reduce((acc, game) => {
    const status = game.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(game);
    return acc;
  }, { playing: [], installed: [], backlog: [], zerados: [], desejados: [] }); 

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
          <ParticleBackground />
          <div className="text-center z-10 p-6 bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl">
            <Gamepad2 className="w-16 h-16 text-cyan-500 mx-auto mb-4 animate-bounce" />
            <div className="w-48 h-2 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                <div className="h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite]" style={{width: '50%'}}></div>
            </div>
            <p className="text-cyan-400 text-lg font-bold animate-pulse">{loadingTip}</p>
          </div>
        </div>
      );
    }
    
    if (!user) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
          <ParticleBackground />
          <div className="max-w-md w-full text-center z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl mb-6 shadow-[0_0_30px_rgba(6,182,212,0.6)]">
              <Joystick className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              Game Backlog
            </h1>
            <p className="text-gray-400 mb-8 text-lg">
              Sua jornada, seus troféus, sua coleção.
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-4 bg-white hover:bg-cyan-50 text-gray-900 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-3"
            >
              <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
              Start Game (Login)
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === "progress") {
      return <ProgressScreen gameHistory={gameHistory} gamesData={gamesData} totalFinishedGames={totalFinishedGames} />;
    }
    
    if (activeTab === "achievements") {
      return <EnhancedAchievements achievements={achievements} personalRecords={{}} />;
    }

    if (activeTab === "profile") {
      return (
        <ProfileScreen
          user={user}
          handleSignOut={handleSignOut}
          totalFinishedGames={totalFinishedGames}
          totalCategories={Object.keys(categoryNames).length}
          totalAchievements={achievements.length}
          handleProfileImageUpload={handleProfileImageUpload}
          gamesData={gamesData} // PASSANDO DADOS COMPLETOS PARA O DASHBOARD
          goBack={() => setActiveTab('categories')} // BOTÃO VOLTAR DO PERFIL
        />
      );
    }
    
    if (isReviewModalOpen && gameToReview) {
      return <ReviewGameModal game={gameToReview} onClose={() => { setIsReviewModalOpen(false); setGameToReview(null); }} onReviewSubmit={handleCompleteGameFinish} />;
    }

    if (isRecommenderOpen) {
      return <GameRecommender onClose={() => setIsRecommenderOpen(false)} onSelectGame={handleSelectRecommendation} />;
    }

    if (!selectedCategory && !selectedGame) {
      return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <CategorySelector 
              games={groupedGames}
              setSelectedCategory={setSelectedCategory} 
              setSelectedGame={setSelectedGame} 
              getCategoryProgress={getCategoryProgress}
              user={user}
              totalFinishedGames={totalFinishedGames}
              setIsAddGameModalOpen={setIsAddGameModalOpen} 
            />
        </DragDropContext>
      );
    }

    if (!selectedGame) {
      return <GameList selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} games={groupedGames} setSelectedGame={setSelectedGame} />;
    }

    return (
      <GameDetail
        selectedGame={selectedGame}
        setSelectedGame={setSelectedGame}
        handleUpdateGameStatus={handleUpdateGameStatus}
        handleDeleteGame={handleDeleteGame} 
        openEditModal={openEditModal} 
        openReviewModal={openReviewModal}
        triggerConfetti={triggerConfetti} // PASSANDO FUNÇÃO DE CONFETE
      />
    );
  };

  return (
    <div className="relative min-h-screen bg-gray-900">
      <ParticleBackground />
      <Toaster position="top-center" toastOptions={{
          style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' }
      }}/>
      {showConfetti && <Confetti />}
      
      <div className="relative z-10">
          {renderContent()}
      </div>

      {user && !selectedGame && !selectedCategory && activeTab === 'categories' && !isRecommenderOpen && (
        <button
            onClick={() => setIsRecommenderOpen(true)}
            className="fixed bottom-24 right-4 z-40 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg text-white hover:scale-110 transition-transform animate-bounce-slow border-2 border-white/20"
            title="Pedir recomendação à IA"
        >
            <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* [!] Botão de Adicionar Jogo - MOVIDO PARA TOP-RIGHT */}
      {user && !selectedGame && !selectedCategory && activeTab === 'categories' && !isReviewModalOpen && !isAddGameModalOpen && (
        <button
            onClick={() => { setIsAddGameModalOpen(true); setDraftGame(null); }}
            className="fixed top-6 right-6 z-40 p-3 bg-cyan-600 rounded-full shadow-xl text-white hover:bg-cyan-500 transition-transform hover:scale-110 border-2 border-white/20"
            title="Adicionar Novo Jogo"
        >
            <Plus className="w-6 h-6" />
        </button>
      )}

      {isAddGameModalOpen && (
        <AddGameModal
          onClose={() => { setIsAddGameModalOpen(false); setGameToEdit(null); setDraftGame(null); }}
          onSaveGame={handleSaveGame} 
          gameToEdit={gameToEdit} 
          initialData={draftGame} 
        />
      )}

      {user && !selectedGame && !isReviewModalOpen && !isRecommenderOpen && (
        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;