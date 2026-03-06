// src/components/CustomTags.jsx — Tags customizadas por jogo
import React, { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PRESET_TAGS = [
  { label: 'Favorito', emoji: '❤️', color: '#f43f5e' },
  { label: 'Replay', emoji: '🔄', color: '#8b5cf6' },
  { label: 'Presente', emoji: '🎁', color: '#10b981' },
  { label: 'Indie', emoji: '🎨', color: '#f59e0b' },
  { label: 'Difícil', emoji: '💀', color: '#ef4444' },
  { label: 'Co-op', emoji: '👥', color: '#06b6d4' },
  { label: 'Maratona', emoji: '⏰', color: '#a855f7' },
  { label: 'Clássico', emoji: '🏛️', color: '#84cc16' },
];

export function TagBadge({ tag, onRemove, small = false }) {
  const { theme: V } = useTheme();
  const preset = PRESET_TAGS.find(p => p.label === tag) || null;
  const color = preset?.color || V.primary;
  const emoji = preset?.emoji || '🏷️';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold transition-all ${small ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'}`}
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
      <span>{emoji}</span>
      <span>{tag}</span>
      {onRemove && (
        <button onClick={e => { e.stopPropagation(); onRemove(tag); }} className="ml-0.5 hover:opacity-70">
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  );
}

export default function CustomTagsEditor({ tags = [], onChange }) {
  const { theme: V } = useTheme();
  const [custom, setCustom] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 8) return;
    onChange([...tags, trimmed]);
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  return (
    <div>
      {/* Tags existentes */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map(tag => <TagBadge key={tag} tag={tag} onRemove={removeTag} />)}
        </div>
      )}

      {/* Input custom */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { addTag(custom); setCustom(''); } }}
            placeholder="Tag customizada..."
            className="w-full pl-3 pr-8 py-2 rounded-xl text-xs outline-none"
            style={{ background: V.faint, border: `1px solid ${V.border}`, color: V.text, fontSize: 14 }}
          />
          {custom && (
            <button onClick={() => { addTag(custom); setCustom(''); }} className="absolute right-2 top-1/2 -translate-y-1/2">
              <Plus className="w-3.5 h-3.5" style={{ color: V.primary }} />
            </button>
          )}
        </div>
        <button onClick={() => setShowPresets(s => !s)}
          className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
          style={{ background: showPresets ? `${V.primary}20` : V.faint, border: `1px solid ${showPresets ? V.primary : V.border}`, color: showPresets ? V.primary : V.muted }}>
          <Tag className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Presets */}
      {showPresets && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {PRESET_TAGS.filter(p => !tags.includes(p.label)).map(p => (
            <button key={p.label} onClick={() => { addTag(p.label); }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all hover:scale-105"
              style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}30` }}>
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      )}
      {tags.length >= 8 && <p className="text-[10px] mt-1" style={{ color: V.low }}>Máximo de 8 tags por jogo</p>}
    </div>
  );
}