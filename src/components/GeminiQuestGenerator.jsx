// src/components/GeminiQuestGenerator.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, Wand2, Loader2, Zap } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// Inicialização do Gemini usando a variável de ambiente do Vite
// Certifique-se de que VITE_GEMINI_API_KEY está definido no seu .env.local
const ai = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function GeminiQuestGenerator({ game, onClose }) {
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateQuest = useCallback(async () => {
    if (!game) return;

    setLoading(true);
    setError(null);
    setQuest(null);

    const prompt = `Crie uma "Quest Surpresa" ou um "Desafio Não-Padrão" para o jogo ${game.nome} (${game.platform}, Gênero: ${game.genre}). 
    O desafio deve ser divertido, não-oficial e focado em uma forma diferente de jogar ou em um objetivo secundário criativo (ex: colecionar algo inútil, jogar com restrições, encontrar todos os NPCs que falam sobre gatos). 
    A resposta deve ter o formato JSON, estritamente: 
    {
      "titulo": "Título da Missão", 
      "descricao": "Descrição detalhada do desafio.", 
      "recompensa": "Sugestão de recompensa não-oficial (ex: 1 hora de descanso, um novo avatar, um snack)"
    }`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              titulo: { type: "string" },
              descricao: { type: "string" },
              recompensa: { type: "string" },
            },
          },
        },
      });
      
      const jsonResponse = JSON.parse(response.text);
      setQuest(jsonResponse);

    } catch (err) {
      console.error("Erro na API Gemini:", err);
      setError("Não foi possível gerar a Quest. Verifique sua API Key no .env.local e permissões.");
    } finally {
      setLoading(false);
    }
  }, [game]);

  useEffect(() => {
    generateQuest();
  }, [generateQuest]);

  if (!game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
            <Zap className="w-6 h-6" />
            Missão Surpresa Gemini
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className='p-3 bg-blue-500/10 rounded-xl text-blue-300 text-sm mb-4'>
            Desafio gerado por IA para aumentar a diversão em **{game.nome}**.
        </div>
        
        {/* Conteúdo da Quest */}
        <div className='space-y-4'>
            {loading && (
                <div className='flex flex-col items-center justify-center p-8 bg-gray-700/50 rounded-xl'>
                    <Loader2 className='w-8 h-8 animate-spin text-yellow-400 mb-3' />
                    <p className='text-gray-300'>Gerando sua missão secreta...</p>
                </div>
            )}
            
            {error && (
                <div className='p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-400'>
                    <p>{error}</p>
                </div>
            )}

            {quest && (
                <div className='p-5 bg-gray-700/50 rounded-2xl border border-yellow-500/50 animate-slideInUp'>
                    <h3 className='text-xl font-bold mb-2 text-yellow-400 flex items-center gap-2'>
                        <Wand2 className='w-5 h-5' />
                        {quest.titulo}
                    </h3>
                    
                    <p className='text-gray-300 mb-4'>{quest.descricao}</p>
                    
                    <div className='border-t border-gray-600 pt-3'>
                        <p className='text-sm font-semibold text-orange-400'>Recompensa Sugerida:</p>
                        <p className='text-base text-white'>{quest.recompensa}</p>
                    </div>
                </div>
            )}
        </div>
        
        {/* Botões de Ação */}
        <div className='mt-6 flex gap-3'>
            <button
                onClick={generateQuest}
                disabled={loading}
                className="flex-1 py-3 bg-yellow-500/20 border border-yellow-500 text-yellow-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500/30 transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : <Wand2 className="w-5 h-5" />}
                Nova Quest
            </button>
            <button
                onClick={onClose}
                className="w-1/3 py-3 bg-gray-600/50 hover:bg-gray-600 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
                Fechar
            </button>
        </div>
      </div>
    </div>
  );
}