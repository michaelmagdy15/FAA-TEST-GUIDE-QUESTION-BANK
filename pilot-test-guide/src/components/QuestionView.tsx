import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { sfx } from '../utils/sfx';
import ConfettiExplosion from 'react-confetti-explosion';
import { Plane, Navigation, Zap, ArrowLeft, Bookmark, BookmarkCheck, Search, X } from 'lucide-react';
import figureImages from '../assets/figures/index';
import { toggleBookmark, isBookmarked } from '../lib/bookmarks';

import { QuestionNavigator } from './QuestionNavigator';
import { QuestionOptions } from './QuestionOptions';
import { QuestionExplanation } from './QuestionExplanation';
import { StudyBanner } from './StudyBanner';
import { MistakeTracker } from './MistakeTracker';
import { Achievements } from './Achievements';
import { ConceptExplorer } from './ConceptExplorer';
import { StudyTimer } from './StudyTimer';
import { ExplainItPrompt } from './ExplainItPrompt';
import { recordChapterComplete, recordQuestionAnswer } from '../lib/progressTracker';

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
    const positionKey = `${storageKey}_pos`;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [showConfetti, setShowConfetti] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const loadedRef = useRef(false);
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
    const [timeSpent, setTimeSpent] = useState(0);
    const [bookmarked, setBookmarked] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const question = questions[currentIndex];

    // Reset confetti on question change
    useEffect(() => {
        setShowConfetti(false);
        setQuestionStartTime(Date.now());
        setBookmarked(isBookmarked(question?.id || '', mode));
    }, [currentIndex, question?.id, mode]);

    // Load progress
    useEffect(() => {
        loadedRef.current = false;

        const localSaved = localStorage.getItem(storageKey);
        const merged = localSaved ? JSON.parse(localSaved) : {};
        let savedIndex = 0;
        const localPos = localStorage.getItem(positionKey);
        if (localPos) {
            const parsed = parseInt(localPos, 10);
            if (!isNaN(parsed)) savedIndex = parsed;
        }

        setSelectedAnswers(merged);
        setCurrentIndex(Math.max(0, Math.min(savedIndex, questions.length - 1)));
        loadedRef.current = true;
    }, [chapter, storageKey, positionKey]);

    // Save progress
    useEffect(() => {
        if (!loadedRef.current || Object.keys(selectedAnswers).length === 0) return;
        localStorage.setItem(storageKey, JSON.stringify(selectedAnswers));
    }, [selectedAnswers, chapter, storageKey]);

    // Save current position
    useEffect(() => {
        if (!loadedRef.current || questions.length === 0) return;
        const safeIndex = Math.max(0, Math.min(currentIndex, questions.length - 1));
        localStorage.setItem(positionKey, String(safeIndex));
    }, [currentIndex, questions.length, positionKey]);

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

        const elapsed = Math.round((Date.now() - questionStartTime) / 1000);
        setTimeSpent(elapsed);

        recordQuestionAnswer({
            questionId: question.id,
            mode,
            isCorrect: isNowCorrect,
            timeSeconds: elapsed,
            timestamp: new Date().toISOString(),
        });

        setSelectedAnswers(prev => {
            const updated = { ...prev, [question.id]: key };
            // Check if chapter is complete with all correct
            const allAnswered = questions.every(q => updated[q.id] !== undefined);
            if (allAnswered && chapter !== "REVIEW") {
                const allCorrect = questions.every(q => updated[q.id] === q.correct);
                if (allCorrect) {
                    recordChapterComplete(chapter, questions.length, questions.length);
                }
            }
            return updated;
        });
    }, [answered, question, questionStartTime, questions, chapter]);

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
        <div className="question-view animate-in" style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>
                {/* Top Bar */}
                <div className="top-bar" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {showConfetti && (
                        <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, pointerEvents: 'none' }}>
                            <ConfettiExplosion force={0.6} duration={2200} particleCount={80} width={1000} colors={['#10b981', '#38bdf8', '#f59e0b', '#ef4444']} />
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }} onClick={() => { sfx.playSelect(); onBack(); }} onMouseEnter={() => sfx.playHover()}>
                            <ArrowLeft size={14} /> <span>Back</span>
                        </button>
                        <span style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}` }}>
                            {modeLabel}
                        </span>
                        <span className="chip">
                            Q {currentIndex + 1} / {total}
                        </span>
                        <button
                            onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); sfx.playSelect(); }}
                            onMouseEnter={() => sfx.playHover()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '4px 8px', borderRadius: '6px',
                                background: showSearch ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                                border: `1px solid ${showSearch ? 'rgba(56, 189, 248, 0.4)' : 'var(--glass-border)'}`,
                                color: showSearch ? '#38bdf8' : 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                                transition: 'all 0.15s ease',
                            }}
                            title="Search questions"
                        >
                            {showSearch ? <X size={14} /> : <Search size={14} />}
                            <span>Search</span>
                        </button>
                    </div>
                    <div className="progress-info" style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {chapter === "REVIEW" ? "Reviewing Incorrect" : `${isIR ? 'Module' : isCPL ? 'Chapter' : 'Chapter'} ${chapter}`}
                        <span style={{ color: 'var(--text-secondary)', opacity: 0.7, marginLeft: '0.4rem' }}>
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>

                {/* Search Bar */}
                {showSearch && (
                    <div style={{
                        marginBottom: '1rem',
                        animation: 'fadeIn 0.2s ease',
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            background: 'rgba(56, 189, 248, 0.05)',
                        }}>
                            <Search size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by question text, answer options, or explanation..."
                                autoFocus
                                style={{
                                    flex: 1, background: 'transparent', border: 'none',
                                    color: 'var(--text-primary)', fontSize: '0.9rem',
                                    outline: 'none', fontFamily: 'inherit',
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        background: 'transparent', border: 'none',
                                        color: 'var(--text-secondary)', cursor: 'pointer',
                                        padding: '2px',
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <div style={{
                                marginTop: '0.5rem',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(2, 6, 23, 0.6)',
                            }}>
                                {(() => {
                                    const query = searchQuery.toLowerCase();
                                    const matches = questions
                                        .map((q, i) => ({ q, i }))
                                        .filter(({ q }) =>
                                            q.text.toLowerCase().includes(query) ||
                                            q.explanation.toLowerCase().includes(query) ||
                                            Object.values(q.options).some(opt => opt?.toLowerCase().includes(query))
                                        );
                                    if (matches.length === 0) {
                                        return (
                                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                No questions match "{searchQuery}"
                                            </div>
                                        );
                                    }
                                    return matches.map(({ q, i }) => (
                                        <button
                                            key={q.id}
                                            onClick={() => {
                                                setCurrentIndex(i);
                                                setSearchQuery('');
                                                setShowSearch(false);
                                                sfx.playSelect();
                                            }}
                                            style={{
                                                display: 'block', width: '100%', textAlign: 'left',
                                                padding: '0.6rem 0.75rem', borderRadius: '0',
                                                background: i === currentIndex ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                                border: 'none', borderBottom: '1px solid var(--glass-border)',
                                                color: 'var(--text-primary)', cursor: 'pointer',
                                                fontSize: '0.85rem', fontFamily: 'inherit',
                                                transition: 'background 0.1s ease',
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)'}
                                            onMouseOut={e => e.currentTarget.style.background = i === currentIndex ? 'rgba(56, 189, 248, 0.1)' : 'transparent'}
                                        >
                                            <span style={{ color: '#38bdf8', fontWeight: 600, marginRight: '0.5rem' }}>Q{i + 1}</span>
                                            {q.text.length > 80 ? q.text.slice(0, 80) + '...' : q.text}
                                        </button>
                                    ));
                                })()}
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Bar */}
                <div className="progress-bar-container glass-card" style={{ padding: '0', height: '6px', marginBottom: '1rem', overflow: 'hidden', flexShrink: 0 }}>
                    <div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--accent-color)', height: '100%', transition: 'width 0.3s ease', backgroundImage: 'linear-gradient(90deg, var(--accent-color), var(--accent-hover))' }} />
                </div>

                {/* Study Banner (streak, daily goal, accuracy) */}
                {mode === 'ppl' && <StudyBanner />}

                {/* Question Card */}
                <div className="glass-card question-content animate-in delay-1" style={{ flex: 1, padding: '1rem' }}>
                    <div className="question-meta" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                        <span className="chip">{question.plt}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {question.figureRef && (
                                <span className="chip" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success-color)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                                    Figure {question.figureRef}
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    const nowBookmarked = toggleBookmark(question.id, mode);
                                    setBookmarked(nowBookmarked);
                                    sfx.playSelect();
                                }}
                                onMouseEnter={() => sfx.playHover()}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '3px',
                                    padding: '3px 6px', borderRadius: '6px',
                                    background: bookmarked ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                                    border: `1px solid ${bookmarked ? 'rgba(245, 158, 11, 0.4)' : 'var(--glass-border)'}`,
                                    color: bookmarked ? '#f59e0b' : 'var(--text-secondary)',
                                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
                                    transition: 'all 0.15s ease',
                                }}
                                title={bookmarked ? "Remove bookmark" : "Bookmark this question"}
                            >
                                {bookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                                {bookmarked ? 'Saved' : 'Save'}
                            </button>
                        </div>
                    </div>
                    {question.figureRef && figureImages[question.figureRef] && (
                        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                            <img
                                src={figureImages[question.figureRef]}
                                alt={`FAA Figure ${question.figureRef}`}
                                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
                            />
                            <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Figure {question.figureRef}
                            </div>
                        </div>
                    )}
                    <h2 style={{ fontSize: '1.15rem', lineHeight: 1.4, marginBottom: '1rem' }}>{question.text}</h2>

                    <QuestionOptions
                        question={question}
                        answered={answered}
                        selectedAnswers={selectedAnswers}
                        handleSelect={handleSelect}
                    />
                </div>

                {/* Explanation Area */}
                {answered && (
                    <>
                        <QuestionExplanation
                            question={question}
                            isCorrect={isCorrect}
                            timeSpentSeconds={timeSpent}
                        />
                        <ExplainItPrompt question={question} />
                    </>
                )}

                {/* Navigation Controls */}
                <div className="navigation-controls" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', flexShrink: 0, paddingBottom: '0.5rem', gap: '0.5rem' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => { sfx.playSelect(); handlePrev(); }}
                        onMouseEnter={() => sfx.playHover()}
                        disabled={currentIndex === 0}
                        style={{ opacity: currentIndex === 0 ? 0.5 : 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem' }}
                    >
                        Previous
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => { sfx.playSelect(); handleNext(); }}
                        onMouseEnter={() => sfx.playHover()}
                        disabled={currentIndex === total - 1}
                        style={{ opacity: currentIndex === total - 1 ? 0.5 : 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem' }}
                    >
                        Next
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

            {/* Right Sidebar: Learning Tools */}
            {mode === 'ppl' && (
                <div className="sidebar-desktop" style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', paddingBottom: '1rem' }}>
                    <StudyTimer />
                    <MistakeTracker />
                    <Achievements />
                    <ConceptExplorer />
                </div>
            )}

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
                    margin-bottom: 1.25rem;
                }
            `}</style>
        </div>
    );
};
