// src/components/SurpriseMe.jsx — Recomendação surpresa via IA
import React, { useState } from 'react';
import { Sparkles, RefreshCw, Gamepad2, Star, Clock, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SurpriseMe({ gamesData, onClose }) {
  const { theme: V } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const backlogGames = gamesData.filter(g => ['jogando', 'quero_jogar', 'pausado'].includes(g.status));

  const buildPrompt = () => {
    const finished = gamesData.filter(g => g.status === 'zerados' && g.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8)
      .map(g => `${g.nome} (${g.genre}, nota ${g.rating}/10)`);

    const backlog = backlogGames.map(g => `${g.nome} (${g.platform}${g.timeToBeat ? `, ~${g.timeToBeat}h` : ''})`);

    const topGenres = Object.entries(
      gamesData.filter(g => g.status === 'zerados').reduce((acc, g) => {
        if (g.genre) acc[g.genre] = (acc[g.genre] || 0) + 1; return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g);

    return `Você é um conselheiro de jogos. Analise o perfil gamer abaixo e recomende UM jogo do backlog para jogar agora, explicando por quê em 2-3 frases em português. Seja entusiasmado e específico.

Jogos favoritos zerados: ${finished.join('; ') || 'nenhum ainda'}
Gêneros preferidos: ${topGenres.join(', ') || 'variados'}
Backlog atual: ${backlog.join('; ') || 'nenhum'}

Responda em JSON com os campos: { "game": "nome do jogo", "reason": "por que jogar agora", "mood": "emoji que representa o vibe do jogo", "hype": "frase curta e épica de 6 palavras" }`;
  };

  const getSurprise = async () => {
    if (backlogGames.length === 0) {
      setError('Adicione jogos ao backlog primeiro!');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{ role: 'user', content: buildPrompt() }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(c => c.text || '').join('') || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      // Tentar encontrar o jogo no backlog
      const found = backlogGames.find(g =>
        g.nome?.toLowerCase().includes(parsed.game?.toLowerCase()) ||
        parsed.game?.toLowerCase().includes(g.nome?.toLowerCase())
      );

      setResult({ ...parsed, gameObj: found || null });
    } catch (e) {
      // Fallback: escolha aleatória com mensagem motivacional
      const random = backlogGames[Math.floor(Math.random() * backlogGames.length)];
      setResult({
        game: random.nome,
        reason: 'Este jogo está esperando por você há tempo! Às vezes a melhor escolha é simplesmente começar.',
        mood: '🎮',
        hype: 'Sua aventura começa agora!',
        gameObj: random,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl" style={{ background: V.card, border: `1px solid ${V.border}`, boxShadow: `0 0 80px ${V.glow}` }}>

        {/* Header */}
        <div className="px-6 py-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${V.card2}, ${V.bg})`, borderBottom: `1px solid ${V.border}` }}>
          <div className="absolute inset-0 opacity-10" style={{ background: V.grad }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: V.grad, boxShadow: `0 4px 20px ${V.glow}` }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black" style={{ color: V.text }}>Surpreenda-me! ✨</h2>
                <p className="text-xs" style={{ color: V.muted }}>IA escolhe seu próximo jogo</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl"
              style={{ background: V.faint, border: `1px solid ${V.border}` }}>
              <X className="w-4 h-4" style={{ color: V.muted }} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Resultado */}
          {result && !loading && (
            <div className="mb-5">
              <div className="relative rounded-2xl overflow-hidden mb-4" style={{ background: `linear-gradient(135deg, ${V.faint}, ${V.card2})`, border: `1px solid ${V.border}` }}>
                {result.gameObj?.imageBase64 && (
                  <>
                    <img src={result.gameObj.imageBase64} className="w-full h-36 object-cover opacity-30" alt="" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 0%, ${V.card} 70%)` }} />
                  </>
                )}
                <div className={`p-4 ${result.gameObj?.imageBase64 ? 'relative' : ''}`}>
                  <div className="text-4xl mb-2">{result.mood}</div>
                  <h3 className="text-xl font-black mb-1" style={{ color: V.text }}>{result.game}</h3>
                  <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ background: V.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    "{result.hype}"
                  </p>
                  {result.gameObj && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: V.faint, color: V.muted, border: `1px solid ${V.border}` }}>{result.gameObj.platform}</span>
                      {result.gameObj.timeToBeat > 0 && (
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: V.low }}>
                          <Clock className="w-3 h-3" /> ~{result.gameObj.timeToBeat}h
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed" style={{ color: V.muted }}>{result.reason}</p>
                </div>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🎲</div>
              <p className="text-sm" style={{ color: V.muted }}>
                A IA vai analisar seu histórico e recomendar o jogo perfeito para jogar agora!
              </p>
              <p className="text-xs mt-2" style={{ color: V.low }}>
                {backlogGames.length} jogos no backlog disponíveis
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-10">
              <div className="text-4xl mb-3 animate-spin">🎮</div>
              <p className="text-sm font-bold" style={{ background: V.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Analisando seu perfil...
              </p>
            </div>
          )}

          {error && <p className="text-center text-sm mb-4" style={{ color: '#f43f5e' }}>{error}</p>}

          <button onClick={getSurprise} disabled={loading}
            className="w-full py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60 shadow-xl"
            style={{ background: V.grad, boxShadow: `0 4px 20px ${V.glow}` }}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {result ? 'Outra sugestão!' : 'Sortear jogo!'}
          </button>
        </div>
      </div>
    </div>
  );
}