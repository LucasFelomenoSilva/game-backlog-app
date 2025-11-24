// src/components/AddGameModal.jsx
import React, { useState } from 'react';
import { X, Gamepad, Save } from 'lucide-react';
import { categoryNames, initialGameData, platformOptions, genreOptions } from '../data/categories';

export default function AddGameModal({ onClose, onAddGame }) {
  const [formData, setFormData] = useState(initialGameData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      alert("O nome do jogo é obrigatório!");
      return;
    }
    const finalData = {
      ...formData,
      timeToBeat: parseInt(formData.timeToBeat) || 0,
      originalStatus: formData.status // Salva o status original para referência
    };
    onAddGame(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gamepad className="w-6 h-6 text-cyan-400" />
            Adicionar Novo Jogo
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nome do Jogo */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1">Nome do Jogo *</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Baldur's Gate 3"
              required
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Platforma */}
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-1">Plataforma</label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Gênero */}
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-1">Gênero</label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              {genreOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Time to Beat (Horas) */}
          <div>
            <label htmlFor="timeToBeat" className="block text-sm font-medium text-gray-300 mb-1">Tempo Médio (Horas)</label>
            <input
              id="timeToBeat"
              name="timeToBeat"
              type="number"
              min="0"
              value={formData.timeToBeat}
              onChange={handleChange}
              placeholder="Ex: 50"
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Inicial */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status Inicial</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              {Object.entries(categoryNames).filter(([key]) => key !== 'zerados').map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
          
          {/* Notas */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Notas (Opcional)</label>
            <textarea
              id="notes"
              name="notes"
              rows="2"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ex: Começar com a classe Bardo"
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all"
            ></textarea>
          </div>


          {/* Botão de Salvar */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-6 hover:from-blue-600 hover:to-cyan-600 transition-all active:scale-[0.99]"
          >
            <Save className="w-5 h-5" />
            Salvar Jogo
          </button>
        </form>
      </div>
    </div>
  );
}