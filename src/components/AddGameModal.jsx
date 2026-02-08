import React, { useState, useRef, useEffect } from 'react';
import { X, Gamepad, Save, Upload, Loader2, Search, Zap, ChevronRight, Monitor, Tv } from 'lucide-react';
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

  // Efeito para preencher dados se vierem da IA (initialData)
  useEffect(() => {
    if (initialData && !isEditing) {
      setFormData(prev => ({
        ...prev,
        nome: initialData.nome || '',
        genre: initialData.genre || 'RPG',
        platform: initialData.platform || 'PC',
        imageBase64: initialData.imageUrl ? `LOADING_URL:${initialData.imageUrl}` : "",
        status: 'jogando'
      }));
      toast.success("Dados da recomendação carregados! Salve para confirmar.", { icon: '✨' });
    } else if (isEditing && gameToEdit) {
      setFormData(gameToEdit);
    }
  }, [initialData, gameToEdit, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- NOVA LÓGICA DE PLATAFORMAS MÚLTIPLAS ---
  const togglePlatform = (platform) => {
    // Separa a string atual em um array (ex: "PC | PS5" vira ["PC", "PS5"])
    // Se estiver vazio ou for undefined, começa com array vazio
    const currentPlatforms = formData.platform ? formData.platform.split(' | ').filter(p => p.trim() !== '') : [];
    
    let newPlatforms;
    if (currentPlatforms.includes(platform)) {
        // Se já tem, remove
        newPlatforms = currentPlatforms.filter(p => p !== platform);
    } else {
        // Se não tem, adiciona
        newPlatforms = [...currentPlatforms, platform];
    }
    
    // Junta de volta em uma string bonita para salvar
    setFormData(prev => ({ ...prev, platform: newPlatforms.join(' | ') }));
  };
  // ---------------------------------------------

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
      toast.error("Digite pelo menos 3 caracteres para buscar.");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setShowSearchResults(true);

    try {
      const results = await searchGameIGDB(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        toast.error(`Nenhum jogo encontrado para "${searchQuery}".`);
      }
    } catch (error) {
      toast.error("Erro ao realizar a busca na API.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectGame = (gameResult) => {
    setFormData(prev => ({
      ...prev,
      nome: gameResult.nome,
      timeToBeat: gameResult.timeToBeat,
      imageBase64: gameResult.imageUrl ? `LOADING_URL:${gameResult.imageUrl}` : "",
      genre: gameResult.genre,
      platform: gameResult.platform, // A API geralmente retorna uma só, mas agora você pode adicionar mais depois
    }));

    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);

    toast.success(`Dados de "${gameResult.nome}" pré-preenchidos!`);
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
    
    // Validação extra: garantir que tem pelo menos uma plataforma
    if (!formData.platform) {
        toast.error("Selecione pelo menos uma plataforma!");
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
          toast.error('Falha ao baixar capa da API.', { id: 'img-proc' });
          imageBase64Data = ""; 
        }
      }

      if (imageToProcess) {
        imageBase64Data = await convertFileToBase64(imageToProcess);
        toast.success('Capa processada!', { id: 'img-proc' });
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
      toast.error("Erro ao salvar o jogo.");
    } finally {
      setLoading(false);
      setImageFile(null);
    }
  };

  const previewImageURL = imageFile ? URL.createObjectURL(imageFile) : null;
  const displayImage = previewImageURL || (formData.imageBase64 && !formData.imageBase64.startsWith('LOADING_URL:') ? formData.imageBase64 : null);

  const availableCategories = Object.entries(categoryNames);
  
  // Helper para verificar se a plataforma está selecionada
  const isPlatformSelected = (p) => {
      if (!formData.platform) return false;
      return formData.platform.split(' | ').includes(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gamepad className="w-6 h-6 text-cyan-400" />
            {isEditing ? 'Editar Jogo' : 'Adicionar Novo Jogo'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isEditing && (
          <div className="mb-6">
            <form onSubmit={handleSearchSubmit} className='flex items-center gap-2'>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Busque por título na API (IGDB)..."
                className="flex-1 p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              <button
                type="submit"
                disabled={isSearching || searchQuery.length < 3}
                className="p-3 bg-purple-600 rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                {isSearching ? <Loader2 className='w-5 h-5 animate-spin' /> : <Search className="w-5 h-5" />}
              </button>
            </form>

            {showSearchResults && (
              <div className="mt-3 max-h-40 overflow-y-auto bg-gray-700/50 rounded-xl border border-gray-600">
                {isSearching ? (
                  <p className='p-3 text-center text-gray-400 flex items-center justify-center gap-2'>
                    <Loader2 className='w-4 h-4 animate-spin' /> Buscando...
                  </p>
                ) : searchResults.length > 0 ? (
                  searchResults.map(game => (
                    <div
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className='p-3 flex items-center justify-between border-b border-gray-600 hover:bg-gray-600/50 cursor-pointer transition-colors'
                    >
                      <div className='flex items-center gap-3'>
                        <Zap className='w-4 h-4 text-purple-400' />
                        <div>
                          <p className='font-semibold text-sm'>{game.nome}</p>
                          <p className='text-xs text-gray-400'>{game.genre} / {game.platform}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))
                ) : (
                  !isSearching && <p className='p-3 text-center text-gray-400'>Nenhum resultado encontrado.</p>
                )}
              </div>
            )}
            <div className='text-center mt-3 text-sm text-gray-400'>
              {isEditing ? 'Edite os dados manualmente abaixo.' : 'Ou preencha o formulário manualmente:'}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept="image/*"
          />

          {/* Seção da Imagem (Capa) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Capa do Jogo</label>
            <div className='flex items-center space-x-4'>
              <div className='flex-shrink-0 w-24 h-24 rounded-xl border border-gray-700 overflow-hidden bg-gray-700/50 flex items-center justify-center'>
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onLoad={() => { if (previewImageURL) URL.revokeObjectURL(previewImageURL) }}
                  />
                ) : (
                  <Gamepad className="w-10 h-10 text-gray-500" />
                )}
              </div>
              <button
                type='button'
                onClick={handleImageUploadClick}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-gray-600/50 border border-gray-700 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                {imageFile ? 'Mudar Imagem' : (formData.imageBase64 ? 'Mudar Imagem' : 'Escolher Imagem')}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1">Nome do Jogo *</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* --- NOVA SEÇÃO DE PLATAFORMAS (BADGES) --- */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Plataformas (Selecione todas que possui)</label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-700/30 rounded-xl border border-gray-700">
                {platformOptions.map((p) => {
                    const selected = isPlatformSelected(p);
                    return (
                        <button
                            key={p}
                            type="button"
                            onClick={() => togglePlatform(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                                selected
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500'
                            }`}
                        >
                            {selected && <Zap className="w-3 h-3" />}
                            {p}
                        </button>
                    )
                })}
            </div>
            {formData.platform && (
                <p className="text-xs text-gray-400 mt-1 ml-1">
                    Selecionado: <span className="text-cyan-400">{formData.platform}</span>
                </p>
            )}
          </div>
          {/* ------------------------------------------- */}

          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-1">Gênero</label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              {genreOptions.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="timeToBeat" className="block text-sm font-medium text-gray-300 mb-1">Tempo Médio (Horas)</label>
            <input
              id="timeToBeat"
              name="timeToBeat"
              type="number"
              min="0"
              value={formData.timeToBeat}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status Inicial</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              {availableCategories.map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Anotações Extras</label>
            <textarea
              id="notes"
              name="notes"
              rows="2"
              placeholder="Ex: Peguei na promoção, versão GOTY..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-6 hover:from-blue-600 hover:to-cyan-600 transition-all active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : <Save className="w-5 h-5" />}
            {loading ? 'Salvando...' : (isEditing ? 'Salvar Edição' : 'Salvar Jogo')}
          </button>
        </form>
      </div>
    </div>
  );
}