// src/components/ChatScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, MessageCircle, Loader2 } from 'lucide-react';
import { sendMessage, subscribeToChat, getChatId } from '../services/socialService';
import { toast } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

export default function ChatScreen({ currentUser, friendUid, friendProfile, onBack }) {
  const { theme } = useTheme(); // <-- Adicione isso
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const chatId = getChatId(currentUser.uid, friendUid);

  useEffect(() => {
    const unsub = subscribeToChat(chatId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText('');
    try {
      await sendMessage(
        chatId,
        currentUser.uid,
        currentUser.displayName,
        currentUser.photoURL || null,
        trimmed
      );
    } catch {
      toast.error('Erro ao enviar mensagem.');
      setText(trimmed);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  };

  // Agrupa mensagens por data
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = msg.createdAt ? formatDate(msg.createdAt) : 'Agora';
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <div 
  className="flex-shrink-0 backdrop-blur-xl border-b px-4 py-3 safe-area-top"
  style={{ backgroundColor: `${theme.card}F2`, borderColor: theme.border }} // F2 adiciona transparência
>
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="group p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-xl border border-gray-700/50 transition-all hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Friend info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-green-500/40 flex-shrink-0">
              {friendProfile?.photoURL ? (
                <img src={friendProfile.photoURL} alt={friendProfile.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-sm font-bold">
                  {friendProfile?.displayName?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-white text-sm">{friendProfile?.displayName}</p>
              <p className="text-xs text-gray-500 font-mono">{friendProfile?.userCode}</p>
            </div>
          </div>

          <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-xl">
            <MessageCircle className="w-5 h-5 text-green-400" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(75,85,99,0.5) transparent' }}>
        <div className="max-w-lg mx-auto space-y-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-gray-700">
                <MessageCircle className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400 font-semibold">Nenhuma mensagem ainda</p>
              <p className="text-gray-600 text-sm mt-1">Diga olá para {friendProfile?.displayName}!</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date}>
                {/* Separador de data */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-800"></div>
                  <span className="text-xs text-gray-600 px-3 py-1 bg-gray-800/50 rounded-full border border-gray-700/50">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-gray-800"></div>
                </div>

                {dayMessages.map((msg, i) => {
                  const isMe = msg.senderUid === currentUser.uid;
                  const prevMsg = dayMessages[i - 1];
                  const nextMsg = dayMessages[i + 1];
                  const sameAsPrev = prevMsg?.senderUid === msg.senderUid;
                  const sameAsNext = nextMsg?.senderUid === msg.senderUid;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${sameAsPrev ? 'mt-0.5' : 'mt-3'}`}
                    >
                      {/* Avatar do remetente */}
                      {!isMe && (
                        <div className={`w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 ${sameAsNext ? 'invisible' : ''}`}>
                          {msg.senderPhoto ? (
                            <img src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                              {msg.senderName?.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bolha */}
                      <div className={`max-w-[75%] group ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? `bg-gradient-to-br ${theme.tw.grad} text-white`
                            : 'bg-gray-800/80 text-gray-100 rounded-bl-md border border-gray-700/50'
                        } ${sameAsPrev && isMe ? 'rounded-tr-2xl' : ''} ${sameAsPrev && !isMe ? 'rounded-tl-2xl' : ''}`}>
                          {msg.text}
                        </div>
                        {!sameAsNext && (
                          <span className="text-[10px] text-gray-600 mt-1 px-1">
                            {formatTime(msg.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div 
  className="flex-shrink-0 backdrop-blur-xl border-b px-4 py-3 safe-area-top"
  style={{ backgroundColor: `${theme.card}F2`, borderColor: theme.border }} // F2 adiciona transparência
>
        <div className="max-w-lg mx-auto flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Mensagem para ${friendProfile?.displayName}...`}
              rows={1}
              className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm resize-none max-h-24"
              style={{ minHeight: '46px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className={`p-3 bg-gradient-to-br ${theme.tw.grad} rounded-2xl shadow-lg transition-all hover:scale-110 disabled:opacity-40 flex-shrink-0`}
          >
            {sending
              ? <Loader2 className="w-5 h-5 animate-spin text-white" />
              : <Send className="w-5 h-5 text-white" />
            }
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-700 mt-2">Enter para enviar • Shift+Enter para nova linha</p>
      </div>
    </div>
  );
}
