// src/components/SettingsModal.jsx
import React, { useState } from 'react';
import { X, Palette, Check, Monitor, Sparkles } from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';

export default function SettingsModal({ onClose }) {
  const { theme, themeId, setTheme } = useTheme();
  const [selected, setSelected] = useState(themeId);

  const handleApply = () => {
    setTheme(selected);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          boxShadow: `0 0 60px ${theme.glow}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: theme.grad, boxShadow: `0 4px 16px ${theme.glow}` }}
            >
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black" style={{ color: theme.text }}>
                Configurações
              </h2>
              <p className="text-xs" style={{ color: theme.muted }}>
                Personalize sua experiência
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:opacity-70"
            style={{ background: theme.faint, border: `1px solid ${theme.border}` }}
          >
            <X className="w-4 h-4" style={{ color: theme.muted }} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tema */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4" style={{ color: theme.soft }} />
              <p className="text-sm font-black uppercase tracking-widest" style={{ color: theme.text }}>
                Tema de Cores
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {Object.values(THEMES).map((t) => {
                const isSelected = selected === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t.id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                    style={{
                      background: isSelected ? `${t.primary}20` : theme.faint,
                      border: `2px solid ${isSelected ? t.primary : theme.border}`,
                      boxShadow: isSelected ? `0 0 16px ${t.glow}` : 'none',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {/* Círculo de cor com preview */}
                    <div className="relative">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ background: t.grad }}
                      />
                      {isSelected && (
                        <div
                          className="absolute inset-0 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(0,0,0,0.4)' }}
                        >
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span
                      className="text-[9px] font-bold uppercase tracking-wide"
                      style={{ color: isSelected ? t.primary : theme.muted }}
                    >
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Preview do tema selecionado */}
            <div
              className="mt-4 p-4 rounded-2xl"
              style={{ background: THEMES[selected].card2, border: `1px solid ${THEMES[selected].border}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: THEMES[selected].grad }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: THEMES[selected].text }}>
                    Preview: {THEMES[selected].name}
                  </p>
                  <p className="text-xs" style={{ color: THEMES[selected].muted }}>
                    Assim vai ficar o seu app
                  </p>
                </div>
                <div
                  className="ml-auto w-6 h-6 rounded-full"
                  style={{ background: THEMES[selected].gradHot }}
                />
              </div>
            </div>
          </div>

          {/* Botão aplicar */}
          <button
            onClick={handleApply}
            className="w-full py-4 rounded-2xl font-black text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: THEMES[selected].grad,
              boxShadow: `0 4px 20px ${THEMES[selected].glow}`,
            }}
          >
            Aplicar Tema {THEMES[selected].emoji}
          </button>
        </div>
      </div>
    </div>
  );
}