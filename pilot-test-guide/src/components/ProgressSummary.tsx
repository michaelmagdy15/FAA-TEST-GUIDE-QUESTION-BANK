import React from 'react';
import { CheckCircle2, Circle, BarChart3 } from 'lucide-react';
import { getAnsweredCount, getOverallAccuracy } from '../lib/progressTracker';

interface ProgressSummaryProps {
  mode: string;
  totalQuestions: number;
  chapterCounts: { id: string; title: string; total: number; answered: number }[];
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({ mode, totalQuestions, chapterCounts }) => {
  const answered = getAnsweredCount(mode);
  const remaining = totalQuestions - answered;
  const accuracy = getOverallAccuracy();
  const percent = totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <BarChart3 size={18} color="#38bdf8" />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Your Progress</h3>
      </div>

      {/* Main stats */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#38bdf8' }}>{answered}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>solved</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            of {totalQuestions} total
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#a78bfa' }}>{remaining}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>remaining</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {percent}% complete
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: accuracy >= 0.7 ? 'var(--success-color)' : 'var(--error-color)' }}>
              {Math.round(accuracy * 100)}%
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>accuracy</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            overall
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{
          width: `${percent}%`, height: '100%', borderRadius: '4px',
          background: 'linear-gradient(90deg, #38bdf8, #a78bfa)',
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Chapter breakdown */}
      {chapterCounts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {chapterCounts.map(ch => {
            const chPercent = ch.total > 0 ? Math.round((ch.answered / ch.total) * 100) : 0;
            const isDone = ch.answered >= ch.total && ch.total > 0;
            return (
              <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                {isDone ? (
                  <CheckCircle2 size={14} style={{ color: 'var(--success-color)', flexShrink: 0 }} />
                ) : (
                  <Circle size={14} style={{ color: 'var(--text-secondary)', opacity: 0.4, flexShrink: 0 }} />
                )}
                <span style={{ flex: 1, color: isDone ? 'var(--success-color)' : 'var(--text-primary)', fontWeight: isDone ? 600 : 400 }}>
                  {ch.title}
                </span>
                <span style={{ color: 'var(--text-secondary)', minWidth: '60px', textAlign: 'right' }}>
                  {ch.answered}/{ch.total}
                </span>
                <div style={{ width: '60px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${chPercent}%`, height: '100%', borderRadius: '2px',
                    background: isDone ? 'var(--success-color)' : 'var(--accent-color)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
