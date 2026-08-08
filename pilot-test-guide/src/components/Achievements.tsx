import React, { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';
import { getProgress, Achievement } from '../lib/progressTracker';
import { sfx } from '../utils/sfx';

export const Achievements: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const progress = getProgress();
  const unlocked = progress.achievements.filter(a => a.unlocked);

  if (progress.achievements.length === 0) return null;

  return (
    <div className="glass-card animate-in" style={{
      padding: '1.25rem',
      marginTop: '1rem',
      borderLeft: '3px solid #f59e0b',
    }}>
      <button
        onClick={() => { setExpanded(!expanded); sfx.playSelect(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
          background: 'none', border: 'none', color: 'var(--text-primary)',
          cursor: 'pointer', padding: 0, fontSize: '1rem', fontWeight: 600,
        }}
      >
        <Trophy size={18} color="#f59e0b" />
        <span>Achievements</span>
        <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}>
          {unlocked.length}/{progress.achievements.length}
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {expanded && (
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.6rem' }}>
          {progress.achievements.map(ach => (
            <AchievementBadge key={ach.id} achievement={ach} />
          ))}
        </div>
      )}
    </div>
  );
};

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const isUnlocked = achievement.unlocked;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      padding: '0.6rem 0.8rem',
      borderRadius: '8px',
      background: isUnlocked ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isUnlocked ? 'rgba(245, 158, 11, 0.3)' : 'var(--glass-border)'}`,
      opacity: isUnlocked ? 1 : 0.5,
      transition: 'all 0.2s ease',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isUnlocked ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)',
        color: isUnlocked ? '#f59e0b' : 'var(--text-secondary)',
        fontSize: '0.85rem', fontWeight: 700,
      }}>
        {achievement.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.8rem', fontWeight: 600,
          color: isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {achievement.name}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          {achievement.description}
        </div>
      </div>
      {isUnlocked ? (
        <Unlock size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
      ) : (
        <Lock size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
      )}
    </div>
  );
};
