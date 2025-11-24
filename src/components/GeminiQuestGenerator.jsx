// src/components/GeminiQuestGenerator.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, Wand2, Loader2, Zap, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function GeminiQuestGenerator({ game, onClose }) {
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar se a API Key existe
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const generateQuest = useCallback(async () => {
    if (!game) return;

    // Verificar se a API Key está configurada
    if (!GEMINI_API_KEY) {
      setError("⚠️ API Key do Gemini não configurada. Adicione VITE_GEMINI_API_KEY no arquivo .env.local");
      setLoading(false);
      return;
    }

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
      // Inicializar o Gemini apenas quando for usar
      const ai = new GoogleGenAI(GEMINI_API_KEY);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
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
      
      // Mensagens de erro mais específicas
      if (err.message && err.message.includes("API key")) {
        setError("❌ API Key inválida. Verifique se a chave está correta no .env.local");
      } else if (err.message && err.message.includes("quota")) {
        setError("❌ Limite de requisições excedido. Tente novamente mais tarde.");
      } else {
        setError("❌ Erro ao gerar Quest. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }, [game, GEMINI_API_KEY]);

  useEffect(() => {
    // Só gera automaticamente se a API Key estiver configurada
    if (GEMINI_API_KEY) {
      generateQuest();
    } else {
      setError("⚠️ Configure a VITE_GEMINI_API_KEY no arquivo .env.local para usar este recurso.");
    }
  }, [generateQuest, GEMINI_API_KEY]);

  if (!game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
            <Zap className="w-6 h-6 text-yellow-400" />
            Missão Surpresa Gemini
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className='p-3 bg-blue-500/10 rounded-xl text-blue-300 text-sm mb-4'>
            Desafio gerado por IA para aumentar a diversão em **{game.nome}**.
        </div>
        
        {/* Aviso se não houver API Key */}
        {!GEMINI_API_KEY && (
          <div className='p-4 bg-orange-500/20 border border-orange-500 rounded-xl text-orange-300 mb-4'>
            <div className='flex items-start gap-3'>
              <AlertCircle className='w-5 h-5 mt-0.5 flex-shrink-0' />
              <div>
                <p className='font-semibold mb-2'>API Key do Gemini não encontrada</p>
                <p className='text-sm mb-2'>Para usar este recurso, adicione a seguinte linha no seu arquivo <code className='bg-gray-800 px-2 py-1 rounded'>.env.local</code>:</p>
                <code className='block bg-gray-800 p-2 rounded text-xs'>
                  VITE_GEMINI_API_KEY=sua_chave_aqui
                </code>
                <p className='text-xs mt-2'>
                  Obtenha sua chave em: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className='text-blue-400 hover:underline'>Google AI Studio</a>
                </p>
              </div>
            </div>
          </div>
        )}
        
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
                disabled={loading || !GEMINI_API_KEY}
                className="flex-1 py-3 bg-yellow-500/20 border border-yellow-500 text-yellow-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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