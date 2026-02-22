import React from 'react';
import { sfx } from '../utils/sfx';

interface ChapterData {
    id: string;
    title: string;
    total: number;
}

interface LandingViewProps {
    chapters: ChapterData[];
    onSelect: (chapter: string) => void;
    onReview: () => void;
    totalQuestions: number;
    reviewCount: number;
}

export const LandingView: React.FC<LandingViewProps> = ({ chapters, onSelect, onReview, totalQuestions, reviewCount }) => {
    return (
        <div className="landing-view animate-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '3rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="title" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Egyptian Aviation Academy</h1>
                <h2 className="subtitle" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Private Pilot Test Guide</h2>
                <p className="subtitle" style={{ opacity: 0.8 }}>Master your aviation knowledge with our interactive question bank.</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1rem 2rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-color)' }}>{totalQuestions}</span>
                        <span style={{ marginLeft: '10px', color: 'var(--text-secondary)' }}>Questions Available</span>
                    </div>

                    <div className={`glass-card ${reviewCount > 0 ? 'topic-card' : ''}`}
                        style={{ padding: '1rem 2rem', borderColor: reviewCount > 0 ? 'var(--error-color)' : 'var(--glass-border)', cursor: reviewCount > 0 ? 'pointer' : 'default', opacity: reviewCount > 0 ? 1 : 0.6 }}
                        onClick={reviewCount > 0 ? () => { sfx.playSelect(); onReview(); } : undefined}
                        onMouseEnter={() => reviewCount > 0 && sfx.playHover()}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: reviewCount > 0 ? 'var(--error-color)' : 'var(--text-secondary)' }}>{reviewCount}</span>
                        <span style={{ marginLeft: '10px', color: 'var(--text-secondary)' }}>Incorrect (Review)</span>
                    </div>
                </div>
            </header>

            <div className="grid">
                {chapters.map((chapter, index) => {
                    // Try to grab local progress for display
                    let completed = 0;
                    try {
                        const saved = localStorage.getItem(`progress_${chapter.id}`);
                        if (saved) {
                            completed = Object.keys(JSON.parse(saved)).length;
                        }
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
                                <span style={{ color: 'var(--accent-color)' }}>&rarr;</span>
                            </div>

                            {/* Progress Bar inside Card */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: 'var(--glass-border)' }}>
                                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.3s ease' }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
