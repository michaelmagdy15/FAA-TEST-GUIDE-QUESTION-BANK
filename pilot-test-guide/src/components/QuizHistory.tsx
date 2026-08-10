import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getExamHistory, ExamRecord } from '../lib/progressTracker';

export const QuizHistory: React.FC = () => {
  const [history, setHistory] = useState<ExamRecord[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setHistory(getExamHistory());
  }, []);

  const quizHistory = history.filter(h => h.type === 'quiz').slice().reverse();

  if (quizHistory.length === 0) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-card" style={{ padding: '1rem', marginTop: '1rem' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600,
          fontFamily: 'inherit', padding: 0,
        }}
      >
        <span>Quiz History ({quizHistory.length})</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div style={{ marginTop: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
          {quizHistory.map((q) => (
            <div key={q.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)',
              fontSize: '0.8rem',
            }}>
              {q.passed ? <CheckCircle2 size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{q.category || 'All Categories'}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                  {formatDate(q.date)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, color: q.passed ? '#10b981' : '#ef4444' }}>
                  {Math.round((q.correctAnswers / q.totalQuestions) * 100)}%
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                  {q.correctAnswers}/{q.totalQuestions} · {formatTime(q.timeSpentSeconds)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
