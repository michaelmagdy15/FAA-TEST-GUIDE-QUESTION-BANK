import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { sfx } from '../utils/sfx';
import ConfettiExplosion from 'react-confetti-explosion';
import { Plane, Navigation, Zap, ArrowLeft } from 'lucide-react';

import { QuestionNavigator } from './QuestionNavigator';
import { QuestionOptions } from './QuestionOptions';
import { QuestionExplanation } from './QuestionExplanation';

interface QuestionViewProps {
    chapter: string;
    questions: Question[];
    onBack: () => void;
    mode?: 'ppl' | 'ir' | 'cpl';
    progressPrefix?: string;
}

export const QuestionView: React.FC<QuestionViewProps> = ({ chapter, questions, onBack, mode = 'ppl', progressPrefix = 'progress' }) => {
    const isIR = mode === 'ir';
    const isCPL = mode === 'cpl';
    const accentColor = isIR ? '#10b981' : isCPL ? '#f59e0b' : 'var(--accent-color)';
    const modeLabel = isIR ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Navigation size={14} /> IR</span> : isCPL ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={14} /> CPL</span> : <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Plane size={14} /> PPL</span>;
    const storageKey = `${progressPrefix}_${chapter}`;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [showConfetti, setShowConfetti] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    // Reset confetti on question change
    useEffect(() => {
        setShowConfetti(false);
    }, [currentIndex]);

    // Load progress
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            setSelectedAnswers(JSON.parse(saved));
        } else {
            setSelectedAnswers({});
        }
        setCurrentIndex(0);
    }, [chapter, storageKey]);

    // Save progress
    useEffect(() => {
        if (Object.keys(selectedAnswers).length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(selectedAnswers));
        }
    }, [selectedAnswers, chapter, storageKey]);

    const question = questions[currentIndex];

    const total = questions.length;
    const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

    const answered = question ? selectedAnswers[question.id] !== undefined : false;
    const isCorrect = question ? selectedAnswers[question.id] === question.correct : false;

    const handleSelect = React.useCallback((key: string) => {
        if (!question || answered) return;

        const isNowCorrect = key === question.correct;
        if (isNowCorrect) {
            sfx.playCorrect();
            setShowConfetti(true);
        } else {
            sfx.playIncorrect();
        }

        setSelectedAnswers(prev => ({ ...prev, [question.id]: key }));
    }, [answered, question]);

    const handleNext = React.useCallback(() => {
        if (currentIndex < total - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, total]);

    const handlePrev = React.useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!question) return;
            if (e.key === 'Enter' || e.key === 'ArrowRight') {
                if (answered) {
                    sfx.playSelect();
                    handleNext();
                }
            } else if (e.key === 'ArrowLeft') {
                sfx.playSelect();
                handlePrev();
            } else if (!answered) {
                const key = e.key.toUpperCase();
                if (['A', 'B', 'C', 'D'].includes(key) && question.options[key as keyof typeof question.options]) {
                    handleSelect(key);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [answered, question, handleNext, handlePrev, handleSelect]);

    if (!question) return null;



    return (
        <div className="question-view animate-in" style={{ display: 'flex', gap: '2rem', height: '100%' }}>
            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Top Bar */}
                <div className="top-bar" style={{ position: 'relative' }}>
                    {showConfetti && (
                        <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, pointerEvents: 'none' }}>
                            <ConfettiExplosion force={0.6} duration={2200} particleCount={80} width={1000} colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444']} />
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { sfx.playSelect(); onBack(); }} onMouseEnter={() => sfx.playHover()}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <span style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}` }}>
                            {modeLabel}
                        </span>
                    </div>
                    <div className="progress-info" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {chapter === "REVIEW" ? "Reviewing Incorrect" : `${isIR ? 'Module' : isCPL ? 'Chapter' : 'Chapter'} ${chapter}`} - {currentIndex + 1} / {total}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar-container glass-card" style={{ padding: '0', height: '6px', marginBottom: '2rem', overflow: 'hidden', flexShrink: 0 }}>
                    <div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--accent-color)', height: '100%', transition: 'width 0.3s ease' }} />
                </div>

                {/* Question Card */}
                <div className="glass-card question-content animate-in delay-1" style={{ flex: 1 }}>
                    <div className="question-meta" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <span>ID: {question.id}</span>
                        <span>PLT: {question.plt}</span>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', lineHeight: 1.5, marginBottom: '2rem' }}>{question.text}</h2>

                    <QuestionOptions
                        question={question}
                        answered={answered}
                        selectedAnswers={selectedAnswers}
                        handleSelect={handleSelect}
                    />
                </div>

                {/* Explanation Area */}
                {answered && (
                    <QuestionExplanation
                        question={question}
                        isCorrect={isCorrect}
                    />
                )}

                {/* Navigation Controls */}
                <div className="navigation-controls" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', flexShrink: 0, paddingBottom: '1rem' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => { sfx.playSelect(); handlePrev(); }}
                        onMouseEnter={() => sfx.playHover()}
                        disabled={currentIndex === 0}
                        style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
                    >
                        Previous
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => { sfx.playSelect(); handleNext(); }}
                        onMouseEnter={() => sfx.playHover()}
                        disabled={currentIndex === total - 1}
                        style={{ opacity: currentIndex === total - 1 ? 0.5 : 1 }}
                    >
                        Next Question
                    </button>
                </div>
            </div>

            {/* Right Sidebar: Navigation Grid */}
            <QuestionNavigator
                questions={questions}
                currentIndex={currentIndex}
                selectedAnswers={selectedAnswers}
                isMobileNavOpen={isMobileNavOpen}
                setIsMobileNavOpen={setIsMobileNavOpen}
                setCurrentIndex={setCurrentIndex}
            />

            <style>{`
                .option-card.interactive:hover {
                    background: var(--glass-hover);
                    border-color: var(--accent-color);
                    transform: translateX(4px);
                }
                .option-card {
                    transition: all 0.2s ease;
                }
                .option-card.disabled {
                    opacity: 0.6;
                }
                .top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
            `}</style>
        </div>
    );
};
