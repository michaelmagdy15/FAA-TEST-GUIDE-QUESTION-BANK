import React from 'react';
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
    progressPrefix: string;
}

const MODE_CONFIG: Record<TestMode, { label: string; emoji: string; accent: string; accentRgb: string; subtitle: string }> = {
    ppl: { label: 'Private Pilot (PPL)', emoji: '✈️', accent: 'var(--accent-color)', accentRgb: '88,166,255', subtitle: 'Private Pilot Test Guide' },
    ir: { label: 'Instrument Rating (IR)', emoji: '🛩️', accent: '#0d7a5f', accentRgb: '13,122,95', subtitle: 'Instrument Rating Test Guide' },
    cpl: { label: 'Commercial Pilot (CPL)', emoji: '🎖️', accent: '#b45309', accentRgb: '180,83,9', subtitle: 'Commercial Pilot Test Guide' },
};

export const LandingView: React.FC<LandingViewProps> = ({
    mode, onModeSwitch, chapters, onSelect, onReview, totalQuestions, reviewCount, progressPrefix
}) => {
    const cfg = MODE_CONFIG[mode];

    return (
        <div className="landing-view animate-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '3rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Egyptian Aviation Academy</h1>
                <p className="subtitle" style={{ opacity: 0.8, marginBottom: '2rem' }}>Master your aviation knowledge with our interactive question bank.</p>

                {/* 3-Tab Mode Toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div
                        className="glass-card"
                        style={{ display: 'flex', gap: '0', padding: '4px', borderRadius: '12px' }}
                    >
                        {(Object.entries(MODE_CONFIG) as [TestMode, typeof cfg][]).map(([m, c]) => {
                            const isActive = mode === m;
                            return (
                                <button
                                    key={m}
                                    onClick={() => { sfx.playSelect(); onModeSwitch(m); }}
                                    onMouseEnter={() => sfx.playHover()}
                                    style={{
                                        padding: '0.65rem 1.5rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.25s ease',
                                        background: isActive ? c.accent : 'transparent',
                                        color: isActive ? '#fff' : 'var(--text-secondary)',
                                        boxShadow: isActive ? `0 2px 12px rgba(${c.accentRgb},0.35)` : 'none',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {c.emoji} {c.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Section label */}
                <h2
                    className="subtitle"
                    style={{ fontSize: '1.4rem', color: cfg.accent, marginBottom: '1.5rem', transition: 'color 0.3s ease' }}
                >
                    {cfg.subtitle}
                </h2>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1rem 2rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: cfg.accent }}>{totalQuestions}</span>
                        <span style={{ marginLeft: '10px', color: 'var(--text-secondary)' }}>Questions Available</span>
                    </div>

                    <div
                        className={`glass-card ${reviewCount > 0 ? 'topic-card' : ''}`}
                        style={{
                            padding: '1rem 2rem',
                            borderColor: reviewCount > 0 ? 'var(--error-color)' : 'var(--glass-border)',
                            cursor: reviewCount > 0 ? 'pointer' : 'default',
                            opacity: reviewCount > 0 ? 1 : 0.6
                        }}
                        onClick={reviewCount > 0 ? () => { sfx.playSelect(); onReview(); } : undefined}
                        onMouseEnter={() => reviewCount > 0 && sfx.playHover()}
                    >
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: reviewCount > 0 ? 'var(--error-color)' : 'var(--text-secondary)' }}>{reviewCount}</span>
                        <span style={{ marginLeft: '10px', color: 'var(--text-secondary)' }}>Incorrect (Review)</span>
                    </div>
                </div>
            </header>

            {/* Chapter / Module Grid */}
            <div className="grid">
                {chapters.map((chapter, index) => {
                    let completed = 0;
                    try {
                        const saved = localStorage.getItem(`${progressPrefix}_${chapter.id}`);
                        if (saved) completed = Object.keys(JSON.parse(saved)).length;
                    } catch (e) { }

                    const progressPercent = chapter.total > 0 ? (completed / chapter.total) * 100 : 0;

                    return (
                        <div
                            key={chapter.id}
                            className={`glass-card topic-card animate-in delay-${(index % 3) + 1}`}
                            onClick={() => { sfx.playSelect(); onSelect(chapter.id); }}
                            onMouseEnter={() => sfx.playHover()}
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            <div className="topic-header">Chapter {chapter.id}: {chapter.title}</div>
                            <div className="topic-meta" style={{ marginBottom: '1rem' }}>
                                <span>{completed > 0 ? `${completed} / ${chapter.total} Answered` : `${chapter.total} Questions`}</span>
                                <span style={{ color: cfg.accent }}>&rarr;</span>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: 'var(--glass-border)' }}>
                                <div style={{ width: `${progressPercent}%`, height: '100%', background: cfg.accent, transition: 'width 0.3s ease' }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
