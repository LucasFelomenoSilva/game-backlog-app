import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Gamepad, Save, Upload, Loader2, Search, Image as ImageIcon, FileText, Trophy, Star, Calendar, CalendarDays, AlertTriangle, ChevronDown, Check, Clock } from 'lucide-react';
import { categoryNames, initialGameData, platformOptions, genreOptions } from '../data/categories';
import imageCompression from "browser-image-compression";
import { toast } from 'react-hot-toast';
import { searchGameIGDB } from '../services/igdbService';
import CustomTags from './CustomTags';
import { useTheme } from '../context/ThemeContext';

const STATUS_CONFIG = {
  playing:   { label: 'Jogando Agora', emoji: '🔥', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  installed: { label: 'Instalados',    emoji: '💾', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  backlog:   { label: 'Na Fila',       emoji: '⏳', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  zerados:   { label: 'Zerados',       emoji: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  desejados: { label: 'Lista de Desejos', emoji: '🌟', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
};

const RatingStar = ({ rating, setRating, index }) => {
  const isSelected = index <= rating;
  return (
    <Star
      className={`h-5 w-5 cursor-pointer transition-all duration-150 hover:scale-125 sm:h-6 sm:w-6 ${
        isSelected ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-yellow-300'
      }`}
      onClick={() => setRating(index)}
    />
  );
};

export default function AddGameModal({ onClose, onSaveGame, gameToEdit, initialData, gamesData = [] }) {
  const { theme: V } = useTheme();
  const isEditing = !!gameToEdit;
  const initialStatus = isEditing ? gameToEdit.status : 'playing';
  const lastSavedPlatform = useMemo(() => {
    try {
      return localStorage.getItem('xplog_last_platform') || 'PC';
    } catch {
      return 'PC';
    }
  }, []);

  const [formData, setFormData] = useState(() => {
    if (isEditing) return gameToEdit;
    return { ...initialGameData, status: initialStatus, platform: lastSavedPlatform };
  });
  const [statusOpen, setStatusOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [inlineRating, setInlineRating] = useState(formData.rating || 0);
  const isZerado = formData.status === 'zerados';

  useEffect(() => {
    if (initialData && !isEditing) {
      setFormData(prev => ({
        ...prev,
        nome: initialData.nome || '',
        genre: initialData.genre || 'RPG',
        platform: initialData.platform || 'PC',
        imageBase64: initialData.imageUrl ? `LOADING_URL:${initialData.imageUrl}` : "",
        status: 'playing',
        timeToBeat: initialData.timeToBeat || 0,
        notes: '',
        isPlatinum: false
      }));
      toast.success("Dados carregados!");
    } else if (isEditing && gameToEdit) {
      setFormData(gameToEdit);
      setInlineRating(gameToEdit.rating || 0);
      if (gameToEdit.finishedDate) {
        const d = new Date(gameToEdit.finishedDate);
        setCustomDate(d.toISOString().split('T')[0]);
        setUseCustomDate(true);
      }
    }
  }, [initialData, gameToEdit, isEditing]);

  useEffect(() => {
    if (!isZerado) { setUseCustomDate(false); setCustomDate(''); setInlineRating(0); }
  }, [isZerado]);

  useEffect(() => {
    if (isEditing) return undefined;
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchError('');
      setIsSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    const debounce = window.setTimeout(async () => {
      setIsSearching(true);
      setShowSearchResults(true);
      setSearchError('');
      try {
        const results = await searchGameIGDB(query, { signal: controller.signal });
        setSearchResults(results);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSearchResults([]);
          setSearchError(error.message || 'Não foi possível buscar agora.');
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(debounce);
      controller.abort();
    };
  }, [searchQuery, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const togglePlatform = (platform) => {
    const current = formData.platform ? formData.platform.split(' | ').filter(p => p.trim() !== '') : [];
    const updated = current.includes(platform) ? current.filter(p => p !== platform) : [...current, platform];
    const platStr = updated.join(' | ');
    setFormData(prev => ({ ...prev, platform: platStr }));
    try {
      if (platStr) localStorage.setItem('xplog_last_platform', platStr);
    } catch {}
  };

  const handleSelectGame = (gameResult) => {
    setFormData(prev => ({
      ...prev,
      nome: gameResult.nome,
      timeToBeat: (gameResult.timeToBeat && gameResult.timeToBeat > 0) ? gameResult.timeToBeat : prev.timeToBeat,
      imageBase64: gameResult.imageUrl ? `LOADING_URL:${gameResult.imageUrl}` : "",
      genre: gameResult.genre || prev.genre,
      platform: prev.platform || gameResult.platform || 'PC',
    }));
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    if (gameResult.timeToBeat > 0) {
      toast.success(`${gameResult.nome} (~${gameResult.timeToBeat}h · ${gameResult.genre})`, { icon: '✨' });
    } else {
      toast.success(`Jogo selecionado! (${gameResult.genre})`);
    }
  };

  const convertFileToBase64 = async (file) => {
    if (!file) return null;
    const compressed = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 400, useWebWorker: true });
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(compressed);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) { alert("O nome do jogo é obrigatório!"); return; }
    if (!formData.platform) { toast.error("Selecione a plataforma!"); return; }
    setLoading(true);
    let imageBase64Data = formData.imageBase64;
    try {
      if (formData.platform) {
        try { localStorage.setItem('xplog_last_platform', formData.platform); } catch {}
      }
      if (imageFile) {
        imageBase64Data = await convertFileToBase64(imageFile);
      } else if (imageBase64Data && imageBase64Data.startsWith('LOADING_URL:')) {
        // Capas do IGDB já são públicas. Guardar apenas a URL evita adicionar
        // centenas de KB em Base64 ao Firestore para cada jogo cadastrado.
        imageBase64Data = imageBase64Data.replace('LOADING_URL:', '');
      }

      let finishedDate = formData.finishedDate;
      if (isZerado) {
        if (useCustomDate && customDate) finishedDate = new Date(customDate + 'T12:00:00').toISOString();
        else if (!finishedDate) finishedDate = new Date().toISOString();
      }
      onSaveGame({ ...formData, timeToBeat: parseInt(formData.timeToBeat) || 0, originalStatus: formData.status, imageBase64: imageBase64Data, isPlatinum: formData.isPlatinum || false, rating: isZerado && inlineRating > 0 ? inlineRating : (formData.rating || null), finishedDate: isZerado ? finishedDate : formData.finishedDate });
    } catch { toast.error("Erro ao salvar."); }
    finally { setLoading(false); setImageFile(null); }
  };

  const previewImageURL = imageFile ? URL.createObjectURL(imageFile) : null;
  const remoteImagePreview = formData.imageBase64?.startsWith('LOADING_URL:')
    ? formData.imageBase64.replace('LOADING_URL:', '')
    : null;
  const displayImage = previewImageURL || remoteImagePreview || formData.imageBase64 || null;
  const duplicateGame = useMemo(() => {
    if (isEditing || formData.nome.trim().length < 3) return null;
    const normalize = value => String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');
    const currentName = normalize(formData.nome);
    return gamesData.find(game => normalize(game.nome) === currentName) || null;
  }, [formData.nome, gamesData, isEditing]);
  const availableCategories = Object.entries(categoryNames);
  const isPlatformSelected = (p) => formData.platform ? formData.platform.split(' | ').includes(p) : false;

  // Estilos reutilizáveis com o tema
  const inputStyle = { background: V.card, border: `1px solid ${V.border}`, color: V.text };
  const labelStyle = { color: V.muted };
  const sectionStyle = { background: V.faint, border: `1px solid ${V.border}` };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-[100dvh] max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden rounded-none shadow-2xl sm:h-auto sm:max-h-[min(90dvh,56rem)] sm:rounded-3xl"
        style={{ background: V.bg, border: `1px solid ${V.border}` }}>

        {/* Header */}
        <div className="flex-shrink-0 border-b px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4"
          style={{ background: `${V.card}f0`, borderColor: V.border }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${V.primary}, ${V.secondary})` }}>
                <Gamepad className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black" style={{ color: V.text }}>
                  {isEditing ? 'Editar Jogo' : 'Adicionar Jogo'}
                </h2>
                <p className="text-xs hidden sm:block" style={{ color: V.muted }}>
                  {isEditing ? 'Atualize as informações' : 'Preencha os dados'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl border transition-colors hover:opacity-80"
              style={{ background: V.faint, borderColor: V.border }}>
              <X className="w-5 h-5" style={{ color: V.muted }} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:space-y-6 sm:p-6">

          {/* Busca IGDB */}
          {!isEditing && (
            <div className="rounded-2xl p-4" style={{ background: `${V.primary}0d`, border: `1px solid ${V.primary}33` }}>
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4" style={{ color: V.primary }} />
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: V.primary }}>
                  Buscar no IGDB
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite o nome do jogo..."
                  autoComplete="off"
                  aria-label="Buscar jogo no IGDB"
                  aria-expanded={showSearchResults}
                  className="w-full rounded-xl py-3 pl-4 pr-12 text-sm transition-all focus:outline-none focus:ring-2"
                  style={{ ...inputStyle, '--tw-ring-color': V.primary }}
                />
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" style={{ color: V.primary }}>
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </div>
              </div>
              <p className="mt-2 text-[11px]" style={{ color: V.muted }}>As sugestões aparecem automaticamente a partir de 2 caracteres.</p>

              {showSearchResults && (
                <div className="mt-3 rounded-xl overflow-hidden" style={sectionStyle}>
                  {isSearching ? (
                    <div className="p-4 text-center flex items-center justify-center gap-2" style={{ color: V.muted }}>
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: V.primary }} />
                      <span className="text-sm">Buscando...</span>
                    </div>
                  ) : searchError ? (
                    <p className="p-4 text-center text-sm text-red-300">{searchError}</p>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-[min(40dvh,18rem)] overflow-y-auto overscroll-contain">
                      {searchResults.map(game => (
                        <button key={game.id} onClick={() => handleSelectGame(game)}
                          className="w-full p-3 flex items-center gap-3 border-b text-left transition-colors hover:opacity-80"
                          style={{ borderColor: V.border }}>
                          <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0" style={{ background: V.bg }}>
                            {game.imageUrl ? <img src={game.imageUrl} className="w-full h-full object-cover" alt={game.nome} /> : <Gamepad className="w-full h-full p-2" style={{ color: V.muted }} />}
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: V.text }}>{game.nome}</p>
                            <p className="text-xs" style={{ color: V.muted }}>{game.platform}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-center text-sm" style={{ color: V.muted }}>Nada encontrado</p>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="file" ref={fileInputRef} onChange={(e) => setImageFile(e.target.files[0])} style={{ display: 'none' }} accept="image/*" />

            {/* Capa + Campos principais */}
            <div className="grid gap-5 md:grid-cols-[200px,1fr] md:gap-6">
              <div className="space-y-2 mx-auto md:mx-0 w-full max-w-[200px]">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-center md:text-left" style={labelStyle}>Capa</label>
                <button type="button" onClick={() => fileInputRef.current.click()}
                  className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed overflow-hidden transition-all group relative hover:opacity-80"
                  style={{ borderColor: V.border, background: V.faint }}>
                  {displayImage ? (
                    <>
                      <img src={displayImage} alt="Preview" className="w-full h-full object-cover" onLoad={() => { if (previewImageURL) URL.revokeObjectURL(previewImageURL); }} />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                        <Upload className="w-8 h-8 text-white mb-1" />
                        <span className="text-xs text-white">Alterar</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full" style={{ color: V.muted }}>
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs">Adicionar</span>
                    </div>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={labelStyle}>Nome *</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={inputStyle} placeholder="Nome do jogo" />
                  {duplicateGame && (
                    <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-amber-200">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p className="text-xs leading-5"><strong>Este jogo já está na coleção</strong> em {categoryNames[duplicateGame.status] || duplicateGame.status}. Você ainda pode adicionar outra edição.</p>
                    </div>
                  )}
                </div>

                {/* Status e Gênero */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Dropdown */}
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={labelStyle}>Status *</label>
                    <button
                      type="button"
                      onClick={() => { setStatusOpen(p => !p); setGenreOpen(false); }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-sm focus:outline-none focus:ring-2"
                      style={{
                        ...inputStyle,
                        borderColor: statusOpen ? V.primary : V.border,
                        '--tw-ring-color': V.primary
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">{STATUS_CONFIG[formData.status]?.emoji || '🎮'}</span>
                        <span className="truncate" style={{ color: STATUS_CONFIG[formData.status]?.color || V.text }}>
                          {categoryNames[formData.status] || formData.status}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${statusOpen ? 'rotate-180 text-white' : ''}`} style={{ color: V.muted }} />
                    </button>

                    {statusOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setStatusOpen(false)} />
                        <div
                          className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                          style={{ background: `${V.card}fa`, borderColor: V.border }}
                        >
                          <div className="space-y-1">
                            {availableCategories.map(([key, label]) => {
                              const conf = STATUS_CONFIG[key] || { emoji: '🎮', color: V.primary, bg: 'rgba(255,255,255,0.05)' };
                              const isSelected = formData.status === key;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, status: key }));
                                    setStatusOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                    isSelected ? 'shadow-sm' : 'hover:bg-white/5 opacity-85 hover:opacity-100'
                                  }`}
                                  style={isSelected ? { background: conf.bg, color: conf.color, border: `1px solid ${conf.color}40` } : { color: V.text }}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{conf.emoji}</span>
                                    <span>{label}</span>
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5" style={{ color: conf.color }} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Gênero Dropdown */}
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={labelStyle}>Gênero</label>
                    <button
                      type="button"
                      onClick={() => { setGenreOpen(p => !p); setStatusOpen(false); }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-sm focus:outline-none focus:ring-2"
                      style={{
                        ...inputStyle,
                        borderColor: genreOpen ? V.primary : V.border,
                        '--tw-ring-color': V.primary
                      }}
                    >
                      <span className="truncate" style={{ color: formData.genre ? V.text : V.muted }}>
                        {formData.genre || 'Selecione'}
                      </span>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${genreOpen ? 'rotate-180 text-white' : ''}`} style={{ color: V.muted }} />
                    </button>

                    {genreOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setGenreOpen(false)} />
                        <div
                          className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl max-h-52 overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-150"
                          style={{ background: `${V.card}fa`, borderColor: V.border }}
                        >
                          <div className="space-y-1">
                            {genreOptions.map((g) => {
                              const isSelected = formData.genre === g;
                              return (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, genre: g }));
                                    setGenreOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                    isSelected ? 'font-bold' : 'hover:bg-white/5 opacity-85 hover:opacity-100'
                                  }`}
                                  style={isSelected ? { background: `${V.primary}20`, color: V.primary, border: `1px solid ${V.primary}40` } : { color: V.text }}
                                >
                                  <span>{g}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5" style={{ color: V.primary }} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Horas p/ Zerar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider" style={labelStyle}>
                      Horas Estimadas
                    </label>
                    {formData.timeToBeat > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-400">
                        ~{formData.timeToBeat}h para zerar
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: V.muted }} />
                    <input
                      type="number"
                      name="timeToBeat"
                      min="0"
                      max="9999"
                      value={formData.timeToBeat === 0 ? '' : formData.timeToBeat}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeToBeat: Math.max(0, parseInt(e.target.value, 10) || 0) }))}
                      className="w-full pl-10 pr-12 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all font-semibold text-sm"
                      style={inputStyle}
                      placeholder="Ex: 25"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold pointer-events-none" style={{ color: V.muted }}>
                      hrs
                    </span>
                  </div>
                  {/* Chips rápidos */}
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5">
                    <span className="text-[10px] uppercase font-bold flex-shrink-0" style={{ color: V.muted }}>Atalhos:</span>
                    {[10, 25, 50, 80, 100].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, timeToBeat: h }))}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all hover:opacity-100 flex-shrink-0"
                        style={formData.timeToBeat === h
                          ? { background: `${V.primary}30`, borderColor: V.primary, color: V.primary }
                          : { background: V.faint, borderColor: V.border, color: V.muted, opacity: 0.8 }}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Plataformas */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: V.soft }}>Plataformas *</label>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map((p) => {
                  const selected = isPlatformSelected(p);
                  return (
                    <button key={p} type="button" onClick={() => togglePlatform(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                      style={selected
                        ? { background: V.primary, borderColor: V.primary, color: '#fff' }
                        : { background: V.faint, borderColor: V.border, color: V.muted }}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seção zerados */}
            {isZerado && (
              <div className="space-y-4">
                {/* Nota */}
                <div className="rounded-2xl p-5 border-2 border-yellow-500/30" style={{ background: 'rgba(245,158,11,0.08)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <label className="text-sm font-bold text-yellow-300 uppercase tracking-wider">Sua Nota</label>
                    <span className="ml-auto text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {inlineRating > 0 ? `${inlineRating}/10` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(i => (
                      <RatingStar key={i} rating={inlineRating} setRating={setInlineRating} index={i} />
                    ))}
                  </div>
                  <p className="text-center text-xs text-yellow-600 mt-2">Clique para avaliar · opcional</p>
                </div>

                {/* Data personalizada */}
                <div className={`rounded-2xl p-4 border-2 transition-all duration-300 ${useCustomDate ? 'border-blue-500/40' : ''}`}
                  style={useCustomDate ? { background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.4)' } : sectionStyle}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className={`w-5 h-5 ${useCustomDate ? 'text-blue-400' : ''}`} style={useCustomDate ? {} : { color: V.muted }} />
                      <div>
                        <p className={`text-sm font-bold ${useCustomDate ? 'text-blue-300' : ''}`} style={useCustomDate ? {} : { color: V.text }}>Data personalizada</p>
                        <p className="text-xs" style={{ color: V.muted }}>{useCustomDate ? 'Quando você zerou esse jogo?' : 'Zerado em outra data? Adicione aqui'}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setUseCustomDate(p => !p); if (!useCustomDate) setCustomDate(''); }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${useCustomDate ? 'bg-blue-500' : ''}`}
                      style={useCustomDate ? {} : { background: V.border }}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${useCustomDate ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ${useCustomDate ? 'max-h-24 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
                      <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none border border-blue-500/40 focus:ring-2 focus:ring-blue-500"
                        style={{ background: V.bg, color: V.text, colorScheme: 'dark' }} />
                    </div>
                    {customDate && (
                      <p className="text-xs text-blue-400 mt-2 text-center">
                        📅 Zerado em: {new Date(customDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Platina */}
                <div className="rounded-2xl p-4 border-2 border-yellow-500/30" style={{ background: 'rgba(245,158,11,0.08)' }}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isPlatinum" checked={formData.isPlatinum || false} onChange={handleChange}
                      className="w-5 h-5 rounded border-2 border-yellow-500 checked:bg-yellow-500 focus:ring-2 focus:ring-yellow-500 cursor-pointer"
                      style={{ background: V.card }} />
                    <div className="flex items-center gap-2 flex-1">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <div>
                        <span className="text-sm font-bold text-yellow-300 block">Platinado / 100% Completo</span>
                        <span className="text-xs text-yellow-500/70">Marque se você conquistou todas as conquistas</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Platina no modo edição fora de zerados */}
            {!isZerado && isEditing && (
              <div className="rounded-2xl p-4 border-2 border-yellow-500/30" style={{ background: 'rgba(245,158,11,0.08)' }}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isPlatinum" checked={formData.isPlatinum || false} onChange={handleChange}
                    className="w-5 h-5 rounded border-2 border-yellow-500 checked:bg-yellow-500 focus:ring-2 focus:ring-yellow-500 cursor-pointer"
                    style={{ background: V.card }} />
                  <div className="flex items-center gap-2 flex-1">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <div>
                      <span className="text-sm font-bold text-yellow-300 block">Platinado / 100% Completo</span>
                      <span className="text-xs text-yellow-500/70">Marque se você conquistou todas as conquistas</span>
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* Tags */}
            <div className="rounded-xl p-4" style={sectionStyle}>
              <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: V.soft }}>Tags Personalizadas</label>
              <CustomTags tags={formData.tags || []} onChange={(tags) => setFormData(prev => ({ ...prev, tags }))} />
            </div>

            {/* Anotações */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" style={{ color: V.primary }} />
                <label className="text-xs font-bold uppercase tracking-wider" style={labelStyle}>Anotações (Opcional)</label>
              </div>
              <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows="3"
                className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 transition-all"
                style={inputStyle} placeholder="Ex: Tenho a continuação no PS5; Pegar troféu X..." />
            </div>

            {/* Botão salvar */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90"
              style={{ background: `linear-gradient(to right, ${V.primary}, ${V.secondary})`, boxShadow: `0 4px 20px ${V.primary}44` }}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isEditing ? 'Salvar Alterações' : 'Salvar Jogo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
