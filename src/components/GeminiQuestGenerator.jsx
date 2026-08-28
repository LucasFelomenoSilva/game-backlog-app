// src/components/GeminiQuestGenerator.jsx
import React from 'react';

export default function GeminiQuestGenerator({ onClose }) {
  // A funcionalidade Gemini Quest foi removida conforme solicitação do usuário.
  // Você pode fechar o modal imediatamente ou exibir uma mensagem.
  
  // Exibindo uma mensagem de remoção/falha de carregamento no lugar do modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Função Desativada
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            X
          </button>
        </div>
        <p className='text-gray-400'>
          A funcionalidade **Missão Surpresa Gemini** foi removida a pedido do usuário.
        </p>
      </div>
    </div>
  );
}
