// src/components/TiltCard.jsx — Efeito 3D tilt ao hover
import React, { useRef, useCallback } from 'react';

export default function TiltCard({ children, className = '', style = {}, intensity = 15, glare = true, scale = 1.02 }) {
  const ref = useRef(null);
  const glareRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -intensity;
    const rotY = ((x - cx) / cx) * intensity;

    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
    el.style.transition = 'transform 0.1s ease-out';

    if (glare && glareRef.current) {
      const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI);
      glareRef.current.style.opacity = '0.15';
      glareRef.current.style.transform = `rotate(${angle}deg)`;
    }
  }, [intensity, scale, glare]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    if (glare && glareRef.current) glareRef.current.style.opacity = '0';
  }, [glare]);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ ...style, transformStyle: 'preserve-3d', willChange: 'transform' }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
      {glare && (
        <div ref={glareRef} className="absolute inset-0 pointer-events-none rounded-inherit overflow-hidden opacity-0 transition-opacity duration-300"
          style={{ borderRadius: 'inherit', background: 'linear-gradient(105deg, rgba(255,255,255,0.4) 0%, transparent 60%)', mixBlendMode: 'overlay' }} />
      )}
    </div>
  );
}