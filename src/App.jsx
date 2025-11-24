// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { categoryNames, categoryColors, categoryIcons } from "./data/categories"; 
import CategorySelector from "./components/CategorySelector";
import GameList from "./components/GameList";
import GameDetail from "./components/GameDetail";
import BottomNavigation from "./components/BottomNavigation";
import ProgressScreen from "./components/ProgressScreen";
import ProfileScreen from "./components/ProfileScreen";
import EnhancedAchievements from "./components/EnhancedAchievements";
import AddGameModal from "./components/AddGameModal"; 
import GeminiQuestGenerator from "./components/GeminiQuestGenerator";
import { Joystick, Plus } from "lucide-react";
import imageCompression from "browser-image-compression"; // Mantido do projeto original

// Imports do Firebase
import { auth, db, googleProvider } from "./firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Componente de Confetti (Mantenha o código do snippet anterior)
const Confetti = () => { /* ... */ }; 

function App() {
  // ... (Estados de Autenticação, UI e DarkMode) ...
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
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false); 
  
  // Stats e Histórico
  const [totalFinishedGames, setTotalFinishedGames] = useState(0); 
  const [achievements, setAchievements] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  
  // --- Funções de Auth e Setup (Devem ser mantidas as do projeto original) ---
  const handleGoogleSignIn = async () => { /* ... */ };
  const handleSignOut = () => { /* ... */ };
  const handleProfileImageUpload = async (file) => { /* ... */ };
  const playNotificationSound = () => { /* ... */ };
  const triggerConfetti = () => { /* ... */ };

  // Efeito de Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);


  // Função para calcular estatísticas e checar conquistas
  const calculateStats = useCallback((data) => {
      const finishedCount = data.filter(g => g.status === 'zerados').length;
      setTotalFinishedGames(finishedCount);
      
      setAchievements(prevAchievements => {
          const newAchievements = new Set(prevAchievements);
          let madeChange = false;
          if (finishedCount >= 1 && !newAchievements.has("first_game")) {
              newAchievements.add("first_game"); madeChange = true;
          }
          if (finishedCount >= 5 && !newAchievements.has("five_games")) {
              newAchievements.add("five_games"); madeChange = true;
          }
          if (madeChange) {
              triggerConfetti();
              return Array.from(newAchievements);
          }
          return prevAchievements;
      });
  }, []);

  // Listener de autenticação (Atualizado para buscar gamesData)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        let firestoreData = {};
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
        
        const fetchedGamesData = firestoreData.gamesData || [];
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

  // Salvar dados no Firestore
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
  
  // Efeito para salvar dados no debounce
  useEffect(() => {
    if (loading || !user) return;
    const handler = setTimeout(() => {
      saveDataToFirestore(gamesData, achievements, gameHistory);
    }, 1500);
    return () => clearTimeout(handler);
  }, [gamesData, achievements, gameHistory, saveDataToFirestore, loading, user]);


  // --- Lógica de Jogo ---

  // Função para adicionar novo jogo
  const handleAddNewGame = (newGame) => {
      const gameWithId = { ...newGame, id: Date.now().toString() };
      const newGamesData = [...gamesData, gameWithId];
      setGamesData(newGamesData);
      setIsAddGameModalOpen(false);
  };
  
  // Função para atualizar o status de um jogo
  const handleUpdateGameStatus = (gameId, newStatus) => {
      const gameToUpdate = gamesData.find(g => g.id === gameId);
      if (!gameToUpdate) return;
      
      const oldStatus = gameToUpdate.status;
      
      const newGamesData = gamesData.map(game => 
          game.id === gameId ? { ...game, status: newStatus } : game
      );
      
      setGamesData(newGamesData);
      calculateStats(newGamesData); 
      
      // Lógica de Histórico
      if (newStatus === 'zerados' && oldStatus !== 'zerados') {
          setGameHistory(prev => [...prev, { 
              game: gameToUpdate.nome, 
              status: 'zerado', 
              date: new Date().toISOString().split('T')[0] 
          }]);
          triggerConfetti(); 
      }
  };
  
  // Função para calcular o progresso/contagem de uma categoria
  const getCategoryProgress = useCallback((category) => {
    const categoryGames = gamesData.filter(g => g.status === category);
    return categoryGames.length;
  }, [gamesData]);

  // Função para agrupar os jogos por status (usado para renderização)
  const groupedGames = gamesData.reduce((acc, game) => {
    const status = game.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(game);
    return acc;
  }, { jogando: [], a_zerar: [], zerados: [], desejados: [] });
  

  // --- Renderização de Conteúdo ---

  const renderContent = () => {
    // ... (Loading e Login Screen - Mantenha as do projeto anterior) ...
    
    if (isGeminiModalOpen) {
        return (
            <GeminiQuestGenerator
                game={selectedGame}
                onClose={() => setIsGeminiModalOpen(false)}
            />
        );
    }

    if (activeTab === "progress") {
      return (
        <ProgressScreen
          gameHistory={gameHistory}
          gamesData={gamesData}
          totalFinishedGames={totalFinishedGames}
        />
      );
    }

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

    // Tab de Categorias
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
        openGeminiQuest={() => setIsGeminiModalOpen(true)} 
      />
    );
  };

  return (
    <div className="relative">
      {showConfetti && <Confetti />}

      {renderContent()}

      {/* Modal de Adicionar Jogo */}
      {isAddGameModalOpen && (
        <AddGameModal
          onClose={() => setIsAddGameModalOpen(false)}
          onAddGame={handleAddNewGame}
        />
      )}

      {user && !selectedCategory && !selectedGame && !isGeminiModalOpen && (
        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;