// src/components/FriendsScreen.jsx — Redesign roxo/violeta
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Search, UserPlus, MessageCircle, Eye, Copy,
  Check, X, UserMinus, Trophy, Bell, Hash, Loader2,
  UserCheck, Gamepad2, Star, Clock, Flame, Crown,
  ChevronRight, BarChart3, Activity, Medal,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  findUserByCode, sendFriendRequest, acceptFriendRequest,
  rejectFriendRequest, removeFriend, getSocialProfile, getFriendGamesData,
} from '../services/socialService';
import FriendProfileModal from './FriendProfileModal';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const V = {
  bg:     '#09060f',
  card:   '#130e22',
  card2:  '#1a1330',
  border: 'rgba(139,92,246,0.18)',
  faint:  'rgba(139,92,246,0.08)',
  violet: '#8b5cf6',
  indigo: '#6366f1',
  pink:   '#ec4899',
  soft:   '#a78bfa',
  glow:   'rgba(139,92,246,0.35)',
  text:   '#f5f0ff',
  muted:  'rgba(245,240,255,0.50)',
  low:    'rgba(245,240,255,0.22)',
};

// ─── Tab ids ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'friends',  label: 'Amigos',    icon: Users    },
  { id: 'ranking',  label: 'Ranking',   icon: Crown    },
  { id: 'feed',     label: 'Feed',      icon: Activity },
  { id: 'requests', label: 'Pedidos',   icon: Bell     },
  { id: 'add',      label: 'Buscar',    icon: Search   },
];

