import React, { useState, useEffect } from 'react'; // Adicionei useEffect
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchGameIGDB } from '../services/igdbService';
import { toast } from 'react-hot-toast';
// Adicionei o ícone 'Languages' e 'Loader2'
import { Sparkles, ArrowRight, AlertCircle, ArrowLeft, Star, Gamepad2, Languages, Loader2 } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function GameRecommender({ onSelectGame, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [previewGame, setPreviewGame] = useState(null);

  // NOVOS ESTADOS PARA TRADUÇÃO
  const [translatedSummary, setTranslatedSummary] = useState(null);
  const [showTranslated, setShowTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Reseta a tradução sempre que trocar de jogo no preview
  useEffect(() => {
    setTranslatedSummary(null);
    setShowTranslated(false);
  }, [previewGame]);

  const handleAskGemini = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setRecommendations([]);
    setErrorMsg(null);
    setPreviewGame(null);

    try {
      if (!API_KEY) throw new Error("Chave de API não configurada.");

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const systemPrompt = `
        Recomende 3 jogos baseados nesta descrição: "${prompt}".
        Retorne APENAS os nomes separados por vírgula. Sem numeração.
        Priorize jogos famosos.
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
        setErrorMsg("Não encontramos detalhes dos jogos sugeridos.");
      } else {
        setRecommendations(gamesFound);
      }

    } catch (error) {
      console.error("Erro IA:", error);
      setErrorMsg(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // NOVA FUNÇÃO: Traduzir a sinopse usando o Gemini
  const handleTranslate = async () => {
    // 1. Se já está traduzido e visível, volta para o original
    if (showTranslated) {
      setShowTranslated(false);
      return;
    }

    // 2. Se já traduzimos antes (cache), só mostra, não gasta API
    if (translatedSummary) {
      setShowTranslated(true);
      return;
    }

    // 3. Se não tem tradução, chama a IA
    if (!previewGame.summary) return;

    try {
      setIsTranslating(true);
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const translationPrompt = `
        Traduza o seguinte resumo de jogo para Português do Brasil. 
        Mantenha o tom emocionante de jogos.
        Texto original: "${previewGame.summary}"
      `;

      const result = await model.generateContent(translationPrompt);
      const translation = result.response.text();
      
      setTranslatedSummary(translation);
      setShowTranslated(true);
    } catch (error) {
      console.error("Erro na tradução:", error);
      toast.error("Não foi possível traduzir agora.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-700 max-h-[90vh] min-h-[500px] overflow-hidden flex flex-col relative transition-all duration-300">
        
        {/* === TELA 1: LISTA DE RECOMENDAÇÕES === */}
        {!previewGame && (
          <div className="p-6 overflow-y-auto h-full flex flex-col animate-fadeIn">
             <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Oráculo de Jogos
              </h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">X</button>
            </div>

            <div className="space-y-4 shrink-0">
              <label className="block text-gray-300 text-sm">O que você quer jogar hoje?</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Um jogo estilo Cyberpunk mas com espadas..."
                className="w-full h-24 bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none placeholder-gray-500"
              />
              
              {errorMsg && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm">
                  <AlertCircle className="w-4 h-4 inline mr-2" />{errorMsg}
                </div>
              )}
              
              <button
                onClick={handleAskGemini}
                disabled={loading || !prompt}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <span className="animate-pulse">Consultando...</span> : <><Sparkles className="w-5 h-5"/> Me Recomende!</>}
              </button>
            </div>

            {recommendations.length > 0 && (
              <div className="mt-8 space-y-4 animate-slideInUp flex-1">
                <h3 className="text-white font-semibold">Sugestões:</h3>
                <div className="grid grid-cols-1 gap-4 pb-4">
                  {recommendations.map((game) => (
                    <div key={game.id} className="flex bg-gray-900 rounded-xl p-3 border border-gray-700 gap-4 items-center hover:border-purple-500 transition-colors cursor-pointer" onClick={() => setPreviewGame(game)}>
                      <img 
                        src={game.imageUrl || 'https://placehold.co/100x140?text=No+Image'} 
                        alt={game.nome}
                        className="w-16 h-20 object-cover rounded-lg shadow-sm" 
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold truncate">{game.nome}</h4>
                        <p className="text-xs text-gray-400 truncate">{game.genre} • {game.platform}</p>
                      </div>
                      <button
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
                      >
                        Ver Detalhes
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === TELA 2: POPUP DE DETALHES (PREVIEW) === */}
        {previewGame && (
          <div className="w-full h-full bg-gray-800 flex flex-col animate-slideInUp">
            
            {/* Header da Preview */}
            <div className="p-4 border-b border-gray-700 flex items-center gap-4 shrink-0">
               <button 
                 onClick={() => setPreviewGame(null)} 
                 className="p-2 rounded-full hover:bg-gray-700 text-gray-300 transition-colors"
               >
                 <ArrowLeft className="w-6 h-6" />
               </button>
               <h3 className="text-xl font-bold text-white truncate flex-1">{previewGame.nome}</h3>
            </div>

            {/* Conteúdo Scrollável */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Imagem Grande */}
                <div className="shrink-0">
                    <img 
                    src={previewGame.imageUrl} 
                    className="w-full md:w-48 h-64 object-cover rounded-xl shadow-lg mx-auto"
                    alt={previewGame.nome}
                    />
                </div>
                
                {/* Informações */}
                <div className="space-y-6 flex-1">
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-purple-900/50 text-purple-200 text-xs rounded-full border border-purple-500/30 flex items-center gap-1">
                      <Gamepad2 className="w-3 h-3" /> {previewGame.genre}
                    </span>
                    {previewGame.rating && (
                      <span className="px-3 py-1 bg-yellow-900/50 text-yellow-200 text-xs rounded-full border border-yellow-500/30 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> {previewGame.rating}/100
                      </span>
                    )}
                     <span className="px-3 py-1 bg-blue-900/50 text-blue-200 text-xs rounded-full border border-blue-500/30">
                        {previewGame.platform}
                    </span>
                  </div>

                  {/* Sinopse com Tradução */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-400 text-sm font-semibold uppercase">Sinopse</h4>
                      
                      {/* Botão de Tradução */}
                      <button 
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs text-blue-300 transition-colors disabled:opacity-50"
                      >
                        {isTranslating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Languages className="w-3 h-3" />
                        )}
                        {showTranslated ? "Ver Original (EN)" : "Traduzir (PT-BR)"}
                      </button>
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line animate-fadeIn">
                      {showTranslated 
                        ? (translatedSummary || "Traduzindo...") 
                        : (previewGame.summary || "Nenhuma descrição encontrada para este jogo.")
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer com Ações */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex gap-3 justify-end shrink-0">
              <button
                onClick={() => setPreviewGame(null)}
                className="px-5 py-2.5 rounded-xl text-gray-300 font-medium hover:bg-gray-700 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => onSelectGame(previewGame)}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all flex items-center gap-2"
              >
                Adicionar ao Backlog
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}