import React, { useState, useRef } from 'react';
import { User, LogOut, Settings, Mail, Calendar, Trophy, Camera, CheckCircle } from 'lucide-react';

export default function ProfileScreen({
    user,
    handleSignOut,
    totalFinishedGames, // Total de jogos zerados
    totalAchievements, // Total de conquistas
    handleProfileImageUpload,
}) {
    // Mantendo estados para toggles de UI
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const fileInputRef = useRef(null);

    const totalGames = totalFinishedGames;
    
    // Simular um "nível" de jogador
    const calculateLevel = () => {
        const points = (totalGames * 150) + (totalAchievements * 200);
        return Math.floor(points / 1000) + 1;
    };

    const level = calculateLevel();
    const currentPoints = (totalGames * 150) + (totalAchievements * 200);
    const progressToNextLevel = ((currentPoints % 1000) / 1000) * 100;

    const photoSrc = user?.photoBase64 || user?.photoURL;

    const handleCameraClick = () => { fileInputRef.current.click(); };
    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { handleProfileImageUpload(file); }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pb-24 pt-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                style={{ display: 'none' }}
                accept="image/*"
            />
            <div className="max-w-md mx-auto px-4">
                {/* Header com Avatar */}
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                        {photoSrc ? (
                            <img
                                src={photoSrc}
                                alt={user.displayName}
                                className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center border-4 border-blue-500">
                                <User className="w-12 h-12" />
                            </div>
                        )}
                        <button
                            onClick={handleCameraClick}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-gray-900 hover:bg-cyan-600 transition-all">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold mb-1">{user?.displayName || 'Jogador'}</h2>
                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user?.email}
                    </p>

                    {/* Badge de Nível */}
                    <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-full">
                        <Trophy className="w-5 h-5 text-green-400 fill-green-400" />
                        <span className="font-semibold">Nível de Jogador {level}</span>
                    </div>

                    {/* Barra de Progresso para Próximo Nível */}
                    <div className="mt-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="text-gray-400">Progresso para Nível {level + 1}</span>
                            <span className="text-blue-400 font-semibold">{Math.round(progressToNextLevel)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                                style={{ width: `${progressToNextLevel}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-sm text-gray-400">Jogos Zerados</span>
                        </div>
                        <div className="text-2xl font-bold">{totalGames}</div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm text-gray-400">Conquistas</span>
                        </div>
                        <div className="text-2xl font-bold">{totalAchievements}</div>
                    </div>
                </div>

                {/* Data de Cadastro */}
                <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Membro desde</div>
                                <div className="font-semibold">
                                    {user?.metadata?.creationTime
                                        ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })
                                        : 'Data indisponível'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configurações */}
                <div className="bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-700 mb-6 overflow-hidden">
                    <div className="p-4 border-b border-gray-700">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-400" />
                            Configurações
                        </h3>
                    </div>

                    {/* Toggle Notificações */}
                    <button
                        onClick={() => setNotifications(!notifications)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-all border-b border-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            <i className="w-5 h-5 text-blue-400 fas fa-bell"></i>
                            <span>Notificações</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-all duration-300 ${notifications ? 'bg-cyan-500' : 'bg-gray-600'
                            }`}>
                            <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'
                                } mt-0.5`} />
                        </div>
                    </button>

                    {/* Toggle Dark Mode */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <i className={`w-5 h-5 ${darkMode ? 'text-indigo-400 fas fa-moon' : 'text-yellow-400 fas fa-sun'}`}></i>
                            <span>Modo {darkMode ? 'Escuro' : 'Claro'}</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-all duration-300 ${darkMode ? 'bg-indigo-500' : 'bg-yellow-500'
                            }`}>
                            <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'
                                } mt-0.5`} />
                        </div>
                    </button>
                </div>

                {/* Botão de Sair */}
                <button
                    onClick={handleSignOut}
                    className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    <LogOut className="w-5 h-5" />
                    Sair da Conta
                </button>

                {/* Versão do App */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    Game Backlog v1.0
                </div>
            </div>
        </div>
    );
}