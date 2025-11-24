// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from 'react-hot-toast';
import { categoryNames, categoryColors, categoryIcons } from "./data/categories"; 
import CategorySelector from "./components/CategorySelector";
import GameList from "./components/GameList";
import GameDetail from "./components/GameDetail";
import BottomNavigation from "./components/BottomNavigation";
import ProgressScreen from "./components/ProgressScreen";
import ProfileScreen from "./components/ProfileScreen";
import EnhancedAchievements from "./components/EnhancedAchievements";
import AddGameModal from "./components/AddGameModal"; 
import ReviewGameModal from "./components/ReviewGameModal"; // NOVO IMPORT
import GeminiQuestGenerator from "./components/GeminiQuestGenerator"; 
import { Joystick } from "lucide-react";
import imageCompression from "browser-image-compression";

// Imports do Firebase
import { auth, db, googleProvider } from "./firebase"; 
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Componente de Confetti
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
  // Estados de Autenticação, UI e DarkMode
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("categories"); 
  const [showConfetti, setShowConfetti] = useState(false);
  const [darkMode] = useState(true);

  // Estados de Jogo
  const [gamesData, setGamesData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false); 
  const [gameToEdit, setGameToEdit] = useState(null); 
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // NOVO ESTADO
  const [gameToReview, setGameToReview] = useState(null); // NOVO ESTADO
  
  // Stats e Histórico
  const [totalFinishedGames, setTotalFinishedGames] = useState(0); 
  const [achievements, setAchievements] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);

  // Função para reproduzir som de notificação
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizcIGWi7eefTRAMUKfj+LZjHAY4ktfzznksBS');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignora erro se o navegador bloquear
  };

  // Função para mostrar confetti
  const triggerConfetti = () => {
    setShowConfetti(true);
    playNotificationSound();
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Funções de Autenticação (Mantidas)
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error('Erro ao fazer login. Tente novamente.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error("Erro no logout:", error);
      toast.error('Erro ao fazer logout.');
    }
  };

  const handleProfileImageUpload = async (file) => {
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 200,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result;
        setUser(prev => ({ ...prev, photoBase64: base64String }));
        
        if (user) {
          await updateDoc(doc(db, "users", user.uid), {
            photoBase64: base64String
          });
          toast.success('Foto de perfil atualizada!');
        }
      };
      
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast.error('Erro ao atualizar foto de perfil.');
    }
  };

  // Efeito de Dark Mode (Mantido)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Função para calcular estatísticas e checar conquistas (Mantida)
  const calculateStats = useCallback((data) => {
    const finishedCount = data.filter(g => g.status === 'zerados').length;
    setTotalFinishedGames(finishedCount);
    
    setAchievements(prevAchievements => {
      const newAchievements = new Set(prevAchievements);
      let madeChange = false;
      
      if (finishedCount >= 1 && !newAchievements.has("first_game")) {
        newAchievements.add("first_game");
        madeChange = true;
      }
      if (finishedCount >= 5 && !newAchievements.has("five_games")) {
        newAchievements.add("five_games");
        madeChange = true;
      }
      
      if (madeChange) {
        triggerConfetti();
        return Array.from(newAchievements);
      }
      return prevAchievements;
    });
  }, []);

  // Listener de autenticação (Ajustado)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        let firestoreData = {};
        let needsUpdate = false;
        if (userDocSnap.exists()) {
          firestoreData = userDocSnap.data();
        } else {
          const initialData = {
            gamesData: [], 
            achievements: [],
            gameHistory: [],
          };
          await setDoc(userDocRef, initialData);
          firestoreData = initialData;
        }

        const fullUser = {
          ...currentUser,
          photoBase64: firestoreData.photoBase64 || null,
        };
        setUser(fullUser);
        
        let fetchedGamesData = firestoreData.gamesData || [];
        
        // **LÓGICA DE MIGRAÇÃO: Mapeia o status 'a_zerar' para 'jogando'**
        const migratedGames = fetchedGamesData.map(game => {
            if (game.status === 'a_zerar') {
                needsUpdate = true;
                return { ...game, status: 'jogando' };
            }
            if (game.originalStatus === 'a_zerar') {
                needsUpdate = true;
                return { ...game, originalStatus: 'jogando' };
            }
            return game;
        });
        
        if (needsUpdate) {
            fetchedGamesData = migratedGames;
            await updateDoc(doc(db, "users", currentUser.uid), { gamesData: fetchedGamesData });
        }
        
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

  // Salvar dados no Firestore (Mantido)
  const saveDataToFirestore = useCallback(async (currentGamesData, currentAchievements, currentHistory) => {
    if (!user || loading) return;
    const userData = {
      gamesData: currentGamesData,
      achievements: currentAchievements,
      gameHistory: currentHistory,
      photoBase64: user.photoBase64 || null,
    };
    try {
      await updateDoc(doc(db, "users", user.uid), userData);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  }, [user, loading]);
  
  // Efeito para salvar dados no debounce (Mantido)
  useEffect(() => {
    if (loading || !user) return;
    const handler = setTimeout(() => {
      saveDataToFirestore(gamesData, achievements, gameHistory);
    }, 1500);
    return () => clearTimeout(handler);
  }, [gamesData, achievements, gameHistory, saveDataToFirestore, loading, user]);


  // Função para adicionar novo jogo (Mantida)
  const handleAddNewGame = (newGame) => {
    const gameWithId = { ...newGame, id: Date.now().toString() };
    const newGamesData = [...gamesData, gameWithId];
    
    setGamesData(newGamesData);
    
    if (newGame.status === 'zerados') {
        setGameHistory(prev => [...prev, { 
            game: newGame.nome, 
            status: 'zerado', 
            date: new Date().toISOString().split('T')[0] 
        }]);
        triggerConfetti();
        toast.success(`🎉 ${newGame.nome} adicionado como zerado!`);
    } else {
        toast.success(`${newGame.nome} adicionado com sucesso!`);
    }

    setIsAddGameModalOpen(false);
  };
  
  // FUNÇÃO: Editar Jogo (Mantida)
  const handleEditGame = (updatedGame) => {
    const newGamesData = gamesData.map(game => 
      game.id === updatedGame.id ? updatedGame : game
    );
    setGamesData(newGamesData);
    setSelectedGame(updatedGame); 
    setGameToEdit(null); 
    toast.success(`"${updatedGame.nome}" atualizado com sucesso!`);
    
    const oldGame = gamesData.find(g => g.id === updatedGame.id);
    if (oldGame && oldGame.status !== 'zerados' && updatedGame.status === 'zerados') {
        setGameHistory(prev => [...prev, { 
            game: updatedGame.nome, 
            status: 'zerado', 
            date: new Date().toISOString().split('T')[0] 
        }]);
        triggerConfetti();
    } else if (oldGame && oldGame.status === 'zerados' && updatedGame.status !== 'zerados') {
        setGameHistory(prev => prev.filter(item => item.game !== updatedGame.nome || item.status !== 'zerado'));
    }
  };
  
  // FUNÇÃO: Remover Jogo (Mantida)
  const handleDeleteGame = async (gameId) => {
    const gameToDelete = gamesData.find(g => g.id === gameId);
    if (!gameToDelete) return;
    
    const newGamesData = gamesData.filter(game => game.id !== gameId);
    setGamesData(newGamesData);
    calculateStats(newGamesData); 
    
    // Remove do histórico
    setGameHistory(prev => prev.filter(item => item.game !== gameToDelete.nome || item.status !== 'zerado'));

    toast.success(`"${gameToDelete.nome}" removido!`);
  };

  // Função para adicionar ou editar, dependendo do contexto
  const handleSaveGame = (gameData) => {
    if (gameToEdit) {
      handleEditGame(gameData);
    } else {
      handleAddNewGame(gameData);
    }
    // Fecha o modal de adição
    setIsAddGameModalOpen(false); 
    setGameToEdit(null); // Fecha o modal de edição
  }
  
  // Função para abrir o modal de edição
  const openEditModal = () => {
    setGameToEdit(selectedGame); // Define o jogo a ser editado
    setIsAddGameModalOpen(true); // Abre o modal
  };
  
  // NOVA FUNÇÃO: Abre o modal de review
  const openReviewModal = (game) => {
    setGameToReview(game);
    setIsReviewModalOpen(true);
  };
  
  // NOVA FUNÇÃO: Finaliza o processo de zerar o jogo com a nota e o review
  const handleCompleteGameFinish = (reviewData) => {
      if (!gameToReview) return;
      
      const gameId = gameToReview.id;
      const newStatus = 'zerados';
      const oldStatus = gameToReview.status;

      // 1. Cria a versão atualizada do jogo com a nota e o status
      const updatedGame = {
          ...gameToReview,
          status: newStatus,
          originalStatus: oldStatus, // Guarda o status anterior (jogando/desejados)
          rating: reviewData.rating,
          reviewText: reviewData.reviewText,
      };

      // 2. Atualiza o gamesData
      const newGamesData = gamesData.map(game => 
        game.id === gameId ? updatedGame : game
      );
      
      setGamesData(newGamesData);
      calculateStats(newGamesData); 
      setSelectedGame(updatedGame); // Atualiza a tela de detalhes
      
      // 3. Atualiza o Histórico
      setGameHistory(prev => [...prev, { 
        game: updatedGame.nome, 
        status: 'zerado', 
        date: new Date().toISOString().split('T')[0] 
      }]);
      
      triggerConfetti();
      toast.success(`🎉 ${updatedGame.nome} zerado e avaliado!`);
      
      // 4. Fecha o modal
      setIsReviewModalOpen(false);
      setGameToReview(null);
  }


  // Função para atualizar o status de um jogo (recebe o gameToUpdate opcionalmente)
  const handleUpdateGameStatus = (gameId, newStatus, gameToUpdate = null) => {
    const gameToMap = gameToUpdate || gamesData.find(g => g.id === gameId);
    if (!gameToMap) return;
    
    const oldStatus = gameToMap.status;
    
    const newGamesData = gamesData.map(game => 
      game.id === gameId ? { ...gameToMap, status: newStatus } : game
    );
    
    setGamesData(newGamesData);
    calculateStats(newGamesData); 
    
    // Lógica de Histórico (apenas para desmarcar como zerado aqui)
    if (oldStatus === 'zerados' && newStatus !== 'zerados') {
        setGameHistory(prev => prev.filter(item => item.game !== gameToMap.nome || item.status !== 'zerado'));
        toast(`Jogo desmarcado como zerado. Movido para ${categoryNames[newStatus].split('(')[1].replace(')', '')}`);
    }
  };
  
  // Função para calcular o progresso/contagem de uma categoria (Mantida)
  const getCategoryProgress = useCallback((category) => {
    const categoryGames = gamesData.filter(g => g.status === category);
    return categoryGames.length;
  }, [gamesData]);

  // Função para agrupar os jogos por status (Mantida)
  const groupedGames = gamesData.reduce((acc, game) => {
    const status = game.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(game);
    return acc;
  }, { jogando: [], zerados: [], desejados: [] });

  // Função de placeholder para remover o botão GeminiQuest (Mantida)
  const openGeminiQuestPlaceholder = () => toast('A funcionalidade Gemini Quest foi desativada.', { icon: '🤖' });


  // Renderização de Conteúdo
  const renderContent = () => {
    // Loading
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Carregando...</p>
          </div>
        </div>
      );
    }
    
    // Tela de Login (Mantida)
    if (!user) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl mb-6 shadow-2xl">
              <Joystick className="w-12 h-12" />
            </div>
            <h1 className="4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Game Backlog
            </h1>
            <p className="text-gray-400 mb-8">
              Gerencie seus jogos e acompanhe seu progresso
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-4 bg-white text-gray-900 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </button>
          </div>
        </div>
      );
    }

    // Navegação (Mantida)
    if (activeTab === "progress") {
      return (
        <ProgressScreen
          gameHistory={gameHistory}
          gamesData={gamesData}
          totalFinishedGames={totalFinishedGames}
        />
      );
    }
    // ... outros tabs (achievements, profile) ...
    if (activeTab === "achievements") {
      return (
        <EnhancedAchievements
          achievements={achievements}
          personalRecords={{}} 
        />
      );
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
        />
      );
    }
    
    // Se o modal de Review estiver aberto, renderiza-o primeiro
    if (isReviewModalOpen && gameToReview) {
      return (
        <ReviewGameModal
          game={gameToReview}
          onClose={() => {
            setIsReviewModalOpen(false);
            setGameToReview(null);
          }}
          onReviewSubmit={handleCompleteGameFinish}
        />
      );
    }


    // Fluxo de Jogos
    if (!selectedCategory) {
      return (
        <CategorySelector 
          games={groupedGames}
          setSelectedCategory={setSelectedCategory}
          getCategoryProgress={getCategoryProgress}
          user={user}
          totalFinishedGames={totalFinishedGames}
          setIsAddGameModalOpen={setIsAddGameModalOpen} 
        />
      );
    }

    if (!selectedGame) {
      return (
        <GameList
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          games={groupedGames}
          setSelectedGame={setSelectedGame}
        />
      );
    }

    // Detalhe do Jogo
    return (
      <GameDetail
        selectedCategory={selectedCategory}
        selectedGame={selectedGame}
        setSelectedGame={setSelectedGame}
        handleUpdateGameStatus={handleUpdateGameStatus}
        handleDeleteGame={handleDeleteGame} 
        openEditModal={openEditModal} 
        openReviewModal={openReviewModal} // NOVO PROP
        openGeminiQuest={openGeminiQuestPlaceholder} 
      />
    );
  };

  return (
    <div className="relative">
      <Toaster position="top-center" />
      {showConfetti && <Confetti />}
      {renderContent()}

      {/* Modal de Adicionar/Editar Jogo */}
      {isAddGameModalOpen && (
        <AddGameModal
          onClose={() => {
            setIsAddGameModalOpen(false);
            setGameToEdit(null); 
          }}
          onSaveGame={handleSaveGame} 
          gameToEdit={gameToEdit} 
        />
      )}

      {user && !selectedCategory && !selectedGame && !isReviewModalOpen && ( // Adicionado !isReviewModalOpen
        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;