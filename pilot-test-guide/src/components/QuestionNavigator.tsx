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
        <div className="sidebar" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', minHeight: 0 }}>
            <div className="glass-card" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>
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
                                    borderRadius: '8px',
                                    background: bgColor,
                                    border: `1px solid ${borderColor}`,
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontWeight: idx === currentIndex ? 'bold' : 'normal',
                                    transition: 'all 0.15s ease',
                                    minWidth: '40px',
                                    textAlign: 'center',
                                    boxShadow: idx === currentIndex ? '0 0 0 2px var(--accent-color)' : 'none',
                                }}
                                onMouseEnter={(e) => { if (idx !== currentIndex) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {[
                        { color: 'var(--success-color)', label: 'Correct' },
                        { color: 'var(--error-color)', label: 'Incorrect' },
                        { color: 'var(--accent-color)', label: 'Current' },
                        { color: 'var(--glass-border)', label: 'Unanswered' },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: item.color, display: 'inline-block', opacity: 0.9 }} />
                            {item.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
