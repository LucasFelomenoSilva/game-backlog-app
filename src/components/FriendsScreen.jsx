// src/components/FriendsScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, UserPlus, MessageCircle, Eye, Copy,
  Check, X, UserMinus, ChevronRight, Trophy, Clock,
  Star, Shield, Bell, Hash, Loader2, UserCheck, Gamepad2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  findUserByCode, sendFriendRequest, acceptFriendRequest,
  rejectFriendRequest, removeFriend, getSocialProfile, getFriendGamesData,
  subscribeToSocialProfile
} from '../services/socialService';
import FriendProfileModal from './FriendProfileModal';

export default function FriendsScreen({ currentUser, socialProfile, onOpenChat, onViewFriendProfile }) {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [friendsData, setFriendsData] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [profileModal, setProfileModal] = useState(null);

  const friends = socialProfile?.friends || [];
  const requests = socialProfile?.friendRequests || [];
  const myCode = socialProfile?.userCode || '';

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
          return { uid, profile, zerados, playing, totalGames: games.length };
        })
      );
      setFriendsData(results.filter(r => r.profile));
      setLoadingFriends(false);
    };
    fetchAll();
  }, [friends.length]);

  const handleSearch = async () => {
    const code = searchCode.trim().toUpperCase();
    if (!code.includes('#')) { toast.error('Use o formato: PALAVRA#1234'); return; }
    setSearching(true);
    setSearchResult(null);
    try {
      const found = await findUserByCode(code);
      if (!found) toast.error('Nenhum jogador encontrado com esse código.');
      else if (found.uid === currentUser.uid) toast.error('Esse é você mesmo! 😄');
      else setSearchResult(found);
    } catch (e) {
      toast.error('Erro ao buscar jogador.');
    } finally {
      setSearching(false);
    }
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
      setSearchResult(null);
      setSearchCode('');
    } catch (e) {
      toast.error('Erro ao enviar pedido.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAccept = async (fromUid) => {
    setProcessingRequest(fromUid);
    try {
      await acceptFriendRequest(currentUser.uid, fromUid);
      toast.success('Amizade aceita! 🎮');
    } catch (e) {
      toast.error('Erro ao aceitar.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async (fromUid) => {
    setProcessingRequest(fromUid);
    try {
      await rejectFriendRequest(currentUser.uid, fromUid);
      toast.success('Pedido recusado.');
    } catch (e) {
      toast.error('Erro ao recusar.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRemoveFriend = async (friendUid, friendName) => {
    if (!window.confirm(`Remover ${friendName} dos seus amigos?`)) return;
    try {
      await removeFriend(currentUser.uid, friendUid);
      toast.success('Amigo removido.');
    } catch (e) {
      toast.error('Erro ao remover.');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(myCode);
    setCodeCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const isAlreadyFriend = searchResult && friends.includes(searchResult.uid);
  const alreadySentRequest = searchResult &&
    (searchResult.friendRequests || []).some(r => r.fromUid === currentUser.uid);

  return (
    <>
      {/* ── Modal de Perfil do Amigo (renderizado acima de tudo) ── */}
      {profileModal && (
        <FriendProfileModal
          friendUid={profileModal.uid}
          friendProfile={profileModal.profile}
          onClose={() => setProfileModal(null)}
          onOpenChat={onOpenChat}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white pb-24 pt-6">
        <div className="max-w-md mx-auto px-4">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Amigos
                </h1>
                <p className="text-gray-400 text-sm">Conecte-se com outros jogadores</p>
              </div>
            </div>

            {/* Meu Código */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Meu Código
                    </p>
                    <p className="text-xl font-black text-cyan-300 font-mono tracking-widest">{myCode}</p>
                    <p className="text-xs text-gray-500 mt-1">Compartilhe para receber pedidos</p>
                  </div>
                  <button
                    onClick={copyCode}
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      codeCopied
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:border-cyan-500/50 hover:text-cyan-400'
                    }`}
                  >
                    {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-800/50 rounded-2xl p-1">
            {[
              { id: 'friends', label: `Amigos (${friends.length})`, icon: Users },
              { id: 'requests', label: `Pedidos${requests.length > 0 ? ` (${requests.length})` : ''}`, icon: Bell },
              { id: 'add', label: 'Adicionar', icon: UserPlus },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id === 'friends' ? friends.length : tab.id === 'requests' ? requests.length : '+'}</span>
                </button>
              );
            })}
          </div>

          {/* Tab: Amigos */}
          {activeTab === 'friends' && (
            <div className="space-y-3">
              {loadingFriends ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : friendsData.length === 0 ? (
                <div className="text-center py-16 bg-gray-800/30 rounded-3xl border border-gray-700/50">
                  <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-400 font-semibold">Nenhum amigo ainda</p>
                  <p className="text-gray-600 text-sm mt-1">Use o código de alguém para conectar!</p>
                </div>
              ) : (
                friendsData.map(({ uid, profile, zerados, playing, totalGames }) => (
                  <div key={uid} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4 hover:border-gray-600/70 transition-all">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-700/50 flex-shrink-0">
                          {profile.photoURL ? (
                            <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg font-bold">
                              {profile.displayName?.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate">{profile.displayName}</p>
                          <p className="text-xs text-gray-500 font-mono">{profile.userCode}</p>
                          {playing && (
                            <p className="text-xs text-green-400 truncate mt-0.5">
                              🎮 Jogando: {playing.nome}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-yellow-400 flex items-center gap-1">
                              <Trophy className="w-3 h-3" /> {zerados} zerados
                            </span>
                            <span className="text-xs text-gray-500">{totalGames} jogos</span>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => setProfileModal({ uid, profile })}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 transition-all hover:scale-110"
                            title="Ver perfil"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => onOpenChat(uid, profile)}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg border border-green-500/30 transition-all hover:scale-110"
                            title="Chat"
                          >
                            <MessageCircle className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                            onClick={() => handleRemoveFriend(uid, profile.displayName)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-all hover:scale-110"
                            title="Remover amigo"
                          >
                            <UserMinus className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab: Pedidos */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-center py-16 bg-gray-800/30 rounded-3xl border border-gray-700/50">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-400 font-semibold">Nenhum pedido pendente</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.fromUid} className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-700/50 flex-shrink-0">
                        {req.fromPhoto ? (
                          <img src={req.fromPhoto} alt={req.fromName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-lg font-bold">
                            {req.fromName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white">{req.fromName}</p>
                        <p className="text-xs text-gray-500 font-mono">{req.fromCode}</p>
                        <p className="text-xs text-gray-400 mt-1">Quer ser seu amigo!</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(req.fromUid)}
                          disabled={processingRequest === req.fromUid}
                          className="p-2.5 bg-green-500/20 hover:bg-green-500/30 rounded-xl border border-green-500/40 transition-all hover:scale-110"
                          title="Aceitar"
                        >
                          {processingRequest === req.fromUid
                            ? <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
                            : <Check className="w-4 h-4 text-green-400" />
                          }
                        </button>
                        <button
                          onClick={() => handleReject(req.fromUid)}
                          disabled={processingRequest === req.fromUid}
                          className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition-all hover:scale-110"
                          title="Recusar"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab: Adicionar */}
          {activeTab === 'add' && (
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative bg-gray-800/80 rounded-2xl p-5 border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-gray-200">Buscar por Código</h3>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={searchCode}
                        onChange={e => setSearchCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="NEON#4821"
                        className="w-full pl-9 pr-3 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white font-mono placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      disabled={searching || !searchCode.trim()}
                      className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold disabled:opacity-50 transition-all"
                    >
                      {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Peça o código para seu amigo (ex: CYBER#3491) e insira aqui.
                  </p>
                </div>
              </div>

              {/* Resultado da Busca */}
              {searchResult && (
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                  <div className="relative bg-gray-800/90 rounded-2xl p-5 border border-cyan-500/30">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-500/50">
                        {searchResult.photoURL ? (
                          <img src={searchResult.photoURL} alt={searchResult.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold">
                            {searchResult.displayName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-black text-white">{searchResult.displayName}</p>
                        <p className="text-sm text-cyan-400 font-mono">{searchResult.userCode}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {searchResult.friends?.length || 0} amigos
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      {isAlreadyFriend ? (
                        <div className="py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-center text-green-400 font-bold text-sm flex items-center justify-center gap-2">
                          <UserCheck className="w-4 h-4" /> Já são amigos!
                        </div>
                      ) : alreadySentRequest ? (
                        <div className="py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center text-yellow-400 font-bold text-sm">
                          ⏳ Pedido já enviado
                        </div>
                      ) : (
                        <button
                          onClick={handleSendRequest}
                          disabled={sendingRequest}
                          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl font-bold text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          {sendingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                          Enviar Pedido de Amizade
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}