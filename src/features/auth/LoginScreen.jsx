// src/features/auth/LoginScreen.jsx
import React from 'react';
import { Joystick } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center z-10">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl mb-6 shadow-[0_0_30px_rgba(6,182,212,0.6)]">
          <Joystick className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
          Game Backlog
        </h1>
        <p className="text-gray-400 mb-8 text-lg">Sua jornada, seus troféus, sua coleção.</p>
        <button
          onClick={signIn}
          className="w-full py-4 bg-white hover:bg-cyan-50 text-gray-900 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
          Start Game (Login)
        </button>
      </div>
    </div>
  );
}
