import React, { useState, useEffect } from 'react';
import { PenLine, Eye, EyeOff } from 'lucide-react';
import { Question } from '../types';
import { sfx } from '../utils/sfx';

interface Props {
  question: Question;
}

export const ExplainItPrompt: React.FC<Props> = ({ question }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  // Show prompt after answering 5 questions (every 5th)
  useEffect(() => {
    const storageKey = 'pilot_guide_questions_since_explain';
    const count = parseInt(localStorage.getItem(storageKey) || '0', 10) + 1;
    localStorage.setItem(storageKey, String(count));

    if (count % 5 === 0) {
      setShowPrompt(true);
    }
  }, [question.id]);

  if (!showPrompt) return null;

  return (
    <div className="glass-card animate-in" style={{
      padding: '1.25rem',
      marginTop: '1rem',
      borderLeft: '3px solid #10b981',
      background: 'rgba(16, 185, 129, 0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
        <PenLine size={18} color="#10b981" />
        <span style={{ fontWeight: 700, color: '#10b981', fontSize: '0.95rem' }}>Explain It</span>
        <span className="chip" style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
          Active Recall
        </span>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
        Without looking, explain in your own words what makes this concept work. Type your explanation below:
      </p>

      <textarea
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
        placeholder="Type your explanation here..."
        style={{
          width: '100%', minHeight: '80px',
          padding: '0.75rem', borderRadius: '8px',
          border: '1px solid var(--glass-border)',
          background: 'rgba(2, 6, 23, 0.6)',
          color: 'var(--text-primary)',
          fontFamily: 'inherit', fontSize: '0.9rem',
          resize: 'vertical',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#10b981'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
      />

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <button
          onClick={() => { setShowComparison(true); sfx.playSelect(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.4rem 0.8rem', borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
        >
          {showComparison ? <EyeOff size={14} /> : <Eye size={14} />}
          {showComparison ? 'Hide' : 'Compare'} with explanation
        </button>
        <button
          onClick={() => { setShowPrompt(false); setUserInput(''); setShowComparison(false); sfx.playHover(); }}
          style={{
            padding: '0.4rem 0.8rem', borderRadius: '6px',
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--glass-border)',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
          }}
        >
          Skip
        </button>
      </div>

      {showComparison && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.75rem',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Official Explanation
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
