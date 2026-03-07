import React from 'react';
import { Plane, Navigation, Zap, AlertCircle } from 'lucide-react';
import { sfx } from '../utils/sfx';
import { TestMode } from '../types';

interface ChapterData {
    id: string;
    title: string;
    total: number;
}

interface LandingViewProps {
    mode: TestMode;
    onModeSwitch: (mode: TestMode) => void;
    chapters: ChapterData[];
    onSelect: (chapter: string) => void;
    onReview: () => void;
    totalQuestions: number;
    reviewCount: number;
    chapterProgress: Record<string, number>;
    onResetAll?: () => void;
    onResetChapter?: (chapterId: string) => void;
}

const MODE_CONFIG: Record<TestMode, { label: string; icon: React.ReactNode; accent: string; accentRgb: string; subtitle: string }> = {
    ppl: { label: 'Private Pilot (PPL)', icon: <Plane size={18} />, accent: 'var(--accent-color)', accentRgb: '59, 130, 246', subtitle: 'Private Pilot Test Guide' },
    ir: { label: 'Instrument Rating (IR)', icon: <Navigation size={18} />, accent: '#10b981', accentRgb: '16, 185, 129', subtitle: 'Instrument Rating Test Guide' },
    cpl: { label: 'Commercial Pilot (CPL)', icon: <Zap size={18} />, accent: '#f59e0b', accentRgb: '245, 158, 11', subtitle: 'Commercial Pilot Test Guide' },
};

export const LandingView: React.FC<LandingViewProps> = ({
    mode, onModeSwitch, chapters, onSelect, onReview, totalQuestions, reviewCount, chapterProgress, onResetChapter, onResetAll
}) => {
    const cfg = MODE_CONFIG[mode];

    return (
        <div className="landing-view animate-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '3rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="title">Pilot Test Guide</h1>
                <p className="subtitle" style={{ opacity: 0.8, marginBottom: '2rem' }}>Master your aviation knowledge with our interactive question bank.</p>

                {/* 3-Tab Mode Toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                    <div
                        className="glass-card"
                        style={{ display: 'flex', gap: '0.25rem', padding: '6px', borderRadius: '12px' }}
                    >
                        {(Object.entries(MODE_CONFIG) as [TestMode, typeof cfg][]).map(([m, c]) => {
                            const isActive = mode === m;
                            return (
                                <button
                                    key={m}
                                    onClick={() => { sfx.playSelect(); onModeSwitch(m); }}
                                    onMouseEnter={() => sfx.playHover()}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        transition: 'var(--transition)',
                                        background: isActive ? c.accent : 'transparent',
                                        color: isActive ? '#fff' : 'var(--text-secondary)',
                                        boxShadow: isActive ? `0 4px 14px rgba(${c.accentRgb},0.4)` : 'none',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {c.icon} {c.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 700, color: cfg.accent, lineHeight: 1 }}>{totalQuestions}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Questions Available</span>
                    </div>

                    <div
                        className={`glass-card ${reviewCount > 0 ? 'topic-card' : ''}`}
                        style={{
                            padding: '1.5rem 2.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderColor: reviewCount > 0 ? 'var(--error-color)' : 'var(--glass-border)',
                            cursor: reviewCount > 0 ? 'pointer' : 'default',
                            opacity: reviewCount > 0 ? 1 : 0.6
                        }}
                        onClick={reviewCount > 0 ? () => { sfx.playSelect(); onReview(); } : undefined}
                        onMouseEnter={() => reviewCount > 0 && sfx.playHover()}
                    >
                        <span style={{ fontSize: '2.5rem', fontWeight: 700, color: reviewCount > 0 ? 'var(--error-color)' : 'var(--text-secondary)', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {reviewCount > 0 && <AlertCircle size={28} />}
                            {reviewCount}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Needs Review</span>
                    </div>

                    {/* Reset All Progress Button */}
                    <div className="glass-card" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <button
                            onClick={() => {
                                if (onResetAll && window.confirm("Are you sure you want to reset all progress for this subject?")) {
                                    onResetAll();
                                }
                            }}
                            className="btn-secondary"
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                color: 'var(--error-color)',
                                borderColor: 'var(--error-color)',
                                fontSize: '0.8rem',
                                opacity: 0.8
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
                        >
                            Reset Progress
                        </button>
                    </div>
                </div>
            </header>

            {/* Chapter / Module Grid */}
            <div className="grid">
                {chapters.map((chapter, index) => {
                    const completed = chapterProgress[chapter.id] || 0;
                    const progressPercent = chapter.total > 0 ? (completed / chapter.total) * 100 : 0;

                    return (
                        <div
                            key={chapter.id}
                            className={`glass-card topic-card animate-in delay-${(index % 3) + 1}`}
                            onClick={() => { sfx.playSelect(); onSelect(chapter.id); }}
                            onMouseEnter={() => sfx.playHover()}
                            style={{ position: 'relative', overflow: 'hidden', padding: '1.5rem' }}
                        >
                            <div className="topic-header">Ch {chapter.id}: {chapter.title}</div>
                            <div className="topic-meta" style={{ marginBottom: '0.5rem' }}>
                                <span>{completed > 0 ? `${completed} / ${chapter.total} completed` : `${chapter.total} questions`}</span>
                                <span style={{ color: cfg.accent, fontSize: '1.2rem' }}>&rarr;</span>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: 'var(--glass-border)' }}>
                                <div style={{ width: `${progressPercent}%`, height: '100%', background: cfg.accent, transition: 'width 0.3s ease' }} />
                            </div>

                            {completed > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onResetChapter && window.confirm(`Reset progress for Chapter ${chapter.id}?`)) {
                                            onResetChapter(chapter.id);
                                        }
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        right: '0.5rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--error-color)',
                                        cursor: 'pointer',
                                        opacity: 0.5,
                                        fontSize: '0.8rem'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
