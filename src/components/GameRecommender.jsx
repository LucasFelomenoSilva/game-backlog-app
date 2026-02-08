import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchGameIGDB } from '../services/igdbService';
import { toast } from 'react-hot-toast';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react'; // Ícone novo

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function GameRecommender({ onSelectGame, onClose }) { // prop onSelectGame
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleAskGemini = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setRecommendations([]);
    setErrorMsg(null);

    try {
      if (!API_KEY) {
        throw new Error("Chave de API não configurada. Verifique o arquivo .env");
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Modelo atualizado

      const systemPrompt = `
        Você é um especialista em videogames. 
        O usuário vai descrever o que quer jogar.
        Sua missão: Recomendar 3 jogos que se encaixem perfeitamente na descrição.
        
        Descrição do usuário: "${prompt}"
        
        Regras:
        1. Retorne APENAS os nomes dos jogos separados por vírgula.
        2. Não coloque numeração, nem introdução.
        3. Priorize jogos famosos que existam no IGDB.
        
        Exemplo: Stardew Valley, Journey, Abzu
      `;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      const gameNames = text.split(',').map(name => name.trim());
      const gamesFound = [];
      
      for (const name of gameNames) {
        if (!name) continue;
        const searchResults = await searchGameIGDB(name);
        if (searchResults && searchResults.length > 0) {
          gamesFound.push({ ...searchResults[0], isRecommendation: true });
        }
      }

      if (gamesFound.length === 0) {
        setErrorMsg("A IA sugeriu jogos, mas não encontramos detalhes deles na API do IGDB.");
      } else {
        setRecommendations(gamesFound);
      }

    } catch (error) {
      console.error("Erro IA:", error);
      setErrorMsg(`Erro: ${error.message}`);
      toast.error("Ops! Tivemos um problema com o Oráculo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Oráculo de Jogos
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">X</button>
        </div>

        <div className="space-y-4">
          <label className="block text-gray-300 text-sm">
            O que você quer jogar hoje?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Quero um RPG de turno com história emocionante tipo Final Fantasy..."
            className="w-full h-32 bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none placeholder-gray-500"
          />
          
          {errorMsg && (
            <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="whitespace-pre-line">{errorMsg}</div>
            </div>
          )}
          
          <button
            onClick={handleAskGemini}
            disabled={loading || !prompt}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Consultando os astros...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Me Recomende!
              </>
            )}
          </button>
        </div>

        {recommendations.length > 0 && (
          <div className="mt-8 space-y-4 animate-fadeIn">
            <h3 className="text-white font-semibold">Jogos Encontrados:</h3>
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((game) => (
                <div key={game.id} className="flex bg-gray-900 rounded-xl p-3 border border-gray-700 gap-4 items-center hover:border-purple-500 transition-colors">
                  <img 
                    src={game.imageUrl || 'https://placehold.co/100x140?text=No+Image'} 
                    alt={game.nome}
                    className="w-16 h-20 object-cover rounded-lg shadow-sm" 
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-bold">{game.nome}</h4>
                    <p className="text-xs text-gray-400">{game.genre} • {game.platform}</p>
                  </div>
                  <button
                    onClick={() => onSelectGame(game)} // Chama função de revisar
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors flex items-center gap-2 font-medium"
                  >
                    <span className="text-sm">Revisar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}