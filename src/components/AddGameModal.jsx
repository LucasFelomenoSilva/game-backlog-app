import React, { useState, useRef, useEffect } from 'react';
import { X, Gamepad, Save, Upload, Loader2, Search, Zap, ChevronRight, Clock, Image as ImageIcon } from 'lucide-react';
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
        timeToBeat: initialData.timeToBeat || 0
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-3xl shadow-2xl border border-gray-800 my-8">
        
        {/* Header Fixo */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 rounded-t-3xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Gamepad className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  {isEditing ? 'Editar Jogo' : 'Adicionar Jogo'}
                </h2>
                <p className="text-sm text-gray-400">
                  {isEditing ? 'Atualize as informações do jogo' : 'Preencha os dados do novo jogo'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="group p-2.5 bg-gray-800 hover:bg-red-500/20 rounded-xl border border-gray-700 hover:border-red-500/50 transition-all duration-300"
            >
              <X className="w-6 h-6 text-gray-400 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Modal */}
        <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          
          {/* Busca de Jogos */}
          {!isEditing && (
            <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-cyan-400" />
                <label className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                  Buscar Informações
                </label>
              </div>
              
              <form onSubmit={handleSearchSubmit} className='flex gap-3'>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Digite o nome do jogo..."
                    className="w-full px-4 py-3.5 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || searchQuery.length < 3}
                  className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      <span className="hidden sm:inline">Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span className="hidden sm:inline">Buscar</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resultados da Busca */}
              {showSearchResults && (
                <div className="mt-4 bg-gray-800/80 rounded-xl border border-gray-700 overflow-hidden">
                  {isSearching ? (
                    <div className='p-6 text-center text-gray-400 flex items-center justify-center gap-2'>
                      <Loader2 className='w-5 h-5 animate-spin text-cyan-400' />
                      <span>Buscando jogos...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map(game => (
                        <button
                          key={game.id}
                          onClick={() => handleSelectGame(game)}
                          className='w-full p-4 flex items-center gap-4 border-b border-gray-700 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 transition-all duration-200 group'
                        >
                          <div className="w-14 h-20 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700 group-hover:border-cyan-500/50 transition-colors">
                            {game.imageUrl ? (
                              <img src={game.imageUrl} className="w-full h-full object-cover" alt={game.nome} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Gamepad className="w-8 h-8 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className='font-bold text-white text-base group-hover:text-cyan-400 transition-colors'>{game.nome}</p>
                            <p className='text-sm text-gray-400 mt-0.5'>{game.genre} • {game.platform}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className='p-6 text-center text-gray-400'>Nenhum resultado encontrado</p>
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

            {/* Grid: Capa + Dados Básicos */}
            <div className="grid md:grid-cols-[300px,1fr] gap-6">
              
              {/* Upload de Capa */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                  Capa do Jogo
                </label>
                <button
                  type="button"
                  onClick={handleImageUploadClick}
                  className='w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-700 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center hover:border-cyan-500 transition-all duration-300 group relative hover:scale-[1.02]'
                >
                  {displayImage ? (
                    <>
                      <img
                        src={displayImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onLoad={() => { if (previewImageURL) URL.revokeObjectURL(previewImageURL) }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300">
                        <Upload className="w-10 h-10 text-white mb-2" />
                        <span className="text-sm font-semibold text-white">Alterar imagem</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-400 group-hover:text-cyan-400 transition-colors">
                        Clique para adicionar
                      </p>
                      <p className="text-xs text-gray-600 mt-1">JPG, PNG ou WEBP</p>
                    </div>
                  )}
                </button>
              </div>

              {/* Campos do Formulário */}
              <div className="space-y-5">
                {/* Nome */}
                <div>
                  <label htmlFor="nome" className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Nome do Jogo *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Ex: The Legend of Zelda: Breath of the Wild"
                  />
                </div>

                {/* Grid: Gênero e Tempo */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="genre" className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Gênero
                    </label>
                    <div className="relative">
                      <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                      <select
                        id="genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white appearance-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
                      >
                        {genreOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="timeToBeat" className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Duração (h)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                      <input
                        type="number"
                        id="timeToBeat"
                        name="timeToBeat"
                        value={formData.timeToBeat}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Inicial */}
                <div>
                  <label htmlFor="status" className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Status Inicial
                  </label>
                  <div className="relative">
                    <Gamepad className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white appearance-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer"
                    >
                      {availableCategories.map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seleção de Plataformas */}
            <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-2xl p-5">
              <label className="block text-sm font-bold text-purple-300 uppercase tracking-wider mb-4">
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
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 ${
                        selected
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/30 scale-105'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-600 hover:text-gray-300'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-lg rounded-xl flex items-center justify-center gap-3 shadow-2xl shadow-green-500/30 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className='w-6 h-6 animate-spin' />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    {isEditing ? 'Atualizar Jogo' : 'Adicionar à Coleção'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}