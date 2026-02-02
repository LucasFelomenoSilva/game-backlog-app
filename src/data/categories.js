// src/data/categories.js
import { Joystick, List, CheckCircle, Heart, Gamepad2, HardDrive, Clock } from 'lucide-react';

export const categoryNames = {
  playing: '🔥 Jogando Agora',   // Foco total
  installed: '💾 Instalados',    // Próximos da vez (estão no HD)
  backlog: '⏳ Na Fila',         // Backlog priorizado
  zerados: '✅ Zerados',
  desejados: '🌟 Lista de Desejos'
};

export const categoryColors = {
  playing: 'from-orange-500 to-red-500',      // Cor quente para ação imediata
  installed: 'from-blue-500 to-indigo-500',   // Cor fria/técnica
  backlog: 'from-purple-500 to-pink-500',     // Cor de planejamento
  zerados: 'from-green-500 to-emerald-500',
  desejados: 'from-yellow-500 to-orange-500'
};

export const categoryIcons = {
  playing: Gamepad2,
  installed: HardDrive,
  backlog: Clock,
  zerados: CheckCircle,
  desejados: Heart
};

export const initialGameData = {
  nome: "",
  platform: "PC",
  genre: "Ação",
  timeToBeat: 20,
  status: "backlog", // O padrão agora é ir para a fila, não direto para 'jogando'
  notes: "",
  imageBase64: "",
  rating: null,
  reviewText: "",
};

export const platformOptions = ["PC", "PS5", "Switch", "Xbox Series", "PS4", "Xbox One", "Mobile", "Outra"];
export const genreOptions = ["RPG", "Ação", "Aventura", "Plataforma", "FPS", "Estratégia", "Roguelite", "Simulação", "Puzzle", "Outro"];