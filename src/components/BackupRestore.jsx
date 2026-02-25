// src/components/BackupRestore.jsx
import React, { useState, useRef } from 'react';
import { Download, Upload, Shield, CheckCircle, AlertTriangle, X, Loader2, Database, FileJson, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BackupRestore({ gamesData = [], achievements = [], gameHistory = [], onRestoreData, onClose }) {
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [step, setStep] = useState('idle'); // idle | preview | confirm
  const fileRef = useRef(null);

  // ── Exportar ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      totalGames: gamesData.length,
      gamesData,
      achievements,
      gameHistory,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-backlog-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Backup exportado! ${gamesData.length} jogos salvos.`);
  };

  // ── Importar ──────────────────────────────────────────────────────────────
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      toast.error('Selecione um arquivo .json válido');
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validação básica
      if (!data.gamesData || !Array.isArray(data.gamesData)) {
        throw new Error('Arquivo inválido: campo gamesData ausente.');
      }

      setPreviewData(data);
      setStep('preview');
    } catch (err) {
      toast.error(`Erro ao ler arquivo: ${err.message}`);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleConfirmRestore = () => {
    if (!previewData) return;
    onRestoreData({
      gamesData: previewData.gamesData || [],
      achievements: previewData.achievements || [],
      gameHistory: previewData.gameHistory || [],
    });
    toast.success(`✅ ${previewData.gamesData.length} jogos restaurados!`);
    onClose();
  };

  // ── Estatísticas do backup ─────────────────────────────────────────────
  const stats = previewData ? {
    total: previewData.gamesData.length,
    zerados: previewData.gamesData.filter(g => g.status === 'zerados').length,
    playing: previewData.gamesData.filter(g => g.status === 'playing').length,
    backlog: previewData.gamesData.filter(g => g.status === 'backlog').length,
    achievements: previewData.achievements?.length || 0,
    exportedAt: previewData.exportedAt
      ? new Date(previewData.exportedAt).toLocaleDateString('pt-BR', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      : 'Desconhecida',
  } : null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Backup & Restaurar</h2>
              <p className="text-xs text-gray-400">Seus dados em segurança</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {step === 'idle' && (
            <>
              {/* Info atual */}
              <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-bold text-gray-200">Sua Coleção Atual</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total', value: gamesData.length, color: 'text-white' },
                    { label: 'Zerados', value: gamesData.filter(g => g.status === 'zerados').length, color: 'text-green-400' },
                    { label: 'Conquistas', value: achievements.length, color: 'text-yellow-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center bg-gray-900/50 rounded-xl p-2 border border-gray-700/30">
                      <p className={`text-2xl font-black ${color}`}>{value}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exportar */}
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border-2 border-blue-500/30 hover:border-blue-500/50 rounded-2xl transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-blue-300 text-sm">Exportar Backup</p>
                  <p className="text-xs text-gray-500 mt-0.5">Baixa um arquivo .json com todos os dados</p>
                </div>
                <FileJson className="w-5 h-5 text-blue-400/50" />
              </button>

              {/* Importar */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={importing}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-2 border-purple-500/30 hover:border-purple-500/50 rounded-2xl transition-all group disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  {importing ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Upload className="w-6 h-6 text-white" />}
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-purple-300 text-sm">Restaurar Backup</p>
                  <p className="text-xs text-gray-500 mt-0.5">Importa um arquivo .json salvo anteriormente</p>
                </div>
                <RefreshCw className="w-5 h-5 text-purple-400/50" />
              </button>

              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />

              <p className="text-center text-xs text-gray-600 pt-1">
                ⚠️ Restaurar irá <strong className="text-yellow-500">substituir</strong> todos os dados atuais
              </p>
            </>
          )}

          {step === 'preview' && stats && (
            <>
              {/* Preview do arquivo */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-bold text-white">Arquivo Lido com Sucesso</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data do backup</span>
                    <span className="text-gray-200 font-medium">{stats.exportedAt}</span>
                  </div>
                  <div className="h-px bg-gray-700/50" />
                  {[
                    { label: 'Total de Jogos', value: stats.total },
                    { label: 'Zerados',         value: stats.zerados },
                    { label: 'Jogando',          value: stats.playing },
                    { label: 'Backlog',          value: stats.backlog },
                    { label: 'Conquistas',       value: stats.achievements },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-400">{label}</span>
                      <span className="font-bold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aviso */}
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-200 leading-relaxed">
                  Isso irá <strong>substituir permanentemente</strong> todos os {gamesData.length} jogos atuais pelos {stats.total} jogos do backup. Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('idle'); setPreviewData(null); }}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-sm text-gray-300 transition-all border border-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmRestore}
                  className="flex-[2] py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar Restauração
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}