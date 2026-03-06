// src/components/FriendCompare.jsx — Comparação lado a lado com amigo
import React, { useState, useEffect, useMemo } from 'react';
import { X, Trophy, Star, Clock, Gamepad2, Heart, Zap, Swords } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getFriendGamesData } from '../services/socialService';

function StatBar({ myVal, friendVal, label, color, format = (v) => v }) {
  const { theme: V } = useTheme();
  const total = myVal + friendVal;
  const myPct = total > 0 ? (myVal / total) * 100 : 50;
  const iWin = myVal > friendVal;
  const tie = myVal === friendVal;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-black" style={{ color: iWin ? color : V.muted }}>{format(myVal)}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: V.low }}>{label}</span>
        <span className="text-sm font-black" style={{ color: !iWin && !tie ? color : V.muted }}>{format(friendVal)}</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden flex" style={{ background: V.faint }}>
        <div className="h-full rounded-l-full transition-all duration-1000" style={{ width: `${myPct}%`, background: `linear-gradient(to right, ${color}, ${color}99)` }} />
        <div className="h-full rounded-r-full transition-all duration-1000 ml-auto" style={{ width: `${100 - myPct}%`, background: `${V.muted}40` }} />
      </div>
      {(iWin || (!iWin && !tie)) && (
        <div className="flex justify-end mt-0.5">
          <span className="text-[9px] font-black" style={{ color: iWin ? color : V.muted }}>
            {iWin ? '▲ você' : '▲ amigo'}
          </span>
        </div>
      )}
    </div>
  );
}

export default function FriendCompare({ myGames, myProfile, friendUid, friendProfile, onClose }) {
  const { theme: V } = useTheme();
  const [friendGames, setFriendGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFriendGamesData(friendUid).then(data => { setFriendGames(data); setLoading(false); });
  }, [friendUid]);

  const myStats = useMemo(() => {
    const z = myGames.filter(g => g.status === 'zerados');
    const r = z.filter(g => g.rating > 0);
    return {
      zerados: z.length,
      total: myGames.length,
      horas: myGames.reduce((s, g) => s + (parseInt(g.timeToBeat) || 0), 0),
      platinas: z.filter(g => g.isPlatinum).length,
      avgRating: r.length ? (r.reduce((s, g) => s + parseFloat(g.rating), 0) / r.length).toFixed(1) : 0,
      genres: z.reduce((acc, g) => { if (g.genre) acc[g.genre] = (acc[g.genre] || 0) + 1; return acc; }, {}),
    };
  }, [myGames]);

  const friendStats = useMemo(() => {
    const z = friendGames.filter(g => g.status === 'zerados');
    const r = z.filter(g => g.rating > 0);
    return {
      zerados: z.length,
      total: friendGames.length,
      horas: friendGames.reduce((s, g) => s + (parseInt(g.timeToBeat) || 0), 0),
      platinas: z.filter(g => g.isPlatinum).length,
      avgRating: r.length ? (r.reduce((s, g) => s + parseFloat(g.rating), 0) / r.length).toFixed(1) : 0,
      genres: z.reduce((acc, g) => { if (g.genre) acc[g.genre] = (acc[g.genre] || 0) + 1; return acc; }, {}),
    };
  }, [friendGames]);

  // Gêneros em comum
  const commonGenres = Object.keys(myStats.genres).filter(g => friendStats.genres[g]);

  // Quem está na frente?
  const myScore = [myStats.zerados > friendStats.zerados, myStats.platinas > friendStats.platinas, parseFloat(myStats.avgRating) > parseFloat(friendStats.avgRating)].filter(Boolean).length;
  const friendScore = [friendStats.zerados > myStats.zerados, friendStats.platinas > myStats.platinas, parseFloat(friendStats.avgRating) > parseFloat(myStats.avgRating)].filter(Boolean).length;
  const winner = myScore > friendScore ? 'me' : myScore < friendScore ? 'friend' : 'tie';

  const Avatar = ({ profile }) => (
    <div className="relative">
      <div className="w-14 h-14 rounded-2xl overflow-hidden" style={{ border: `2px solid ${V.border}` }}>
        {profile?.photoURL || profile?.photoBase64
          ? <img src={profile.photoBase64 || profile.photoURL} className="w-full h-full object-cover" alt="" />
          : <div className="w-full h-full flex items-center justify-center font-black text-white text-xl" style={{ background: V.grad }}>{profile?.displayName?.charAt(0)}</div>
        }
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col" style={{ background: V.card, border: `1px solid ${V.border}`, boxShadow: `0 0 80px ${V.glow}` }}>

        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${V.card2}, ${V.bg})`, borderBottom: `1px solid ${V.border}` }}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl z-10" style={{ background: V.faint, border: `1px solid ${V.border}` }}>
            <X className="w-4 h-4" style={{ color: V.muted }} />
          </button>

          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <Avatar profile={myProfile} />
              <p className="text-xs font-bold mt-1 truncate max-w-[80px]" style={{ color: V.text }}>{myProfile?.displayName?.split(' ')[0]}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl" style={{ background: V.grad }}>
                <Swords className="w-4 h-4 text-white" />
                <span className="text-xs font-black text-white">VS</span>
              </div>
              {winner !== 'tie' && !loading && (
                <span className="text-[10px] font-bold" style={{ color: winner === 'me' ? '#10b981' : V.accent }}>
                  {winner === 'me' ? '🏆 Você venceu!' : '⚔️ Amigo venceu!'}
                </span>
              )}
            </div>
            <div className="text-center">
              <Avatar profile={friendProfile} />
              <p className="text-xs font-bold mt-1 truncate max-w-[80px]" style={{ color: V.text }}>{friendProfile?.displayName?.split(' ')[0]}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Gamepad2 className="w-10 h-10 animate-pulse" style={{ color: V.muted }} />
            </div>
          ) : (
            <div className="space-y-1">
              <StatBar myVal={myStats.zerados} friendVal={friendStats.zerados} label="Zerados" color="#10b981" />
              <StatBar myVal={myStats.horas} friendVal={friendStats.horas} label="Horas" color={V.primary} format={v => `${v}h`} />
              <StatBar myVal={myStats.platinas} friendVal={friendStats.platinas} label="Platinas" color="#f59e0b" />
              <StatBar myVal={parseFloat(myStats.avgRating) || 0} friendVal={parseFloat(friendStats.avgRating) || 0} label="Nota Média" color={V.accent} format={v => v > 0 ? v.toFixed(1) : '—'} />
              <StatBar myVal={myStats.total} friendVal={friendStats.total} label="Total de Jogos" color={V.soft} />

              {commonGenres.length > 0 && (
                <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${V.border}` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4" style={{ color: V.accent }} />
                    <p className="text-xs font-black uppercase tracking-wider" style={{ color: V.muted }}>Gêneros em comum</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commonGenres.slice(0, 6).map(g => (
                      <span key={g} className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: V.faint, color: V.soft, border: `1px solid ${V.border}` }}>
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}