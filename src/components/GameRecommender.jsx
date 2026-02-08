import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchGameIGDB } from '../services/igdbService';
import { toast } from 'react-hot-toast';
import { Sparkles, ArrowRight, AlertCircle, X, Search, Zap, Star, Gamepad2 } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function GameRecommender({ onSelectGame, onClose }) {
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
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop com blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-purple-900/20 to-black/90 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
        
        {/* Modal Content */}
        <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
          
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-br from-gray-900/98 to-gray-950/98 backdrop-blur-xl border-b border-white/5 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Oráculo de Jogos
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Powered by Gemini AI</p>
                </div>
              </div>
              
              <button 
                onClick={onClose} 
                className="group p-2.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-purple-400" />
                <label className="text-sm font-semibold text-gray-300">
                  O que você quer jogar hoje?
                </label>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-300"></div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Quero um RPG de turno com história emocionante tipo Final Fantasy..."
                  className="relative w-full h-32 bg-gray-800/50 backdrop-blur-xl border border-white/10 focus:border-purple-500/50 rounded-2xl p-4 text-white focus:ring-2 focus:ring-purple-500/20 outline-none resize-none placeholder-gray-500 transition-all duration-300"
                />
              </div>
              
              {/* Error Message */}
              {errorMsg && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-20"></div>
                  <div className="relative p-4 bg-red-900/20 backdrop-blur-xl border border-red-500/30 rounded-2xl text-red-200 text-sm flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
                    <div className="whitespace-pre-line">{errorMsg}</div>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <button
                onClick={handleAskGemini}
                disabled={loading || !prompt.trim()}
                className="group relative w-full"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Consultando os astros...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Me Recomende!</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Recommendations Grid */}
            {recommendations.length > 0 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <h3 className="text-white font-bold text-lg">Recomendações Perfeitas</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {recommendations.map((game, index) => (
                    <div 
                      key={game.id} 
                      className="group relative animate-slideUp"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Card Glow */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                      
                      {/* Card Content */}
                      <div className="relative flex bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 border border-white/10 group-hover:border-white/20 gap-4 items-center transition-all duration-300">
                        
                        {/* Game Image */}
                        <div className="relative flex-shrink-0">
                          <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur opacity-20"></div>
                          <img 
                            src={game.imageUrl || 'https://placehold.co/100x140?text=No+Image'} 
                            alt={game.nome}
                            className="relative w-20 h-28 object-cover rounded-xl shadow-lg border border-white/10" 
                          />
                        </div>
                        
                        {/* Game Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-lg mb-1.5 truncate group-hover:text-purple-300 transition-colors">
                            {game.nome}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <span className="px-2 py-1 bg-purple-500/20 rounded-lg text-purple-300 text-xs font-semibold">
                              {game.genre}
                            </span>
                            {game.platform && (
                              <span className="px-2 py-1 bg-gray-700/50 rounded-lg text-gray-300 text-xs font-semibold flex items-center gap-1">
                                <Gamepad2 className="w-3 h-3" />
                                {game.platform}
                              </span>
                            )}
                          </div>
                          {game.timeToBeat && (
                            <p className="text-xs text-gray-500">~{game.timeToBeat}h para zerar</p>
                          )}
                        </div>
                        
                        {/* Action Button */}
                        <button
                          onClick={() => onSelectGame(game)}
                          className="group/btn relative flex-shrink-0"
                        >
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover/btn:opacity-50 transition duration-300"></div>
                          <div className="relative px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-white transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg">
                            <span className="text-sm">Ver Detalhes</span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                          </div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State quando não há recomendações */}
            {!loading && recommendations.length === 0 && !errorMsg && prompt.trim() === '' && (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl mb-4">
                  <Sparkles className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Pronto para descobrir?</h3>
                <p className="text-sm text-gray-500">Digite o que você procura e deixe a magia acontecer ✨</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}