import React, { useState, useRef, useEffect } from 'react';
import { X, Gamepad, Save, Upload, Loader2, Search, Zap, ChevronRight, Clock, Image as ImageIcon, FileText } from 'lucide-react';
import { categoryNames, initialGameData, platformOptions, genreOptions } from '../data/categories';
import imageCompression from "browser-image-compression";
import { toast } from 'react-hot-toast';
import { searchGameIGDB } from '../services/igdbService';

const convertUrlToFile = async (url, filename) => {
  const fullUrl = url.startsWith('http') ? url : `https:${url}`;
  try {
    const response = await fetch(fullUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (err) {
    console.error("Erro ao converter URL:", err);
    throw err;
  }
};

export default function AddGameModal({ onClose, onSaveGame, gameToEdit, initialData }) {
  const isEditing = !!gameToEdit;
  const initialStatus = isEditing ? gameToEdit.status : 'jogando';
  const [formData, setFormData] = useState(isEditing ? gameToEdit : { ...initialGameData, status: initialStatus });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    if (initialData && !isEditing) {
      setFormData(prev => ({
        ...prev,
        nome: initialData.nome || '',
        genre: initialData.genre || 'RPG',
        platform: initialData.platform || 'PC',
        imageBase64: initialData.imageUrl ? `LOADING_URL:${initialData.imageUrl}` : "",
        status: 'jogando',
        timeToBeat: initialData.timeToBeat || 0,
        notes: '' // Reset notes for new recommendation
      }));
      toast.success("Dados carregados!");
    } else if (isEditing && gameToEdit) {
      setFormData(gameToEdit);
    }
  }, [initialData, gameToEdit, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePlatform = (platform) => {
    const currentPlatforms = formData.platform ? formData.platform.split(' | ').filter(p => p.trim() !== '') : [];
    
    let newPlatforms;
    if (currentPlatforms.includes(platform)) {
        newPlatforms = currentPlatforms.filter(p => p !== platform);
    } else {
        newPlatforms = [...currentPlatforms, platform];
    }
    
    setFormData(prev => ({ ...prev, platform: newPlatforms.join(' | ') }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleImageUploadClick = () => {
    fileInputRef.current.click();
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery.length < 3) {
      toast.error("Digite pelo menos 3 caracteres.");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setShowSearchResults(true);

    try {
      const results = await searchGameIGDB(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        toast.error("Nenhum jogo encontrado.");
      }
    } catch (error) {
      toast.error("Erro na busca.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectGame = (gameResult) => {
    setFormData(prev => ({
      ...prev,
      nome: gameResult.nome,
      timeToBeat: gameResult.timeToBeat || 0,
      imageBase64: gameResult.imageUrl ? `LOADING_URL:${gameResult.imageUrl}` : "",
      genre: gameResult.genre,
      platform: gameResult.platform,
      // Não sobrescrevemos 'notes' aqui para manter o que o usuário possa já ter digitado
    }));

    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);

    toast.success("Jogo selecionado!");
  };

  const convertFileToBase64 = async (file) => {
    if (!file) return null;
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      });
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error("Erro na compressão:", error);
      throw new Error("Falha ao processar a imagem.");
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      alert("O nome do jogo é obrigatório!");
      return;
    }
    
    if (!formData.platform) {
        toast.error("Selecione a plataforma!");
        return;
    }

    setLoading(true);
    let imageBase64Data = formData.imageBase64;
    let imageToProcess = null; 

    try {
      if (imageFile) {
        imageToProcess = imageFile;
      } else if (imageBase64Data && imageBase64Data.startsWith('LOADING_URL:')) {
        const imageUrl = imageBase64Data.replace('LOADING_URL:', '');
        toast('Baixando capa...', { icon: '⏳', id: 'img-proc' });

        try {
          const fileFromUrl = await convertUrlToFile(imageUrl, `${formData.nome}-cover.jpg`);
          imageToProcess = fileFromUrl;
        } catch (fetchError) {
          console.error("Falha ao baixar imagem:", fetchError);
          imageBase64Data = ""; 
        }
      }

      if (imageToProcess) {
        imageBase64Data = await convertFileToBase64(imageToProcess);
        toast.success('Capa ok!', { id: 'img-proc' });
      } else if (imageBase64Data && imageBase64Data.startsWith('LOADING_URL:')) {
        imageBase64Data = "";
      }

      const finalData = {
        ...formData,
        timeToBeat: parseInt(formData.timeToBeat) || 0,
        originalStatus: formData.status,
        imageBase64: imageBase64Data
      };

      onSaveGame(finalData);

    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar.");
    } finally {
      setLoading(false);
      setImageFile(null);
    }
  };

  const previewImageURL = imageFile ? URL.createObjectURL(imageFile) : null;
  const displayImage = previewImageURL || (formData.imageBase64 && !formData.imageBase64.startsWith('LOADING_URL:') ? formData.imageBase64 : null);

  const availableCategories = Object.entries(categoryNames);
  
  const isPlatformSelected = (p) => {
      if (!formData.platform) return false;
      return formData.platform.split(' | ').includes(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-3xl shadow-2xl border border-gray-800 flex flex-col max-h-[85vh] overflow-hidden">
        
        <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Gamepad className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">
                  {isEditing ? 'Editar Jogo' : 'Adicionar Jogo'}
                </h2>
                <p className="text-xs text-gray-400 hidden sm:block">
                  {isEditing ? 'Atualize as informações' : 'Preencha os dados'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 bg-gray-800 hover:bg-red-500/20 rounded-xl border border-gray-700 hover:border-red-500/50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isEditing && (
            <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-cyan-400" />
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Buscar Informações
                </label>
              </div>
              
              <form onSubmit={handleSearchSubmit} className='flex gap-2'>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Nome do jogo..."
                    className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || searchQuery.length < 3}
                  className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm whitespace-nowrap"
                >
                  {isSearching ? <Loader2 className='w-4 h-4 animate-spin' /> : <Search className="w-4 h-4" />}
                  <span className="hidden sm:inline">Buscar</span>
                </button>
              </form>

              {showSearchResults && (
                <div className="mt-3 bg-gray-800/80 rounded-xl border border-gray-700 overflow-hidden">
                  {isSearching ? (
                    <div className='p-4 text-center text-gray-400 flex items-center justify-center gap-2'>
                      <Loader2 className='w-4 h-4 animate-spin text-cyan-400' />
                      <span className="text-sm">Buscando...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto">
                      {searchResults.map(game => (
                        <button
                          key={game.id}
                          onClick={() => handleSelectGame(game)}
                          className='w-full p-3 flex items-center gap-3 border-b border-gray-700 hover:bg-gray-700/50 transition-colors text-left'
                        >
                          <div className="w-10 h-14 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                            {game.imageUrl ? (
                              <img src={game.imageUrl} className="w-full h-full object-cover" alt={game.nome} />
                            ) : (
                              <Gamepad className="w-full h-full p-2 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className='font-bold text-white text-sm'>{game.nome}</p>
                            <p className='text-xs text-gray-400'>{game.platform}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className='p-4 text-center text-sm text-gray-400'>Nada encontrado</p>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*"
            />

            <div className="grid md:grid-cols-[200px,1fr] gap-6">
              
              <div className="space-y-2 mx-auto md:mx-0 w-full max-w-[200px]">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 text-center md:text-left">
                  Capa
                </label>
                <button
                  type="button"
                  onClick={handleImageUploadClick}
                  className='w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-700 overflow-hidden bg-gray-800 hover:border-cyan-500 transition-all group relative'
                >
                  {displayImage ? (
                    <>
                      <img
                        src={displayImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onLoad={() => { if (previewImageURL) URL.revokeObjectURL(previewImageURL) }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                        <Upload className="w-8 h-8 text-white mb-1" />
                        <span className="text-xs text-white">Alterar</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs">Adicionar</span>
                    </div>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Nome do jogo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                      Gênero
                    </label>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm"
                    >
                      {genreOptions.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                      Horas
                    </label>
                    <input
                      type="number"
                      name="timeToBeat"
                      value={formData.timeToBeat}
                      onChange={handleChange}
                      className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm"
                  >
                    {availableCategories.map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-3">
                Plataformas *
              </label>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map((p) => {
                  const selected = isPlatformSelected(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        selected
                          ? 'bg-cyan-600 border-cyan-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- NOVO CAMPO: ANOTAÇÕES --- */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Anotações (Opcional)
                </label>
              </div>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none"
                placeholder="Ex: Tenho a continuação no PS5; Pegar troféu X..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : <Save className="w-5 h-5" />}
              {isEditing ? 'Salvar Alterações' : 'Salvar Jogo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}