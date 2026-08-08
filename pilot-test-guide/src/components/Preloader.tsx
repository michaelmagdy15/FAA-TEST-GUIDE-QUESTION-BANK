import React, { useEffect, useState } from 'react';

export const Preloader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setFadeOut(true), 200);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#030712',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.08) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.08) 0px, transparent 50%)',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
      pointerEvents: fadeOut ? 'none' : 'auto',
    }}>
      {/* Spinning plane icon */}
      <div style={{ marginBottom: '2rem', animation: 'preloaderSpin 2s linear infinite' }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <defs>
            <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="36" stroke="url(#planeGrad)" strokeWidth="2" strokeDasharray="8 4" opacity="0.3" />
          <path d="M40 16L44 36H64L48 44L52 64L40 52L28 64L32 44L16 36H36L40 16Z" fill="url(#planeGrad)" />
        </svg>
      </div>

      {/* Logo text */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.5rem', fontWeight: 700, margin: 0,
          background: 'linear-gradient(135deg, #38bdf8, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          ATPL<span style={{ WebkitTextFillColor: '#f8fafc' }}>Vector</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Pilot Test Guide
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ width: '200px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
          width: `${Math.min(progress, 100)}%`, height: '100%',
          background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',
          borderRadius: '999px',
          transition: 'width 0.2s ease-out',
        }} />
      </div>

      <style>{`
        @keyframes preloaderSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
