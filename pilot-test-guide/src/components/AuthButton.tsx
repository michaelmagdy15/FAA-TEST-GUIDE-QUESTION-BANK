import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, User as UserIcon } from 'lucide-react';
import { sfx } from '../utils/sfx';

export const AuthButton: React.FC = () => {
  const { user, signIn, logout, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', borderRadius: '12px' }}>
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--accent-color)' }} />
        ) : (
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserIcon size={18} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.displayName}</span>
          <button 
            onClick={() => { sfx.playSelect(); logout(); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer', padding: 0, textDecoration: 'underline', opacity: 0.7 }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => { sfx.playSelect(); signIn(); }}
      onMouseEnter={() => sfx.playHover()}
      className="btn-primary"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        borderRadius: '12px',
        fontSize: '0.9rem',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(10px)',
        color: 'var(--text-primary)'
      }}
    >
      <LogIn size={18} />
      Sign in with Google to save progress
    </button>
  );
};
