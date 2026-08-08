import React from 'react';
import { Flame, Target, CheckCircle2 } from 'lucide-react';
import { getTodayGoal, getStudyStreak, getOverallAccuracy } from '../lib/progressTracker';

export const StudyBanner: React.FC = () => {
  const streak = getStudyStreak();
  const goal = getTodayGoal();
  const accuracy = getOverallAccuracy();
  const goalPercent = Math.min(100, Math.round((goal.answered / goal.target) * 100));

  return (
    <div style={{
      display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem',
      padding: '1rem 1.25rem',
      background: 'rgba(2, 6, 23, 0.5)',
      borderRadius: '12px',
      border: '1px solid var(--glass-border)',
    }}>
      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '140px' }}>
        <Flame size={20} color={streak >= 7 ? '#ef4444' : streak >= 3 ? '#f59e0b' : '#6b7280'} />
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Streak</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: streak >= 7 ? '#ef4444' : streak >= 3 ? '#f59e0b' : 'var(--text-primary)' }}>
            {streak} day{streak !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Daily Goal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1.2, minWidth: '180px' }}>
        <Target size={20} color={goal.met ? '#10b981' : '#6b7280'} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Daily Goal</span>
            <span>{goal.answered}/{goal.target}</span>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              background: goal.met ? '#10b981' : 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
              width: `${goalPercent}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
          {goal.met && (
            <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <CheckCircle2 size={10} /> Goal met!
            </div>
          )}
        </div>
      </div>

      {/* Overall Accuracy */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 0.8, minWidth: '120px' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${accuracy >= 0.8 ? '#10b981' : accuracy >= 0.6 ? '#f59e0b' : '#ef4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: accuracy >= 0.8 ? '#10b981' : accuracy >= 0.6 ? '#f59e0b' : '#ef4444' }}>
          {Math.round(accuracy * 100)}
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accuracy</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {Math.round(accuracy * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};
