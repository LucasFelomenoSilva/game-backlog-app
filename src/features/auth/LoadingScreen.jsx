// src/features/auth/LoadingScreen.jsx
import React from 'react';
import { Gamepad2 } from 'lucide-react';

export default function LoadingScreen({ tip }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center z-10 p-6 bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl">
        <Gamepad2 className="w-16 h-16 text-cyan-500 mx-auto mb-4 animate-bounce" />
        <div className="w-48 h-2 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
          <div className="h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '50%' }} />
        </div>
        <p className="text-cyan-400 text-lg font-bold animate-pulse">{tip}</p>
      </div>
    </div>
  );
}