// ─── Avatar helper ─────────────────────────────────────────────────────────────
function Avatar({ profile, size = 12, ring = true }) {
  const initial = profile?.displayName?.charAt(0) || '?';
  return (
    <div className={`w-${size} h-${size} rounded-xl overflow-hidden flex-shrink-0`}
      style={{ border: ring ? `2px solid ${V.border}` : 'none', background: V.faint }}>
      {profile?.photoURL
        ? <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center text-sm font-black text-white"
            style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})` }}>{initial}</div>
      }
    </div>
  );
}

// ─── FriendCard ────────────────────────────────────────────────────────────────
function FriendCard({ uid, profile, zerados, playing, totalGames, rank, onViewProfile, onOpenChat, onRemove }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"
        style={{ background: `linear-gradient(135deg, ${V.violet}40, ${V.indigo}40)` }} />
      <div className="relative rounded-2xl p-4 transition-all"
        style={{ background: V.card, border: `1px solid ${V.border}` }}>
        <div className="flex items-center gap-3">
          {rank !== undefined && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: rank === 0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : rank === 1 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : rank === 2 ? 'linear-gradient(135deg,#b45309,#92400e)' : V.faint,
                border: `1px solid ${V.border}`,
              }}>
              <span className="text-[10px] font-black text-white">#{rank + 1}</span>
            </div>
          )}
          <Avatar profile={profile} size={12} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: V.text }}>{profile?.displayName}</p>
            <p className="text-[10px] font-mono" style={{ color: V.muted }}>{profile?.userCode}</p>
            {playing && (
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />
                <p className="text-[10px] truncate" style={{ color: '#10b981' }}>
                  {playing.nome}
                </p>
              </div>
            )}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#f59e0b' }}>
                <Trophy className="w-2.5 h-2.5" />{zerados}
              </span>
              <span className="text-[10px]" style={{ color: V.muted }}>{totalGames} jogos</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => onViewProfile(uid, profile)}
              className="p-2 rounded-xl transition-all hover:scale-110"
              style={{ background: `${V.violet}25`, border: `1px solid ${V.violet}40` }}>
              <Eye className="w-3.5 h-3.5" style={{ color: V.soft }} />
            </button>
            <button onClick={() => onOpenChat(uid, profile)}
              className="p-2 rounded-xl transition-all hover:scale-110"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            {onRemove && (
              <button onClick={() => onRemove(uid, profile?.displayName)}
                className="p-2 rounded-xl transition-all hover:scale-110"
                style={{ background: 'rgba(244,63,94,0.10)', border: '1px solid rgba(244,63,94,0.20)' }}>
                <UserMinus className="w-3.5 h-3.5 text-rose-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FriendsScreen({ currentUser, socialProfile, onOpenChat, onViewFriendProfile }) {
  const [activeTab, setActiveTab]           = useState('friends');
  const [searchCode, setSearchCode]         = useState('');
  const [searchResult, setSearchResult]     = useState(null);
  const [searching, setSearching]           = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [friendsData, setFriendsData]       = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [codeCopied, setCodeCopied]         = useState(false);
  const [processingReq, setProcessingReq]   = useState(null);
  const [profileModal, setProfileModal]     = useState(null);

  // Busca pública — qualquer usuário pelo código
  const [publicSearchCode, setPublicSearchCode] = useState('');
  const [publicResult, setPublicResult]         = useState(null);
  const [publicSearching, setPublicSearching]   = useState(false);

  const friends  = socialProfile?.friends         || [];
  const requests = socialProfile?.friendRequests  || [];
  const myCode   = socialProfile?.userCode        || '';

  // Carrega dados dos amigos
  useEffect(() => {
    if (!friends.length) { setFriendsData([]); return; }
    setLoadingFriends(true);
    const fetchAll = async () => {
      const results = await Promise.all(
        friends.map(async (uid) => {
          const [profile, games] = await Promise.all([
            getSocialProfile(uid),
            getFriendGamesData(uid),
          ]);
          const zerados = games.filter(g => g.status === 'zerados').length;
          const playing = games.find(g => g.status === 'playing');
          const avgRating = (() => {
            const rated = games.filter(g => g.status === 'zerados' && g.rating > 0);
            return rated.length ? (rated.reduce((s, g) => s + parseFloat(g.rating), 0) / rated.length).toFixed(1) : null;
          })();
          const lastFinished = games
            .filter(g => g.status === 'zerados' && g.finishedDate)
            .sort((a, b) => new Date(b.finishedDate) - new Date(a.finishedDate))[0] || null;
          return { uid, profile, zerados, playing, totalGames: games.length, avgRating, lastFinished, games };
        })
      );
      setFriendsData(results.filter(r => r.profile));
      setLoadingFriends(false);
    };
    fetchAll();
  }, [friends.length]);

  // Ranking — amigos ordenados por zerados
  const ranking = useMemo(() =>
    [...friendsData].sort((a, b) => b.zerados - a.zerados)
  , [friendsData]);

  // Feed — atividade recente de todos os amigos
  const feed = useMemo(() => {
    const events = [];
    friendsData.forEach(({ uid, profile, lastFinished }) => {
      if (lastFinished) {
        events.push({ uid, profile, game: lastFinished, type: 'finished', ts: new Date(lastFinished.finishedDate) });
      }
    });
    return events.sort((a, b) => b.ts - a.ts).slice(0, 20);
  }, [friendsData]);

  // Busca por código (pedido de amizade)
  const handleSearch = async () => {
    const code = searchCode.trim().toUpperCase();
    if (!code.includes('#')) { toast.error('Use o formato: CYBER#1234'); return; }
    setSearching(true); setSearchResult(null);
    try {
      const found = await findUserByCode(code);
      if (!found) toast.error('Nenhum jogador com esse código.');
      else if (found.uid === currentUser.uid) toast.error('Esse sou eu! 😄');
      else setSearchResult(found);
    } catch { toast.error('Erro ao buscar.'); }
    finally { setSearching(false); }
  };

  // Busca pública — ver perfil de qualquer jogador
  const handlePublicSearch = async () => {
    const code = publicSearchCode.trim().toUpperCase();
    if (!code.includes('#')) { toast.error('Use o formato: WORD#1234'); return; }
    setPublicSearching(true); setPublicResult(null);
    try {
      const found = await findUserByCode(code);
      if (!found) toast.error('Jogador não encontrado.');
      else setPublicResult(found);
    } catch { toast.error('Erro ao buscar.'); }
    finally { setPublicSearching(false); }
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;
    setSendingRequest(true);
    try {
      await sendFriendRequest(
        { uid: currentUser.uid, displayName: currentUser.displayName, userCode: myCode, photoURL: currentUser.photoURL },
        searchResult.uid
      );
      toast.success(`Pedido enviado para ${searchResult.displayName}!`);
      setSearchResult(null); setSearchCode('');
    } catch { toast.error('Erro ao enviar.'); }
    finally { setSendingRequest(false); }
  };

  const handleAccept = async (fromUid) => {
    setProcessingReq(fromUid);
    try { await acceptFriendRequest(currentUser.uid, fromUid); toast.success('Amizade aceita! 🎮'); }
    catch { toast.error('Erro.'); }
    finally { setProcessingReq(null); }
  };

  const handleReject = async (fromUid) => {
    setProcessingReq(fromUid);
    try { await rejectFriendRequest(currentUser.uid, fromUid); toast.success('Pedido recusado.'); }
    catch { toast.error('Erro.'); }
    finally { setProcessingReq(null); }
  };

  const handleRemove = async (friendUid, friendName) => {
    if (!window.confirm(`Remover ${friendName}?`)) return;
    try { await removeFriend(currentUser.uid, friendUid); toast.success('Amigo removido.'); }
    catch { toast.error('Erro.'); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    setCodeCopied(true); toast.success('Código copiado!');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const isAlreadyFriend  = searchResult && friends.includes(searchResult.uid);
  const alreadySentReq   = searchResult && (searchResult.friendRequests || []).some(r => r.fromUid === currentUser.uid);

  const openModal = (uid, profile) => setProfileModal({ uid, profile });

  return (
    <>
      {profileModal && (
        <FriendProfileModal
          friendUid={profileModal.uid}
          friendProfile={profileModal.profile}
          onClose={() => setProfileModal(null)}
          onOpenChat={onOpenChat}
        />
      )}

      <div className="min-h-screen pb-24 pt-6" style={{ background: V.bg }}>
        {/* Ambient glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${V.glow} 0%, transparent 70%)`, opacity: 0.45 }} />

        <div className="relative max-w-md mx-auto px-4">

          {/* ── Header ── */}
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})`, boxShadow: `0 4px 20px ${V.glow}` }}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black" style={{ color: V.text }}>Social</h1>
                <p className="text-xs" style={{ color: V.muted }}>Conecte com outros jogadores</p>
              </div>
            </div>

            {/* Meu Código */}
            <div className="relative rounded-2xl p-4 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${V.card} 0%, ${V.card2} 100%)`, border: `1px solid ${V.border}` }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
                style={{ background: V.violet, opacity: 0.15 }} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1" style={{ color: V.muted }}>
                    <Hash className="w-3 h-3" />Meu Código
                  </p>
                  <p className="text-2xl font-black font-mono tracking-widest" style={{ color: V.soft }}>{myCode}</p>
                  <p className="text-[10px] mt-1" style={{ color: V.low }}>Compartilhe com amigos</p>
                </div>
                <button onClick={copyCode}
                  className="p-3 rounded-xl transition-all duration-300"
                  style={{
                    background: codeCopied ? 'rgba(16,185,129,0.2)' : V.faint,
                    border: `1px solid ${codeCopied ? 'rgba(16,185,129,0.4)' : V.border}`,
                  }}>
                  {codeCopied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" style={{ color: V.muted }} />}
                </button>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1 p-1 rounded-2xl mb-5 overflow-x-auto"
            style={{ background: V.card, border: `1px solid ${V.border}`, scrollbarWidth: 'none' }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const badge = tab.id === 'requests' ? requests.length : 0;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="relative flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300"
                  style={{
                    background: isActive ? `linear-gradient(135deg, ${V.violet}, ${V.indigo})` : 'transparent',
                    color: isActive ? 'white' : V.muted,
                    boxShadow: isActive ? `0 4px 16px ${V.glow}` : 'none',
                  }}>
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {badge > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white animate-pulse"
                      style={{ background: '#f43f5e' }}>{badge}</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── TAB: AMIGOS ── */}
          {activeTab === 'friends' && (
            <div className="space-y-3">
              {loadingFriends ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: V.violet }} />
                </div>
              ) : friendsData.length === 0 ? (
                <div className="text-center py-16 rounded-3xl"
                  style={{ background: V.card, border: `1px solid ${V.border}` }}>
                  <Gamepad2 className="w-14 h-14 mx-auto mb-4" style={{ color: V.low }} />
                  <p className="font-bold" style={{ color: V.muted }}>Nenhum amigo ainda</p>
                  <p className="text-sm mt-1" style={{ color: V.low }}>Use a aba Buscar para encontrar jogadores</p>
                </div>
              ) : (
                friendsData.map(({ uid, profile, zerados, playing, totalGames }) => (
                  <FriendCard key={uid} uid={uid} profile={profile} zerados={zerados}
                    playing={playing} totalGames={totalGames}
                    onViewProfile={openModal} onOpenChat={onOpenChat}
                    onRemove={handleRemove} />
                ))
              )}
            </div>
          )}

          {/* ── TAB: RANKING ── */}
          {activeTab === 'ranking' && (
            <div className="space-y-3">
              <div className="rounded-2xl p-4 mb-4"
                style={{ background: `linear-gradient(135deg, ${V.card}, ${V.card2})`, border: `1px solid ${V.border}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4" style={{ color: V.soft }} />
                  <span className="text-sm font-black" style={{ color: V.text }}>Ranking de Amigos</span>
                </div>
                <p className="text-xs" style={{ color: V.muted }}>Ordenado por jogos zerados</p>
              </div>

              {loadingFriends ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" style={{ color: V.violet }} /></div>
              ) : ranking.length === 0 ? (
                <div className="text-center py-12 rounded-2xl" style={{ background: V.card, border: `1px solid ${V.border}` }}>
                  <Crown className="w-12 h-12 mx-auto mb-3" style={{ color: V.low }} />
                  <p style={{ color: V.muted }}>Adicione amigos para ver o ranking</p>
                </div>
              ) : (
                <>
                  {/* Pódio top 3 */}
                  {ranking.length >= 2 && (
                    <div className="flex items-end justify-center gap-3 mb-4 px-2">
                      {/* 2º */}
                      {ranking[1] && (
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden" style={{ border: '2px solid #94a3b8' }}>
                              {ranking[1].profile?.photoURL
                                ? <img src={ranking[1].profile.photoURL} className="w-full h-full object-cover" alt="" />
                                : <div className="w-full h-full flex items-center justify-center text-lg font-black text-white"
                                    style={{ background: 'linear-gradient(135deg,#94a3b8,#64748b)' }}>
                                    {ranking[1].profile?.displayName?.charAt(0)}
                                  </div>
                              }
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                              style={{ background: 'linear-gradient(135deg,#94a3b8,#64748b)' }}>2</div>
                          </div>
                          <div className="text-center">
                            <p className="text-[11px] font-bold truncate max-w-[80px]" style={{ color: V.text }}>{ranking[1].profile?.displayName}</p>
                            <p className="text-[10px]" style={{ color: '#f59e0b' }}>🏆 {ranking[1].zerados}</p>
                          </div>
                          <div className="w-full h-14 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, rgba(148,163,184,0.2), rgba(100,116,139,0.2))', border: '1px solid rgba(148,163,184,0.3)' }}>
                            <span className="text-sm font-black text-slate-400">#2</span>
                          </div>
                        </div>
                      )}
                      {/* 1º */}
                      {ranking[0] && (
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div className="text-2xl">👑</div>
                          <div className="relative">
                            <div className="absolute -inset-1 rounded-2xl blur opacity-60" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }} />
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden" style={{ border: '2px solid #f59e0b' }}>
                              {ranking[0].profile?.photoURL
                                ? <img src={ranking[0].profile.photoURL} className="w-full h-full object-cover" alt="" />
                                : <div className="w-full h-full flex items-center justify-center text-xl font-black text-white"
                                    style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                                    {ranking[0].profile?.displayName?.charAt(0)}
                                  </div>
                              }
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black truncate max-w-[90px]" style={{ color: V.text }}>{ranking[0].profile?.displayName}</p>
                            <p className="text-[11px]" style={{ color: '#f59e0b' }}>🏆 {ranking[0].zerados} zerados</p>
                          </div>
                          <div className="w-full h-20 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.2))', border: '1px solid rgba(245,158,11,0.4)' }}>
                            <span className="text-lg font-black" style={{ color: '#f59e0b' }}>#1</span>
                          </div>
                        </div>
                      )}
                      {/* 3º */}
                      {ranking[2] && (
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden" style={{ border: '2px solid #b45309' }}>
                              {ranking[2].profile?.photoURL
                                ? <img src={ranking[2].profile.photoURL} className="w-full h-full object-cover" alt="" />
                                : <div className="w-full h-full flex items-center justify-center text-lg font-black text-white"
                                    style={{ background: 'linear-gradient(135deg,#b45309,#92400e)' }}>
                                    {ranking[2].profile?.displayName?.charAt(0)}
                                  </div>
                              }
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                              style={{ background: 'linear-gradient(135deg,#b45309,#92400e)' }}>3</div>
                          </div>
                          <div className="text-center">
                            <p className="text-[11px] font-bold truncate max-w-[80px]" style={{ color: V.text }}>{ranking[2].profile?.displayName}</p>
                            <p className="text-[10px]" style={{ color: '#f59e0b' }}>🏆 {ranking[2].zerados}</p>
                          </div>
                          <div className="w-full h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, rgba(180,83,9,0.2), rgba(146,64,14,0.2))', border: '1px solid rgba(180,83,9,0.3)' }}>
                            <span className="text-sm font-black" style={{ color: '#b45309' }}>#3</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lista completa */}
                  <div className="space-y-2">
                    {ranking.map((fd, i) => (
                      <div key={fd.uid} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                        style={{ background: V.card, border: `1px solid ${V.border}` }}
                        onClick={() => openModal(fd.uid, fd.profile)}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : i === 1 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : i === 2 ? 'linear-gradient(135deg,#b45309,#92400e)' : V.faint,
                            border: `1px solid ${V.border}`,
                          }}>
                          <span className="text-[10px] font-black text-white">#{i + 1}</span>
                        </div>
                        <Avatar profile={fd.profile} size={9} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: V.text }}>{fd.profile?.displayName}</p>
                          <p className="text-[10px]" style={{ color: V.muted }}>{fd.totalGames} jogos</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black" style={{ color: '#f59e0b' }}>{fd.zerados}</span>
                          <span className="text-[9px]" style={{ color: V.low }}>zerados</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── TAB: FEED ── */}
          {activeTab === 'feed' && (
            <div className="space-y-3">
              <div className="rounded-2xl p-4"
                style={{ background: `linear-gradient(135deg, ${V.card}, ${V.card2})`, border: `1px solid ${V.border}` }}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" style={{ color: V.soft }} />
                  <span className="text-sm font-black" style={{ color: V.text }}>Atividade Recente</span>
                </div>
              </div>

              {loadingFriends ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" style={{ color: V.violet }} /></div>
              ) : feed.length === 0 ? (
                <div className="text-center py-12 rounded-2xl" style={{ background: V.card, border: `1px solid ${V.border}` }}>
                  <Activity className="w-12 h-12 mx-auto mb-3" style={{ color: V.low }} />
                  <p style={{ color: V.muted }}>Nenhuma atividade recente</p>
                  <p className="text-sm mt-1" style={{ color: V.low }}>Quando seus amigos zerarem jogos, aparece aqui</p>
                </div>
              ) : (
                feed.map((event, i) => (
                  <div key={i}
                    className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                    style={{ background: V.card, border: `1px solid ${V.border}` }}
                    onClick={() => openModal(event.uid, event.profile)}>

                    {/* Avatar com badge ação */}
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-xl overflow-hidden" style={{ border: `2px solid ${V.border}` }}>
                        {event.profile?.photoURL
                          ? <img src={event.profile.photoURL} className="w-full h-full object-cover" alt="" />
                          : <div className="w-full h-full flex items-center justify-center text-sm font-black text-white"
                              style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})` }}>
                              {event.profile?.displayName?.charAt(0)}
                            </div>
                        }
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: `2px solid ${V.bg}` }}>
                        <span className="text-[8px]">✅</span>
                      </div>
                    </div>

                    {/* Miniatura do jogo */}
                    <div className="w-9 h-12 rounded-xl overflow-hidden flex-shrink-0" style={{ border: `1px solid ${V.border}` }}>
                      {event.game.imageBase64
                        ? <img src={event.game.imageBase64} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center" style={{ background: V.faint }}>
                            <Gamepad2 className="w-4 h-4" style={{ color: V.muted }} />
                          </div>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ color: V.muted }}>
                        <span className="font-black" style={{ color: V.text }}>{event.profile?.displayName}</span>
                        {' '}zerou
                      </p>
                      <p className="text-sm font-black truncate" style={{ color: V.soft }}>{event.game.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {event.game.rating > 0 && (
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-black" style={{ color: '#f59e0b' }}>{event.game.rating}</span>
                          </div>
                        )}
                        <span className="text-[10px]" style={{ color: V.low }}>
                          {event.ts.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: V.low }} />
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── TAB: PEDIDOS ── */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-center py-16 rounded-3xl" style={{ background: V.card, border: `1px solid ${V.border}` }}>
                  <Bell className="w-14 h-14 mx-auto mb-4" style={{ color: V.low }} />
                  <p className="font-bold" style={{ color: V.muted }}>Nenhum pedido pendente</p>
                </div>
              ) : (
                requests.map(req => (
                  <div key={req.fromUid} className="p-4 rounded-2xl" style={{ background: V.card, border: `1px solid ${V.border}` }}>
                    <div className="flex items-center gap-3">
                      <Avatar profile={{ displayName: req.fromName, photoURL: req.fromPhoto }} size={12} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm" style={{ color: V.text }}>{req.fromName}</p>
                        <p className="text-[10px] font-mono" style={{ color: V.muted }}>{req.fromCode}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: V.low }}>Quer ser seu amigo!</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAccept(req.fromUid)} disabled={processingReq === req.fromUid}
                          className="p-2.5 rounded-xl transition-all hover:scale-110"
                          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)' }}>
                          {processingReq === req.fromUid
                            ? <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                            : <Check className="w-4 h-4 text-emerald-400" />
                          }
                        </button>
                        <button onClick={() => handleReject(req.fromUid)} disabled={processingReq === req.fromUid}
                          className="p-2.5 rounded-xl transition-all hover:scale-110"
                          style={{ background: 'rgba(244,63,94,0.10)', border: '1px solid rgba(244,63,94,0.25)' }}>
                          <X className="w-4 h-4 text-rose-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── TAB: BUSCAR ── */}
          {activeTab === 'add' && (
            <div className="space-y-4">

              {/* Busca para adicionar amigo */}
              <div className="rounded-2xl p-5" style={{ background: V.card, border: `1px solid ${V.border}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <UserPlus className="w-4 h-4" style={{ color: V.soft }} />
                  <span className="text-sm font-black" style={{ color: V.text }}>Adicionar Amigo</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: V.muted }} />
                    <input type="text" value={searchCode}
                      onChange={e => setSearchCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="CYBER#1234"
                      className="w-full pl-9 pr-3 py-3 rounded-xl text-sm font-mono outline-none"
                      style={{ background: V.faint, border: `1px solid ${V.border}`, color: V.text, fontSize: 16 }} />
                  </div>
                  <button onClick={handleSearch} disabled={searching || !searchCode.trim()}
                    className="px-4 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-40 hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})`, boxShadow: `0 4px 16px ${V.glow}` }}>
                    {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                </div>

                {searchResult && (
                  <div className="mt-4 p-4 rounded-xl" style={{ background: V.faint, border: `1px solid ${V.border}` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar profile={searchResult} size={12} />
                      <div>
                        <p className="font-black" style={{ color: V.text }}>{searchResult.displayName}</p>
                        <p className="text-xs font-mono" style={{ color: V.muted }}>{searchResult.userCode}</p>
                      </div>
                    </div>
                    {isAlreadyFriend ? (
                      <div className="py-2.5 text-center text-sm font-bold text-emerald-400 rounded-xl"
                        style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)' }}>
                        <UserCheck className="w-4 h-4 inline mr-1" />Já são amigos!
                      </div>
                    ) : alreadySentReq ? (
                      <div className="py-2.5 text-center text-sm font-bold rounded-xl"
                        style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                        ⏳ Pedido já enviado
                      </div>
                    ) : (
                      <button onClick={handleSendRequest} disabled={sendingRequest}
                        className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                        style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})`, boxShadow: `0 4px 16px ${V.glow}` }}>
                        {sendingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        Enviar Pedido de Amizade
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: V.border }} />
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: V.low }}>ou</span>
                <div className="flex-1 h-px" style={{ background: V.border }} />
              </div>

              {/* Busca pública — ver perfil de qualquer jogador */}
              <div className="rounded-2xl p-5" style={{ background: V.card, border: `1px solid ${V.border}` }}>
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4" style={{ color: V.soft }} />
                  <span className="text-sm font-black" style={{ color: V.text }}>Ver Perfil Público</span>
                </div>
                <p className="text-xs mb-3" style={{ color: V.muted }}>Veja o perfil de qualquer jogador, mesmo sem ser amigo</p>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: V.muted }} />
                    <input type="text" value={publicSearchCode}
                      onChange={e => setPublicSearchCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handlePublicSearch()}
                      placeholder="NEON#7821"
                      className="w-full pl-9 pr-3 py-3 rounded-xl text-sm font-mono outline-none"
                      style={{ background: V.faint, border: `1px solid ${V.border}`, color: V.text, fontSize: 16 }} />
                  </div>
                  <button onClick={handlePublicSearch} disabled={publicSearching || !publicSearchCode.trim()}
                    className="px-4 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-40 hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${V.pink}, ${V.violet})` }}>
                    {publicSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {publicResult && (
                  <button
                    className="w-full mt-4 p-4 rounded-xl text-left transition-all hover:scale-[1.01]"
                    style={{ background: V.faint, border: `1px solid ${V.border}` }}
                    onClick={() => openModal(publicResult.uid || publicResult.id, publicResult)}>
                    <div className="flex items-center gap-3">
                      <Avatar profile={publicResult} size={12} />
                      <div className="flex-1">
                        <p className="font-black" style={{ color: V.text }}>{publicResult.displayName}</p>
                        <p className="text-xs font-mono" style={{ color: V.muted }}>{publicResult.userCode}</p>
                        <p className="text-xs mt-1" style={{ color: V.soft }}>{publicResult.friends?.length || 0} amigos</p>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
                        style={{ background: `linear-gradient(135deg, ${V.violet}, ${V.indigo})` }}>
                        <Eye className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-bold text-white">Ver Perfil</span>
                      </div>
                    </div>
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}