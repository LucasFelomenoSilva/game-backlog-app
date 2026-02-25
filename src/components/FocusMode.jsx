// src/components/FocusMode.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, Zap, Trophy, Clock, Gamepad2, CheckCircle, Flame, Target } from 'lucide-react';

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatSessionTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

const MOTIVATIONAL = [
  "Você consegue! 💪",
  "Foco total! 🎯",
  "Mais um boss derrotado! ⚔️",
  "Nada vai te parar! 🔥",
  "Cada minuto conta! ⏱️",
  "Lendário! 🌟",
  "No grind! 💎",
];

export default function FocusMode({ game, onClose, onMarkFinished }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(`focus_sessions_${game.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [totalSaved, setTotalSaved] = useState(() => {
    try {
      return parseInt(localStorage.getItem(`focus_total_${game.id}`) || '0');
    } catch { return 0; }
  });
  const [motivationalIdx, setMotivationalIdx] = useState(0);
  const [pulseRing, setPulseRing] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Troca mensagem motivacional a cada 30s
  useEffect(() => {
    const t = setInterval(() => {
      setMotivationalIdx(i => (i + 1) % MOTIVATIONAL.length);
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const startTimer = useCallback(() => {
    setRunning(true);
    setPulseRing(true);
    startTimeRef.current = Date.now() - elapsed * 1000;
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    setTimeout(() => setPulseRing(false), 600);
  }, [elapsed]);

  const pauseTimer = useCallback(() => {
    setRunning(false);
    clearInterval(intervalRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (elapsed > 0) {
      // Salva sessão encerrada
      const newSession = { duration: elapsed, date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
      const updated = [newSession, ...sessions].slice(0, 5);
      setSessions(updated);
      const newTotal = totalSaved + elapsed;
      setTotalSaved(newTotal);
      try {
        localStorage.setItem(`focus_sessions_${game.id}`, JSON.stringify(updated));
        localStorage.setItem(`focus_total_${game.id}`, String(newTotal));
      } catch {}
    }
    setRunning(false);
    clearInterval(intervalRef.current);
    setElapsed(0);
  }, [elapsed, sessions, totalSaved, game.id]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const totalSessionTime = totalSaved + elapsed;
  const progressToGoal = game.timeToBeat > 0
    ? Math.min((totalSessionTime / (game.timeToBeat * 3600)) * 100, 100)
    : null;

  // Círculo SVG animado
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = progressToGoal != null
    ? circumference - (progressToGoal / 100) * circumference
    : circumference;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)' }}
    >
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-500/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 p-2 bg-gray-800 hover:bg-red-500/20 rounded-xl border border-gray-700 hover:border-red-500/50 transition-all"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        {/* Card principal */}
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">

          {/* Capa do jogo com overlay */}
          <div className="relative h-28 overflow-hidden">
            {game.imageBase64 ? (
              <>
                <img src={game.imageBase64} alt={game.nome} className="w-full h-full object-cover object-top scale-110 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/60 to-gray-900" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <Gamepad2 className="w-12 h-12 text-gray-700" />
              </div>
            )}
            {/* Badge Modo Foco */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full backdrop-blur-sm">
                <Flame className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">Modo Foco</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-2">
            {/* Nome do jogo */}
            <h2 className="text-xl font-black text-white mb-0.5 truncate">{game.nome}</h2>
            <p className="text-xs text-gray-500 mb-5">{game.platform} · {game.genre}</p>

            {/* Timer central com anel SVG */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-52 h-52">
                {/* Anel de progresso */}
                <svg className="absolute inset-0 -rotate-90" width="208" height="208" viewBox="0 0 208 208">
                  {/* Trilha */}
                  <circle cx="104" cy="104" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  {/* Progresso */}
                  {progressToGoal != null && (
                    <circle
                      cx="104" cy="104" r={radius}
                      fill="none"
                      stroke="url(#timerGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  )}
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Anel pulsante quando rodando */}
                {running && (
                  <div className="absolute inset-2 rounded-full border-2 border-cyan-500/20 animate-ping" />
                )}

                {/* Conteúdo central */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white font-mono tracking-tight tabular-nums">
                    {formatTime(elapsed)}
                  </span>
                  <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                    {running ? 'em andamento' : elapsed > 0 ? 'pausado' : 'aguardando'}
                  </span>
                  {progressToGoal != null && (
                    <span className="text-[10px] text-cyan-400 font-bold mt-1">
                      {progressToGoal.toFixed(0)}% da meta
                    </span>
                  )}
                </div>
              </div>

              {/* Mensagem motivacional */}
              <p className="text-sm text-gray-400 italic mt-2 animate-pulse">
                {running ? MOTIVATIONAL[motivationalIdx] : 'Pronto para jogar?'}
              </p>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={resetTimer}
                disabled={elapsed === 0}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all disabled:opacity-30"
                title="Encerrar sessão"
              >
                <RotateCcw className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={running ? pauseTimer : startTimer}
                className={`flex-1 py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] shadow-xl ${
                  running
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/30'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/30'
                } text-white`}
              >
                {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                {running ? 'Pausar' : 'Iniciar Sessão'}
              </button>

              <button
                onClick={onMarkFinished}
                className="p-3 bg-green-500/20 hover:bg-green-500/30 rounded-xl border border-green-500/40 transition-all"
                title="Marcar como zerado"
              >
                <Trophy className="w-4 h-4 text-green-400" />
              </button>
            </div>

            {/* Stats rápidas */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Esta Sessão', value: formatSessionTime(elapsed), icon: Zap, color: 'text-cyan-400' },
                { label: 'Total Rastreado', value: formatSessionTime(totalSessionTime), icon: Clock, color: 'text-purple-400' },
                { label: 'Meta', value: game.timeToBeat > 0 ? `${game.timeToBeat}h` : '—', icon: Target, color: 'text-green-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-gray-800/60 rounded-xl p-2.5 text-center border border-gray-700/50">
                  <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${color}`} />
                  <p className={`text-sm font-black ${color}`}>{value}</p>
                  <p className="text-[9px] text-gray-600 uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Histórico de sessões */}
            {sessions.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Sessões Anteriores</p>
                {sessions.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-gray-800/40 rounded-lg border border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      <span className="text-xs text-gray-400">{s.date}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-300">{formatSessionTime(s.duration)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}