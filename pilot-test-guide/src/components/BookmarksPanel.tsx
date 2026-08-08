import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, ChevronRight, X } from 'lucide-react';
import { getBookmarks } from '../lib/bookmarks';
import { sfx } from '../utils/sfx';

interface BookmarksPanelProps {
  mode: string;
  onNavigateToQuestion: (questionId: string) => void;
}

export const BookmarksPanel: React.FC<BookmarksPanelProps> = ({ mode, onNavigateToQuestion }) => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setBookmarks(getBookmarks(mode));
  }, [mode, isOpen]);

  if (bookmarks.length === 0 && !isOpen) return null;

  return (
    <>
      <button
        className="btn-secondary"
        onClick={() => { setIsOpen(true); sfx.playSelect(); }}
        onMouseEnter={() => sfx.playHover()}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          position: 'relative',
        }}
      >
        <Bookmark size={16} />
        Bookmarks
        {bookmarks.length > 0 && (
          <span style={{
            position: 'absolute', top: '-6px', right: '-6px',
            background: '#f59e0b', color: '#000', borderRadius: '50%',
            width: '18px', height: '18px', fontSize: '0.7rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {bookmarks.length}
          </span>
        )}
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
              width: '90%', maxWidth: '500px', maxHeight: '70vh',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookmarkCheck size={18} color="#f59e0b" />
                <h3 style={{ margin: 0 }}>Bookmarked Questions</h3>
                <span className="chip">{bookmarks.length}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                  cursor: 'pointer', padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
              {bookmarks.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Bookmark size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <p>No bookmarked questions yet.</p>
                  <p style={{ fontSize: '0.85rem' }}>Click the Save button on any question to bookmark it.</p>
                </div>
              ) : (
                bookmarks.map(id => (
                  <button
                    key={id}
                    onClick={() => { onNavigateToQuestion(id); setIsOpen(false); sfx.playSelect(); }}
                    onMouseEnter={() => sfx.playHover()}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                      background: 'transparent', border: 'none',
                      color: 'var(--text-primary)', cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      textAlign: 'left',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontWeight: 500 }}>{id}</span>
                    <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                ))
              )}
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
