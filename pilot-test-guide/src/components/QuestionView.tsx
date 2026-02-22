import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { sfx } from '../utils/sfx';
import ConfettiExplosion from 'react-confetti-explosion';

import { AirfoilAnim } from './animations/AirfoilAnim';
import { InstrumentAnim } from './animations/InstrumentAnim';
import { WeatherAnim } from './animations/WeatherAnim';
import { MapAnim } from './animations/MapAnim';
import { GenericPlaneAnim } from './animations/GenericPlaneAnim';

interface QuestionViewProps {
    chapter: string;
    questions: Question[];
    onBack: () => void;
}

export const QuestionView: React.FC<QuestionViewProps> = ({ chapter, questions, onBack }) => {
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
        const saved = localStorage.getItem(`progress_${chapter}`);
        if (saved) {
            setSelectedAnswers(JSON.parse(saved));
        } else {
            setSelectedAnswers({});
        }
        setCurrentIndex(0);
    }, [chapter]);

    // Save progress
    useEffect(() => {
        if (Object.keys(selectedAnswers).length > 0) {
            localStorage.setItem(`progress_${chapter}`, JSON.stringify(selectedAnswers));
        }
    }, [selectedAnswers, chapter]);

    const question = questions[currentIndex];
    if (!question) return null;

    const total = questions.length;
    const progress = ((currentIndex + 1) / total) * 100;

    const answered = selectedAnswers[question.id] !== undefined;
    const isCorrect = selectedAnswers[question.id] === question.correct;

    const handleSelect = (key: string) => {
        if (answered) return;

        const isNowCorrect = key === question.correct;
        if (isNowCorrect) {
            sfx.playCorrect();
            setShowConfetti(true);
        } else {
            sfx.playIncorrect();
        }

        setSelectedAnswers(prev => ({ ...prev, [question.id]: key }));
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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
                if (['A', 'B', 'C'].includes(key) && question.options[key as keyof typeof question.options]) {
                    handleSelect(key);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [answered, currentIndex, question]);

    const handleNext = () => {
        if (currentIndex < total - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const getOptionClass = (key: string) => {
        let base = "glass-card option-card animate-in delay-2";
        if (!answered) return `${base} interactive`;

        if (key === question.correct) return `${base} correct`;
        if (key === selectedAnswers[question.id]) return `${base} incorrect`;

        return `${base} disabled`;
    };

    return (
        <div className="question-view animate-in" style={{ display: 'flex', gap: '2rem', height: '100%' }}>
            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Top Bar */}
                <div className="top-bar" style={{ position: 'relative' }}>
                    {showConfetti && (
                        <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, pointerEvents: 'none' }}>
                            <ConfettiExplosion force={0.6} duration={2200} particleCount={80} width={1000} colors={['#2ea043', '#58a6ff', '#e3b341', '#f85149']} />
                        </div>
                    )}
                    <button className="btn-secondary" onClick={() => { sfx.playSelect(); onBack(); }} onMouseEnter={() => sfx.playHover()}>&larr; Back to Chapters</button>
                    <div className="progress-info" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {chapter === "REVIEW" ? "Reviewing Incorrect" : `Chapter ${chapter}`} - {currentIndex + 1} / {total}
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

                    <div className="options-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {Object.entries(question.options).map(([key, text]) => (
                            <div
                                key={key}
                                className={getOptionClass(key)}
                                onClick={() => handleSelect(key)}
                                onMouseEnter={() => !answered && sfx.playHover()}
                                style={{
                                    cursor: answered ? 'default' : 'pointer',
                                    padding: '1.25rem',
                                    border: getOptionClass(key).includes('correct') ? '1px solid var(--success-color)' : getOptionClass(key).includes('incorrect') ? '1px solid var(--error-color)' : '1px solid var(--glass-border)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ fontWeight: 'bold', minWidth: '24px' }}>{key}.</div>
                                    <div>{text as string}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Explanation Area */}
                {answered && (
                    <div className="glass-card explanation-card animate-in delay-3" style={{ marginTop: '2rem', background: isCorrect ? 'rgba(46, 160, 67, 0.1)' : 'rgba(248, 81, 73, 0.1)', borderColor: isCorrect ? 'var(--success-color)' : 'var(--error-color)', flexShrink: 0, display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ marginBottom: '1rem', color: isCorrect ? 'var(--success-color)' : 'var(--error-color)' }}>
                                {isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${question.correct}.`}
                            </h3>
                            <p style={{ lineHeight: 1.6 }}>{question.explanation}</p>
                        </div>

                        {/* Dynamic SVG Engine Rendering */}
                        <div style={{ width: '200px', flexShrink: 0, opacity: 0.8 }}>
                            {(() => {
                                const text = (question.text + " " + question.explanation).toLowerCase();
                                if (text.match(/lift|drag|airfoil|wing|angle of attack|stall|camber|chord|aerodynamic/)) return <AirfoilAnim />;
                                if (text.match(/altimeter|indicator|gauge|compass|turn coordinator|airspeed|pitot|static|gyroscopic/)) return <InstrumentAnim />;
                                if (text.match(/cloud|rain|front|temperature|dewpoint|forecast|wind|icing|fog|weather|meteorology|thunderstorm/)) return <WeatherAnim />;
                                if (text.match(/vor|course|radial|heading|true north|magnetic|deviation|route|navigation|latitude|longitude/)) return <MapAnim />;
                                return <GenericPlaneAnim />;
                            })()}
                        </div>
                    </div>
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
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{Object.keys(selectedAnswers).length}/{total}</span>
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
                                        // Auto-close nav on mobile when selecting a question to save space
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
