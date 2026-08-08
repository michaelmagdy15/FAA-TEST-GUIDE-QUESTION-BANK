import React, { useState } from 'react';
import { Shuffle, X, Hash, BookOpen } from 'lucide-react';
import { Question } from '../types';
import { sfx } from '../utils/sfx';

interface QuizSetupProps {
  questions: Question[];
  mode: string;
  onStart: (selectedQuestions: Question[], category: string) => void;
  onClose: () => void;
}

const QUESTION_COUNTS = [10, 20, 30, 50];

export const QuizSetup: React.FC<QuizSetupProps> = ({ questions, onStart, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCount, setSelectedCount] = useState(20);

  const categories = React.useMemo(() => {
    const cats = new Map<string, number>();
    questions.forEach(q => {
      const cat = q.category || 'General';
      cats.set(cat, (cats.get(cat) || 0) + 1);
    });
    return Array.from(cats.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [questions]);

  const filteredQuestions = React.useMemo(() => {
    if (selectedCategory === 'all') return questions;
    return questions.filter(q => (q.category || 'General') === selectedCategory);
  }, [questions, selectedCategory]);

  const handleStart = () => {
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(selectedCount, shuffled.length));
    sfx.playSelect();
    onStart(picked, selectedCategory);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <div
        className="glass-card"
        style={{ width: '90%', maxWidth: '480px', padding: '1.5rem' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shuffle size={18} color="#38bdf8" />
            <h3 style={{ margin: 0 }}>Setup Quiz</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Category Selection */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
            <BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Category
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              onClick={() => { setSelectedCategory('all'); sfx.playHover(); }}
              style={{
                padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500,
                border: `1px solid ${selectedCategory === 'all' ? '#38bdf8' : 'var(--glass-border)'}`,
                background: selectedCategory === 'all' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: selectedCategory === 'all' ? '#38bdf8' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit',
              }}
            >
              All ({questions.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => { setSelectedCategory(cat.name); sfx.playHover(); }}
                style={{
                  padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500,
                  border: `1px solid ${selectedCategory === cat.name ? '#38bdf8' : 'var(--glass-border)'}`,
                  background: selectedCategory === cat.name ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: selectedCategory === cat.name ? '#38bdf8' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit',
                }}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
            <Hash size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Number of Questions
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {QUESTION_COUNTS.map(count => (
              <button
                key={count}
                onClick={() => { setSelectedCount(count); sfx.playHover(); }}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
                  border: `1px solid ${selectedCount === count ? '#38bdf8' : 'var(--glass-border)'}`,
                  background: selectedCount === count ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: selectedCount === count ? '#38bdf8' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit',
                }}
              >
                {count}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            {filteredQuestions.length} questions available in this category
          </div>
        </div>

        {/* Start Button */}
        <button
          className="btn-primary"
          onClick={handleStart}
          disabled={filteredQuestions.length === 0}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            opacity: filteredQuestions.length === 0 ? 0.5 : 1,
          }}
        >
          <Shuffle size={16} />
          Start Quiz ({Math.min(selectedCount, filteredQuestions.length)} questions)
        </button>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
};
