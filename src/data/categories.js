// src/data/categories.js
import { Joystick, List, CheckCircle, Heart } from 'lucide-react';

export const categoryNames = {
  jogando: '🕹️ Jogando', 
  zerados: '✅ Zerados',
  desejados: '🌟 Lista de Desejos'
};

export const categoryColors = {
  jogando: 'from-blue-500 to-cyan-500',
  zerados: 'from-green-500 to-emerald-500',
  desejados: 'from-yellow-500 to-orange-500'
};

export const categoryIcons = {
  jogando: Joystick,
  zerados: CheckCircle,
  desejados: Heart
};

export const initialGameData = {
  nome: "",
  platform: "PC",
  genre: "Ação",
  timeToBeat: 20,
  status: "jogando", // Status inicial padrão é 'jogando'
  notes: "",
  imageBase64: "",
  rating: null, // NOVO: Nota de 1 a 10
  reviewText: "", // NOVO: Comentário do zeramento
};

export const platformOptions = ["PC", "PS5", "Switch", "Xbox Series", "PS4", "Xbox One", "Mobile", "Outra"];
export const genreOptions = ["RPG", "Ação", "Aventura", "Plataforma", "FPS", "Estratégia", "Roguelite", "Simulação", "Puzzle", "Outro"];