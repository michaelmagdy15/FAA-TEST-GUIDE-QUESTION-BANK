import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { sfx } from '../utils/sfx';

const SHORTCUTS = [
  { keys: ['A', 'B', 'C', 'D'], description: 'Select answer' },
  { keys: ['→'], description: 'Next question' },
  { keys: ['←'], description: 'Previous question' },
  { keys: ['Enter'], description: 'Next (after answering)' },
  { keys: ['?'], description: 'Toggle this help' },
];

export const KeyboardHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => { setIsOpen(true); sfx.playSelect(); }}
        onMouseEnter={() => sfx.playHover()}
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
          color: 'var(--text-secondary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.15s ease', zIndex: 100,
        }}
        title="Keyboard shortcuts (?)"
      >
        <Keyboard size={20} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }} onClick={() => setIsOpen(false)}>
          <div
            className="glass-card"
            style={{
              width: '90%', maxWidth: '400px',
              padding: '1.5rem',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Keyboard size={18} color="#38bdf8" />
                <h3 style={{ margin: 0 }}>Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {SHORTCUTS.map((shortcut, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{shortcut.description}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {shortcut.keys.map(key => (
                      <kbd key={key} style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        minWidth: '28px', height: '28px', padding: '0 6px',
                        borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                      }}>
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
};
