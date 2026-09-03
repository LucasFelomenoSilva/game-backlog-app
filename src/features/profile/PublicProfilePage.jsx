// src/features/profile/PublicProfilePage.jsx
//
// Antes estava embutida no App.jsx com guards "if (isPublicRoute)".
// Agora é um componente independente com seu próprio estado de loading.

import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Sparkles } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getPublicProfile } from '../../services/gameService';

const publicGameImage = game => {
  let img = String(game?.imageUrl || game?.imageBase64 || '').trim();
  if (img.startsWith('LOADING_URL:')) img = img.replace('LOADING_URL:', '').trim();
  if (img.startsWith('//')) img = 'https:' + img;
  return img;
};

export default function PublicProfilePage() {
  const { theme: V } = useTheme();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const username = window.location.pathname.split('/u/')[1]?.replace('/', '');
    if (!username) { setError('Link de utilizador inválido.'); setLoading(false); return; }

    getPublicProfile(username)
      .then(result => {
        if (!result) setError('Perfil não encontrado 😢');
        else setData(result);
      })
      .catch(() => setError('Erro ao carregar o perfil.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: V.bg }}>
      <Loader2 className="w-10 h-10 animate-spin" style={{ color: V.primary }} />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center" style={{ background: V.bg }}>
      <Gamepad2 className="w-20 h-20 mb-6 opacity-50" style={{ color: V.muted }} />
      <h1 className="text-3xl font-black mb-2 text-white">{error || 'Perfil não encontrado'}</h1>
      <p className="mb-8" style={{ color: V.muted }}>O utilizador que procura não existe ou alterou o nome.</p>
      <a href="/" className="px-6 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105 shadow-xl"
        style={{ background: `linear-gradient(135deg, ${V.primary}, ${V.secondary})` }}>
        Criar o meu Backlog
      </a>
    </div>
  );

  const { profile, gamesData: pubGames } = data;
  const finished = pubGames
    .filter(g => g.status === 'zerados')
    .sort((a, b) => new Date(b.finishedDate || 0) - new Date(a.finishedDate || 0));
  const platinas = finished.filter(g => g.isPlatinum).length;
  const playing  = pubGames.filter(g => g.status === 'jogando' || g.status === 'playing');

  return (
    <div className="min-h-screen pb-20" style={{ background: V.bg, color: V.text }}>
      {/* Header do perfil */}
      <div className="pt-12 pb-8 px-4 text-center border-b" style={{ borderColor: V.border, background: V.card }}>
        <div className="w-28 h-28 mx-auto rounded-3xl overflow-hidden mb-4 shadow-xl relative" style={{ border: `3px solid ${V.primary}` }}>
          {(() => {
            const avatarSrc = profile.photoURL || profile.photoBase64 || '';
            return (
              <>
                {avatarSrc && (
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fb = e.currentTarget.nextElementSibling;
                      if (fb) fb.style.display = 'flex';
                    }}
                  />
                )}
                <div
                  className="w-full h-full items-center justify-center text-4xl font-black text-white"
                  style={{
                    display: avatarSrc ? 'none' : 'flex',
                    background: `linear-gradient(135deg, ${V.primary}, ${V.secondary})`
                  }}
                >
                  {profile.displayName?.charAt(0).toUpperCase() || 'G'}
                </div>
              </>
            );
          })()}
        </div>
        <h1 className="text-3xl font-black mb-1">{profile.displayName}</h1>
        <p className="text-sm font-semibold mb-6" style={{ color: V.primary }}>Nível {profile.level || 1}</p>
        <div className="flex justify-center gap-4 max-w-sm mx-auto">
          {[
            { value: finished.length, label: 'Zerados',  color: '#10b981' },
            { value: platinas,        label: 'Platinas',  color: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} className="flex-1 p-3 rounded-2xl" style={{ background: V.faint, border: `1px solid ${V.border}` }}>
              <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[10px] uppercase font-bold tracking-widest mt-1" style={{ color: V.muted }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8 space-y-8">
        {/* A jogar agora */}
        {playing.length > 0 && (
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: V.muted }}>
              <Gamepad2 className="w-4 h-4" /> A Jogar Agora
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {playing.map(game => {
                const cover = publicGameImage(game);
                return (
                  <div key={game.id} className="flex gap-4 p-3 rounded-2xl" style={{ background: V.card, border: `1px solid ${V.border}` }}>
                    <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 relative" style={{ background: V.faint }}>
                      {cover && (
                        <img
                          src={cover}
                          className="w-full h-full object-cover"
                          alt={game.nome}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fb = e.currentTarget.nextElementSibling;
                            if (fb) fb.style.display = 'flex';
                          }}
                        />
                      )}
                      <div
                        className="w-full h-full items-center justify-center"
                        style={{ display: cover ? 'none' : 'flex' }}
                      >
                        <Gamepad2 className="w-6 h-6 opacity-50" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <div className="font-bold text-base leading-tight truncate">{game.nome}</div>
                      <div className="text-xs mt-1.5 font-semibold" style={{ color: V.soft }}>{game.platform}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Últimos zerados */}
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: V.muted }}>
            <Trophy className="w-4 h-4" /> Últimos Zerados
          </h2>
          {finished.length === 0
            ? <p className="text-center py-10 text-sm" style={{ color: V.muted }}>Nenhum jogo concluído ainda.</p>
            : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {finished.map(game => {
                  const cover = publicGameImage(game);
                  return (
                    <div key={game.id} className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-lg transition-transform hover:scale-105"
                      style={{ border: `1px solid ${game.isPlatinum ? '#f59e0b' : V.border}` }}>
                      <div className="w-full h-full relative" style={{ background: V.card }}>
                        {cover && (
                          <img
                            src={cover}
                            className="w-full h-full object-cover"
                            alt={game.nome}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fb = e.currentTarget.nextElementSibling;
                              if (fb) fb.style.display = 'flex';
                            }}
                          />
                        )}
                        <div
                          className="w-full h-full items-center justify-center"
                          style={{ display: cover ? 'none' : 'flex' }}
                        >
                          <Gamepad2 className="w-8 h-8 opacity-30" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="text-xs font-black text-white leading-tight line-clamp-2">{game.nome}</div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {game.rating > 0 && <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500 text-white font-bold">{game.rating}⭐</span>}
                          {game.isPlatinum && <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-500 text-yellow-950 font-black tracking-wide">PLATINA</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-16 pb-8">
        <a href="/" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-transform hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${V.primary}, ${V.secondary})` }}>
          <Sparkles className="w-5 h-5" /> Crie o seu Backlog também
        </a>
      </div>
    </div>
  );
}
