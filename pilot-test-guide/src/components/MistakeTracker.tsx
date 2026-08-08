import React, { useState } from 'react';
import { TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { getWeakCategories, getProgress } from '../lib/progressTracker';
import { sfx } from '../utils/sfx';

export const MistakeTracker: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const weakCategories = getWeakCategories(0.7);
  const progress = getProgress();

  if (weakCategories.length === 0 && progress.mistakePatterns.length === 0) return null;

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
        <TrendingDown size={18} color="#f59e0b" />
        <span>Weak Areas</span>
        {weakCategories.length > 0 && (
          <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}>
            {weakCategories.length} need work
          </span>
        )}
        <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {expanded && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Category accuracy breakdown */}
          {weakCategories.map(({ category, accuracy, attempts }) => (
            <div key={category} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(245, 158, 11, 0.06)',
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.15)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{category}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {attempts} questions attempted
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontWeight: 700, fontSize: '1.1rem',
                  color: accuracy >= 0.6 ? '#f59e0b' : '#ef4444',
                }}>
                  {Math.round(accuracy * 100)}%
                </div>
                <div style={{ width: '80px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    background: accuracy >= 0.6 ? '#f59e0b' : '#ef4444',
                    width: `${accuracy * 100}%`,
                  }} />
                </div>
              </div>
            </div>
          ))}

          {/* Most missed questions */}
          {progress.mistakePatterns.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Most Missed Questions
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {progress.mistakePatterns
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 8)
                  .map(p => p.questionIds.slice(0, 3).map(qid => (
                    <span key={qid} className="chip" style={{
                      fontSize: '0.7rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                    }}>
                      {qid}
                    </span>
                  )))
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
