import React from 'react';
import { Question } from '../types';
import { sfx } from '../utils/sfx';

interface QuestionNavigatorProps {
    questions: Question[];
    currentIndex: number;
    selectedAnswers: Record<string, string>;
    isMobileNavOpen: boolean;
    setIsMobileNavOpen: (open: boolean) => void;
    setCurrentIndex: (index: number) => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
    questions,
    currentIndex,
    selectedAnswers,
    isMobileNavOpen,
    setIsMobileNavOpen,
    setCurrentIndex
}) => {
    return (
        <div className="sidebar" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}>
                {/* Collapsible Header */}
                <div
                    className="sidebar-header"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingBottom: '0.5rem' }}
                    onClick={() => { sfx.playSelect(); setIsMobileNavOpen(!isMobileNavOpen); }}
                >
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Navigator</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{Object.keys(selectedAnswers).length}/{questions.length}</span>
                        <span className="mobile-only-icon" style={{ transform: isMobileNavOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', fontSize: '0.8rem' }}>▼</span>
                    </div>
                </div>

                {/* Grid Container (Hidden on mobile if not opened) */}
                <div className={`nav-grid-container ${!isMobileNavOpen ? 'mobile-hidden' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
                    {questions.map((q, idx) => {
                        const qAnswered = selectedAnswers[q.id] !== undefined;
                        const qCorrect = selectedAnswers[q.id] === q.correct;
                        let bgColor = 'var(--glass-bg)';
                        let borderColor = 'var(--glass-border)';
                        if (qAnswered) {
                            bgColor = qCorrect ? 'rgba(46, 160, 67, 0.2)' : 'rgba(248, 81, 73, 0.2)';
                            borderColor = qCorrect ? 'var(--success-color)' : 'var(--error-color)';
                        }
                        if (idx === currentIndex) {
                            borderColor = 'var(--accent-color)';
                            bgColor = 'var(--glass-hover)';
                        }

                        return (
                            <button
                                key={q.id}
                                onClick={() => {
                                    sfx.playSelect();
                                    setCurrentIndex(idx);
                                    if (window.innerWidth <= 1024) {
                                        setIsMobileNavOpen(false);
                                    }
                                }}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    background: bgColor,
                                    border: `1px solid ${borderColor}`,
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontWeight: idx === currentIndex ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease',
                                    minWidth: '40px',
                                    textAlign: 'center'
                                }}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
