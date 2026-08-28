// src/components/CollabList.jsx — Listas colaborativas com amigos
import React, { useState, useEffect } from 'react';
import { X, Plus, Users, Gamepad2, Trash2, ThumbsUp, Link, Copy, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, updateDoc, doc, arrayUnion, serverTimestamp, query, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function CollabList({ currentUser, onClose }) {
  const { theme: V } = useTheme();
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [newGame, setNewGame] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(collection(db, 'collabLists'), where('members', 'array-contains', currentUser.uid));
    const unsub = onSnapshot(q, snap => {
      setLists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [currentUser?.uid]);

  const createList = async () => {
    if (!newListName.trim()) return;
    setCreating(true);
    try {
      await addDoc(collection(db, 'collabLists'), {
        name: newListName.trim(),
        createdBy: currentUser.uid,
        creatorName: currentUser.displayName,
        members: [currentUser.uid],
        memberNames: { [currentUser.uid]: currentUser.displayName },
        games: [],
        createdAt: serverTimestamp(),
      });
      toast.success('Lista criada!');
      setNewListName('');
    } catch { toast.error('Erro ao criar lista.'); }
    finally { setCreating(false); }
  };

  const addGame = async () => {
    if (!newGame.trim() || !selectedList) return;
    const game = { id: Date.now().toString(), name: newGame.trim(), addedBy: currentUser.displayName, votes: [], addedAt: new Date().toISOString() };
    try {
      await updateDoc(doc(db, 'collabLists', selectedList.id), { games: arrayUnion(game) });
      setNewGame('');
    } catch { toast.error('Erro ao adicionar jogo.'); }
  };

  const toggleVote = async (game) => {
    const list = lists.find(l => l.id === selectedList?.id);
    if (!list) return;
    const hasVoted = game.votes?.includes(currentUser.uid);
    const updatedGames = list.games.map(g =>
      g.id === game.id
        ? { ...g, votes: hasVoted ? g.votes.filter(v => v !== currentUser.uid) : [...(g.votes || []), currentUser.uid] }
        : g
    );
    try { await updateDoc(doc(db, 'collabLists', list.id), { games: updatedGames }); }
    catch { toast.error('Erro ao votar.'); }
  };

  const removeGame = async (game) => {
    const list = lists.find(l => l.id === selectedList?.id);
    if (!list) return;
    const updatedGames = list.games.filter(g => g.id !== game.id);
    try { await updateDoc(doc(db, 'collabLists', list.id), { games: updatedGames }); }
    catch { toast.error('Erro ao remover jogo.'); }
  };

  const copyInviteLink = (listId) => {
    navigator.clipboard.writeText(`${window.location.origin}?joinList=${listId}`);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const currentListData = selectedList ? lists.find(l => l.id === selectedList.id) : null;
  const sortedGames = currentListData?.games?.slice().sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0)) || [];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col" style={{ background: V.card, border: `1px solid ${V.border}`, boxShadow: `0 0 80px ${V.glow}` }}>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5" style={{ background: `linear-gradient(135deg, ${V.card2}, ${V.bg})`, borderBottom: `1px solid ${V.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: V.grad, boxShadow: `0 4px 16px ${V.glow}` }}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black" style={{ color: V.text }}>
                {currentListData ? currentListData.name : 'Listas Colaborativas'}
              </h2>
              <p className="text-xs" style={{ color: V.muted }}>
                {currentListData ? `${currentListData.games?.length || 0} jogos · ${currentListData.members?.length || 1} membro(s)` : 'Crie e compartilhe com amigos'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentListData && (
              <button onClick={() => copyInviteLink(currentListData.id)} className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: V.faint, border: `1px solid ${V.border}` }}>
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" style={{ color: V.muted }} />}
              </button>
            )}
            <button onClick={currentListData ? () => setSelectedList(null) : onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: V.faint, border: `1px solid ${V.border}` }}>
              <X className="w-4 h-4" style={{ color: V.muted }} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!currentListData ? (
            <>
              {/* Criar lista */}
              <div className="flex gap-2 mb-5">
                <input value={newListName} onChange={e => setNewListName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createList()}
                  placeholder="Nome da lista..."
                  className="flex-1 px-4 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: V.faint, border: `1px solid ${V.border}`, color: V.text, fontSize: 16 }} />
                <button onClick={createList} disabled={creating || !newListName.trim()}
                  className="px-4 py-2.5 rounded-xl font-bold text-white disabled:opacity-40"
                  style={{ background: V.grad }}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Listas existentes */}
              {lists.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: V.muted }} />
                  <p className="text-sm" style={{ color: V.muted }}>Nenhuma lista ainda</p>
                  <p className="text-xs mt-1" style={{ color: V.low }}>Crie uma e convide amigos!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lists.map(list => (
                    <button key={list.id} onClick={() => setSelectedList(list)}
                      className="w-full p-4 rounded-2xl text-left transition-all hover:scale-[1.01]"
                      style={{ background: V.faint, border: `1px solid ${V.border}` }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm" style={{ color: V.text }}>{list.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: V.muted }}>
                            {list.games?.length || 0} jogos · por {list.creatorName}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: V.card, border: `1px solid ${V.border}` }}>
                          <Users className="w-3 h-3" style={{ color: V.muted }} />
                          <span className="text-xs font-bold" style={{ color: V.muted }}>{list.members?.length || 1}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Adicionar jogo */}
              <div className="flex gap-2 mb-5">
                <input value={newGame} onChange={e => setNewGame(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addGame()}
                  placeholder="Adicionar jogo..."
                  className="flex-1 px-4 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: V.faint, border: `1px solid ${V.border}`, color: V.text, fontSize: 16 }} />
                <button onClick={addGame} disabled={!newGame.trim()}
                  className="px-4 py-2.5 rounded-xl font-bold text-white disabled:opacity-40"
                  style={{ background: V.grad }}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Jogos */}
              {sortedGames.length === 0 ? (
                <div className="text-center py-10">
                  <Gamepad2 className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: V.muted }} />
                  <p className="text-sm" style={{ color: V.muted }}>Nenhum jogo ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedGames.map((game, i) => {
                    const voted = game.votes?.includes(currentUser.uid);
                    return (
                      <div key={game.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: V.faint, border: `1px solid ${V.border}` }}>
                        <span className="text-xs font-black w-4" style={{ color: V.low }}>#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: V.text }}>{game.name}</p>
                          <p className="text-[10px]" style={{ color: V.low }}>por {game.addedBy}</p>
                        </div>
                        <button onClick={() => toggleVote(game)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all"
                          style={{ background: voted ? `${V.primary}25` : V.card, border: `1px solid ${voted ? V.primary : V.border}`, color: voted ? V.primary : V.muted }}>
                          <ThumbsUp className="w-3 h-3" />
                          <span className="text-[10px] font-black">{game.votes?.length || 0}</span>
                        </button>
                        {game.addedBy === currentUser.displayName && (
                          <button onClick={() => removeGame(game)} className="p-1.5 rounded-lg" style={{ background: 'rgba(244,63,94,0.1)' }}>
                            <Trash2 className="w-3 h-3 text-rose-400" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
