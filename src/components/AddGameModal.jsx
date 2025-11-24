// src/components/AddGameModal.jsx 
import React, { useState, useRef, useEffect } from 'react'; 
import { X, Gamepad, Save, Upload, Loader2 } from 'lucide-react'; 
import { categoryNames, initialGameData, platformOptions, genreOptions } from '../data/categories';
// Removidos imports do Firebase Storage
import imageCompression from "browser-image-compression"; 

export default function AddGameModal({ onClose, onSaveGame, gameToEdit }) { 
  const isEditing = !!gameToEdit;
  const [formData, setFormData] = useState(isEditing ? gameToEdit : initialGameData);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null); 
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData(isEditing ? gameToEdit : initialGameData);
  }, [gameToEdit, isEditing]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };
  
  const handleImageUploadClick = () => {
      fileInputRef.current.click();
  }

  // NOVA LÓGICA: Converte o arquivo para Base64 após compressão.
  const convertFileToBase64 = async (file) => {
      if (!file) return null;
      
      try {
          // 1. Comprime a imagem (máximo 200KB para evitar exceder o limite do Firestore)
          const compressedFile = await imageCompression(file, {
              maxSizeMB: 0.2, 
              maxWidthOrHeight: 400,
              useWebWorker: true,
          });

          // 2. Converte para Base64
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(compressedFile);
          });
      } catch (error) {
          console.error("Erro na compressão/conversão de imagem:", error);
          throw new Error("Falha ao processar a imagem.");
      }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      alert("O nome do jogo é obrigatório!");
      return;
    }
    
    setLoading(true);
    let imageBase64Data = formData.imageBase64; // Mantém a Base64 existente
    
    try {
        // 1. Processa a nova imagem para Base64 se um arquivo foi selecionado
        if (imageFile) {
            imageBase64Data = await convertFileToBase64(imageFile);
        }
        
        const finalData = {
          ...formData,
          timeToBeat: parseInt(formData.timeToBeat) || 0,
          originalStatus: formData.status, 
          // Salva o Base64 no objeto do jogo
          imageBase64: imageBase64Data 
        };
        
        onSaveGame(finalData);
        
    } catch (error) {
        console.error("Erro ao salvar o jogo e/ou imagem:", error);
        alert("Erro ao salvar o jogo. Verifique o console para mais detalhes. Se o erro persistir, o arquivo Base64 pode ser muito grande (limite do Firestore é 1MB).");
    } finally {
        setLoading(false); 
        // Limpa o preview/file do modal após o salvamento
        setImageFile(null); 
    }
  };

  // Determina qual imagem exibir: o arquivo selecionado (preview URL) ou o Base64 existente
  const previewImageURL = imageFile ? URL.createObjectURL(imageFile) : null;
  const displayImage = previewImageURL || formData.imageBase64;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gamepad className="w-6 h-6 text-cyan-400" />
            {isEditing ? 'Editar Jogo' : 'Adicionar Novo Jogo'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Input de arquivo escondido */}
          <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*"
          />

          {/* Upload Manual de Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Capa do Jogo (Opcional)</label>
            <div className='flex items-center space-x-4'>
                <div className='flex-shrink-0 w-24 h-24 rounded-xl border border-gray-700 overflow-hidden bg-gray-700/50 flex items-center justify-center'>
                    {displayImage ? (
                        <img 
                          src={displayImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                          // Revoga a URL temporária para previews se não for a Base64 salva
                          onLoad={() => { if(previewImageURL) URL.revokeObjectURL(previewImageURL) }} 
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
            {imageFile && (
                <p className='text-xs text-green-400 mt-2'>Arquivo selecionado: {imageFile.name}</p>
            )}
            {isEditing && !imageFile && formData.imageBase64 && (
                <p className='text-xs text-gray-400 mt-2'>Imagem atual será mantida. Escolha um novo arquivo para substituir.</p>
            )}
          </div>
          
          {/* Nome do Jogo */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-1">Nome do Jogo *</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Baldur's Gate 3"
              required
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Platforma */}
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-1">Plataforma</label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              {platformOptions.map(p => <option key={p} value={p}>{p}</option>)} 
            </select>
          </div>

          {/* Gênero */}
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
          
          {/* Time to Beat (Horas) */}
          <div>
            <label htmlFor="timeToBeat" className="block text-sm font-medium text-gray-300 mb-1">Tempo Médio (Horas)</label>
            <input
              id="timeToBeat"
              name="timeToBeat"
              type="number"
              min="0"
              value={formData.timeToBeat}
              onChange={handleChange}
              placeholder="Ex: 50"
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Inicial */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status Inicial</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              {Object.entries(categoryNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
          
          {/* Notas */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Notas (Opcional)</label>
            <textarea
              id="notes"
              name="notes"
              rows="2"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ex: Começar com a classe Bardo"
              className="w-full p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-white focus:ring-blue-500 focus:border-blue-500 transition-all"
            ></textarea>
          </div>


          {/* Botão de Salvar */}
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