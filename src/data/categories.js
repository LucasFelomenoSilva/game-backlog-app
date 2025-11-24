// src/data/categories.js
import { Joystick, List, CheckCircle, Heart } from 'lucide-react';

export const categoryNames = {
  jogando: '🕹️ Jogando (In Progress)',
  a_zerar: '⏳ A Zerar (To Play Soon)',
  zerados: '✅ Zerados (Finished)',
  desejados: '🌟 Lista de Desejos (Wishlist)'
};

export const categoryColors = {
  jogando: 'from-blue-500 to-cyan-500',
  a_zerar: 'from-purple-500 to-pink-500',
  zerados: 'from-green-500 to-emerald-500',
  desejados: 'from-yellow-500 to-orange-500'
};

export const categoryIcons = {
  jogando: Joystick,
  a_zerar: List,
  zerados: CheckCircle,
  desejados: Heart
};

export const initialGameData = {
  nome: "",
  platform: "PC",
  genre: "Ação",
  timeToBeat: 20,
  status: "a_zerar",
  notes: "",
  imageUrl: "" // Adicionado para imagem
};

export const platformOptions = ["PC", "PS5", "Switch", "Xbox Series", "PS4", "Xbox One", "Mobile", "Outra"];
export const genreOptions = ["RPG", "Ação", "Aventura", "Plataforma", "FPS", "Estratégia", "Roguelite", "Simulação", "Puzzle", "Outro"];