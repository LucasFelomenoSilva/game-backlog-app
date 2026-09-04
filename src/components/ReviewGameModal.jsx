// src/components/ReviewGameModal.jsx
import React, { useState } from 'react';
import { X, Star, CheckCircle, Trophy, CalendarDays } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

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
  const { t } = useLanguage();
  const { theme: V } = useTheme();
  const [rating, setRating] = useState(10);
  const [reviewText, setReviewText] = useState('');
  const [isPlatinum, setIsPlatinum] = useState(game.isPlatinum || false);
  const [finishedDate, setFinishedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);

    const reviewData = {
      rating: rating,
      reviewText: reviewText.trim(),
      isPlatinum: isPlatinum,
      finishedDate: new Date(`${finishedDate}T12:00:00`).toISOString(),
    };
    
    onReviewSubmit(reviewData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm animate-fadeIn sm:items-center sm:p-4">
      <div className="max-h-[100dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-gray-700 bg-gray-800 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl dark:bg-gray-900 sm:max-h-[90dvh] sm:rounded-3xl sm:p-6"
        style={{ background: V.card, borderColor: V.border }}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            {t('review.title')}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <h3 className="text-xl font-semibold mb-4 text-white text-center">
          {t('review.congrats')} <span style={{ color: V.primary }}>{game.nome}</span>
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Seleção de Nota */}
          <div>
            <label className="block text-lg font-medium text-gray-300 mb-3 text-center">
              {t('review.your_rating')} <span className="text-yellow-400 font-bold text-4xl">{rating}</span> / 10
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
            <p className="text-center text-sm text-gray-400 mt-2">{t('review.rating_instructions')}</p>
          </div>

          <div>
            <label htmlFor="finishedDate" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-300">
              <CalendarDays className="h-4 w-4" style={{ color: V.primary }} /> {t('review.finished_date')}
            </label>
            <input
              id="finishedDate"
              type="date"
              required
              value={finishedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(event) => setFinishedDate(event.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-700/50 p-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              style={{ colorScheme: 'dark', background: V.faint, borderColor: V.border }}
            />
          </div>

          {/* Checkbox de Platina */}
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
                    {t('review.platinum_title')}
                  </span>
                  <span className="text-xs text-yellow-500/70">
                    {t('review.platinum_desc')}
                  </span>
                </div>
              </div>
            </label>
          </div>

          {/* Comentários */}
          <div>
            <label htmlFor="reviewText" className="block text-sm font-medium text-gray-300 mb-1">{t('review.comments')}</label>
            <textarea
              id="reviewText"
              rows="3"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={t('review.comments_placeholder')}
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              style={{ background: V.faint, borderColor: V.border }}
            ></textarea>
          </div>

          {/* Botão de Salvar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-6 hover:from-green-600 hover:to-emerald-600 transition-all active:scale-[0.99] disabled:opacity-60"
            style={{ boxShadow: `0 4px 20px ${V.glow}` }}
          >
            <CheckCircle className="w-5 h-5" />
            {t('review.finish_btn')}
          </button>
        </form>
      </div>
    </div>
  );
}
