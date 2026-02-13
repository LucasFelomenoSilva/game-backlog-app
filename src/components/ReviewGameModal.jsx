// src/components/ReviewGameModal.jsx
import React, { useState } from 'react';
import { X, Star, CheckCircle, Trophy } from 'lucide-react';
import { categoryNames } from '../data/categories';

// Componente para a seleção de estrela
const RatingStar = ({ rating, setRating, index }) => {
    const isSelected = index <= rating;

    return (
        <Star
            key={index}
            className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${
                isSelected ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
            }`}
            onClick={() => setRating(index)}
        />
    );
};

export default function ReviewGameModal({ game, onClose, onReviewSubmit }) {
    const [rating, setRating] = useState(10);
    const [reviewText, setReviewText] = useState('');
    const [isPlatinum, setIsPlatinum] = useState(game.isPlatinum || false);
    const [loading, setLoading] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setLoading(true);

        const reviewData = {
            rating: rating,
            reviewText: reviewText.trim(),
            isPlatinum: isPlatinum
        };
        
        onReviewSubmit(reviewData);
        setLoading(false);
    };

    const cleanCategoryName = categoryNames['zerados'].split('(')[0].trim();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-800 dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        Avaliar Jogo
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <h3 className="text-xl font-semibold mb-4 text-white text-center">
                    Parabéns por zerar: <span className="text-cyan-400">{game.nome}</span>
                </h3>

                <form onSubmit={handleSave} className="space-y-4">
                    
                    {/* Seleção de Nota */}
                    <div>
                        <label className="block text-lg font-medium text-gray-300 mb-3 text-center">
                            Sua Nota: <span className="text-yellow-400 font-bold text-4xl">{rating}</span> / 10
                        </label>
                        <div className="flex justify-center items-center gap-1 flex-wrap">
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(i => (
                                <RatingStar 
                                    key={i}
                                    rating={rating}
                                    setRating={setRating}
                                    index={i}
                                />
                            ))}
                        </div>
                        <p className="text-center text-sm text-gray-400 mt-2">Clique no ícone para selecionar a nota (1 a 10).</p>
                    </div>

                    {/* NOVO: Checkbox de Platina */}
                    <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/30 rounded-2xl p-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isPlatinum}
                                onChange={(e) => setIsPlatinum(e.target.checked)}
                                className="w-5 h-5 rounded border-2 border-yellow-500 bg-gray-800 checked:bg-yellow-500 checked:border-yellow-500 focus:ring-2 focus:ring-yellow-500 cursor-pointer"
                            />
                            <div className="flex items-center gap-2 flex-1">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                                <div>
                                    <span className="text-sm font-bold text-yellow-300 block">
                                        Platinado / 100% Completo
                                    </span>
                                    <span className="text-xs text-yellow-500/70">
                                        Conquistei todas as conquistas
                                    </span>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Comentários */}
                    <div>
                        <label htmlFor="reviewText" className="block text-sm font-medium text-gray-300 mb-1">Comentários (Opcional)</label>
                        <textarea
                            id="reviewText"
                            rows="3"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Ex: Uma obra-prima! O final me fez chorar..."
                            className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all"
                        ></textarea>
                    </div>

                    {/* Botão de Salvar */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-6 hover:from-green-600 hover:to-emerald-600 transition-all active:scale-[0.99] disabled:opacity-60"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Finalizar e Marcar como {cleanCategoryName}
                    </button>
                </form>
            </div>
        </div>
    );
}