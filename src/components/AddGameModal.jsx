import React, { useState, useRef, useEffect } from 'react';
import { X, Gamepad, Save, Upload, Loader2, Search, Zap, ChevronRight, Clock } from 'lucide-react';
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
    // [!] Tela Estática (Full Screen)
    <div className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto flex flex-col">
      <div className="w-full max-w-2xl mx-auto p-4 md:p-6 pb-20">

        <div className="flex items-center justify-between mb-8 mt-2">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Gamepad className="w-8 h-8 text-cyan-400" />
            {isEditing ? 'Editar Jogo' : 'Novo Jogo'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isEditing && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-cyan-400 mb-2 uppercase tracking-wide">Buscar na API</label>
            <form onSubmit={handleSearchSubmit} className='flex items-center gap-2'>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Digite o nome para buscar informações..."
                  className="w-full pl-10 p-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || searchQuery.length < 3}
                className="p-4 bg-cyan-600 rounded-xl hover:bg-cyan-500 disabled:opacity-50 transition-colors"
              >
                {isSearching ? <Loader2 className='w-6 h-6 animate-spin' /> : <Search className="w-6 h-6" />}
              </button>
            </form>

            {showSearchResults && (
              <div className="mt-3 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
                {isSearching ? (
                  <p className='p-6 text-center text-gray-400 flex items-center justify-center gap-2'>
                    <Loader2 className='w-5 h-5 animate-spin' /> Buscando dados do jogo...
                  </p>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.map(game => (
                        <div
                        key={game.id}
                        onClick={() => handleSelectGame(game)}
                        className='p-4 flex items-center justify-between border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors'
                        >
                        <div className='flex items-center gap-4'>
                            <div className="w-12 h-16 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                                {game.imageUrl ? <img src={game.imageUrl} className="w-full h-full object-cover" alt="" /> : <Gamepad className="w-full h-full p-2 text-gray-600" />}
                            </div>
                            <div>
                            <p className='font-bold text-white text-lg'>{game.nome}</p>
                            <p className='text-sm text-gray-400'>{game.genre} • {game.platform}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-500" />
                        </div>
                    ))}
                  </div>
                ) : (
                  !isSearching && <p className='p-6 text-center text-gray-400'>Nenhum resultado encontrado.</p>
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

          {/* Seção Principal: Capa e Dados Básicos */}
          <div className="flex flex-col md:flex-row gap-6">
              {/* Capa */}
              <div className='flex flex-col gap-2 w-full md:w-1/3'>
                <label className="block text-sm font-medium text-gray-400">Capa do Jogo</label>
                <div 
                    onClick={handleImageUploadClick}
                    className='aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-700 overflow-hidden bg-gray-800 flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors group relative'
                >
                    {displayImage ? (
                    <>
                        <img
                            src={displayImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onLoad={() => { if (previewImageURL) URL.revokeObjectURL(previewImageURL) }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                    </>
                    ) : (
                    <div className="text-center p-4">
                        <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2 group-hover:text-cyan-400" />
                        <span className="text-sm text-gray-500 group-hover:text-gray-300">Clique para upload</span>
                    </div>
                    )}
                </div>
              </div>

              {/* Campos de Texto (Restaurados) */}
              <div className="flex-1 space-y-4">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1">Nome do Jogo</label>
                    <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                        placeholder="Ex: The Legend of Zelda..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-1">Gênero</label>
                        <select
                        id="genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white appearance-none focus:border-cyan-500 focus:outline-none"
                        >
                        {genreOptions.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="timeToBeat" className="block text-sm font-medium text-gray-300 mb-1">Tempo (horas)</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <input
                                type="number"
                                id="timeToBeat"
                                name="timeToBeat"
                                value={formData.timeToBeat}
                                onChange={handleChange}
                                className="w-full pl-9 p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                                placeholder="0"
                            />
                        </div>
                      </div>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status Inicial</label>
                    <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white appearance-none focus:border-cyan-500 focus:outline-none"
                    >
                    {availableCategories.map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                    ))}
                    </select>
                  </div>
              </div>
          </div>
          
          {/* Seção de Plataformas */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Plataformas</label>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-800 rounded-xl border border-gray-700">
                {platformOptions.map((p) => {
                    const selected = isPlatformSelected(p);
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => togglePlatform(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                                selected
                                ? 'bg-cyan-900 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                : 'bg-gray-900 border-gray-700 text-gray-500 hover:bg-gray-700'
                            }`}
                        >
                            {p}
                        </button>
                    )
                })}
            </div>
          </div>

          <div className="pt-6">
            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg transform transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className='w-6 h-6 animate-spin' /> : <Save className="w-6 h-6" />}
                {loading ? 'Salvando Jogo...' : 'Salvar na Coleção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}