import React, { useRef, useState } from 'react';
import { Plane, Navigation, Zap, AlertCircle, BookOpen, RotateCcw, CheckCircle2, Download, Upload, Shuffle, FileText, RefreshCw } from 'lucide-react';
import { sfx } from '../utils/sfx';
import { TestMode } from '../types';
import { BookmarksPanel } from './BookmarksPanel';
import { exportProgressFile, importProgressFile } from '../lib/exportReport';
import { syncNow } from '../lib/cloudflareSync';
import { ProgressSummary } from './ProgressSummary';
import { PerformanceCharts } from './PerformanceCharts';
import { QuizHistory } from './QuizHistory';
import { getAnsweredCount } from '../lib/progressTracker';

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
    onNavigateToQuestion?: (questionId: string) => void;
    onStartQuiz?: () => void;
    onStartExam?: (type: 'ppl' | 'ir' | 'cpl' | 'airline') => void;
    onStudyGuide?: () => void;
}

const MODE_CONFIG: Record<TestMode, { label: string; shortLabel: string; icon: React.ReactNode; accent: string; accentRgb: string }> = {
    ppl: { label: 'Private Pilot (PPL)', shortLabel: 'PPL', icon: <Plane size={16} />, accent: 'var(--accent-color)', accentRgb: '56, 189, 248' },
    ir: { label: 'Instrument Rating (IR)', shortLabel: 'IR', icon: <Navigation size={16} />, accent: '#10b981', accentRgb: '16, 185, 129' },
    cpl: { label: 'Commercial Pilot (CPL)', shortLabel: 'CPL', icon: <Zap size={16} />, accent: '#f59e0b', accentRgb: '245, 158, 11' },
    c172: { label: 'Cessna 172R', shortLabel: 'C172', icon: <Plane size={16} />, accent: '#06b6d4', accentRgb: '6, 182, 212' },
    airline: { label: 'Airline Pilot (ATPL)', shortLabel: 'ATPL', icon: <Plane size={16} />, accent: '#a78bfa', accentRgb: '167, 139, 250' },
};

const EXAM_CONFIG = {
    ppl: { label: 'PPL Exam', questions: 60, time: '2h 30m', passing: '70%' },
    ir: { label: 'IR Exam', questions: 80, time: '3h 00m', passing: '70%' },
    cpl: { label: 'CPL Exam', questions: 100, time: '4h 00m', passing: '70%' },
    airline: { label: 'ATPL Exam', questions: 50, time: '2h 00m', passing: '70%' },
};

export const LandingView: React.FC<LandingViewProps> = ({
    mode, onModeSwitch, chapters, onSelect, onReview, totalQuestions, reviewCount, chapterProgress,
    onResetChapter, onResetAll, onNavigateToQuestion, onStartQuiz, onStartExam, onStudyGuide
}) => {
    const cfg = MODE_CONFIG[mode];
    const answered = getAnsweredCount(mode);
    const remaining = totalQuestions - answered;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'ok' | 'error'>('idle');

    const handleSync = async () => {
        setSyncing(true);
        setSyncStatus('idle');
        const ok = await syncNow();
        setSyncing(false);
        setSyncStatus(ok ? 'ok' : 'error');
        setTimeout(() => setSyncStatus('idle'), 2000);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const result = await importProgressFile(file);
            alert(`Imported ${result.imported} progress items. Reloading...`);
            // Force a hard reload to pick up new localStorage values
            setTimeout(() => {
                window.location.href = window.location.pathname;
            }, 100);
        } catch (err) {
            alert('Failed to import: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="landing-view animate-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {onNavigateToQuestion && <BookmarksPanel mode={mode} onNavigateToQuestion={onNavigateToQuestion} />}
            </div>

            <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <img src="/logo.svg" alt="ATPLVector logo" style={{ width: '64px', height: '64px', filter: 'drop-shadow(0 10px 28px rgba(56, 189, 248, 0.35))' }} />
                </div>
                <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.25rem', lineHeight: 1.1 }}>
                    <span style={{ background: 'linear-gradient(135deg, #38bdf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ATPL</span>
                    <span style={{ color: 'var(--text-primary)' }}>Vector</span>
                    <span style={{ fontSize: '0.4em', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '0.5rem', verticalAlign: 'middle' }}>Pilot Test Guide</span>
                </h1>
                <p className="subtitle" style={{ opacity: 0.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
                    {answered > 0
                        ? `${answered} questions solved · ${remaining} remaining`
                        : 'Master your aviation knowledge with our interactive question bank.'
                    }
                </p>

                {/* Mode Toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <div className="glass-card mode-toggle-scroll" style={{ display: 'flex', gap: '0.25rem', padding: '4px', borderRadius: '14px' }}>
                        {(Object.entries(MODE_CONFIG) as [TestMode, typeof cfg][]).map(([m, c]) => {
                            const isActive = mode === m;
                            return (
                                <button key={m} onClick={() => { sfx.playSelect(); onModeSwitch(m); }} onMouseEnter={() => sfx.playHover()}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                        padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                        fontWeight: isActive ? 600 : 500, fontSize: '0.85rem', fontFamily: 'inherit',
                                        transition: 'var(--transition)',
                                        background: isActive ? c.accent : 'transparent',
                                        color: isActive ? '#fff' : 'var(--text-secondary)',
                                        boxShadow: isActive ? `0 4px 14px rgba(${c.accentRgb},0.4)` : 'none',
                                        whiteSpace: 'nowrap',
                                    }}>
                                    {c.icon} <span>{c.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {onStartQuiz && (
                        <button className="glass-card" onClick={() => { sfx.playSelect(); onStartQuiz(); }} onMouseEnter={() => sfx.playHover()}
                            style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', flexShrink: 0 }}>
                                <Shuffle size={16} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Quick Quiz</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Practice by category</div>
                            </div>
                        </button>
                    )}
                    {onStartExam && (['ppl', 'ir', 'cpl'] as const).map(type => {
                        if (mode !== type) return null;
                        const examCfg = EXAM_CONFIG[type];
                        return (
                            <button key={type} className="glass-card" onClick={() => { sfx.playSelect(); onStartExam(type); }} onMouseEnter={() => sfx.playHover()}
                                style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', flexShrink: 0 }}>
                                    <FileText size={16} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Practice {examCfg.label}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{examCfg.questions} Qs · {examCfg.time} · Pass {examCfg.passing}</div>
                                </div>
                            </button>
                        );
                    })}
                    {onStudyGuide && mode === 'ppl' && (
                        <button className="glass-card" onClick={() => { sfx.playSelect(); onStudyGuide(); }} onMouseEnter={() => sfx.playHover()}
                            style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', flexShrink: 0 }}>
                                <BookOpen size={16} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>PPL Study Guide</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Visual reference · 32 pages</div>
                            </div>
                        </button>
                    )}
                </div>
            </header>

            {/* Stats Row */}
            <div className="stats-row" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', marginBottom: '0.35rem' }}>
                        <BookOpen size={18} />
                    </div>
                    <span className="stat-number" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#38bdf8', lineHeight: 1 }}>{totalQuestions}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>Available</span>
                </div>

                <div className="glass-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', marginBottom: '0.35rem' }}>
                        <CheckCircle2 size={18} />
                    </div>
                    <span className="stat-number" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>{answered}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>Solved</span>
                </div>

                <div className={`glass-card ${reviewCount > 0 ? 'topic-card' : ''}`}
                    style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px', cursor: reviewCount > 0 ? 'pointer' : 'default', opacity: reviewCount > 0 ? 1 : 0.6, borderColor: reviewCount > 0 ? 'var(--error-color)' : undefined }}
                    onClick={reviewCount > 0 ? () => { sfx.playSelect(); onReview(); } : undefined}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.15)', color: reviewCount > 0 ? 'var(--error-color)' : 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        <AlertCircle size={18} />
                    </div>
                    <span className="stat-number" style={{ fontSize: '1.6rem', fontWeight: 700, color: reviewCount > 0 ? 'var(--error-color)' : 'var(--text-secondary)', lineHeight: 1 }}>{reviewCount}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>Review</span>
                </div>

                <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', minWidth: '120px' }}>
                    <div className="action-btn-group" style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button onClick={() => { if (onResetAll && window.confirm("Reset all progress?")) onResetAll(); }}
                            className="btn-secondary" style={{ padding: '0.35rem 0.6rem', background: 'transparent', color: 'var(--error-color)', borderColor: 'rgba(239, 68, 68, 0.35)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <RotateCcw size={11} /> Reset
                        </button>
                        <button onClick={() => { exportProgressFile(); sfx.playSelect(); }} onMouseEnter={() => sfx.playHover()}
                            className="btn-secondary" style={{ padding: '0.35rem 0.6rem', background: 'transparent', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Download size={11} /> Export
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} onMouseEnter={() => sfx.playHover()}
                            className="btn-secondary" style={{ padding: '0.35rem 0.6rem', background: 'transparent', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.35)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Upload size={11} /> Import
                        </button>
                        <button onClick={handleSync} disabled={syncing} onMouseEnter={() => sfx.playHover()}
                            className="btn-secondary" style={{ padding: '0.35rem 0.6rem', background: 'transparent', color: syncStatus === 'ok' ? '#10b981' : syncStatus === 'error' ? '#ef4444' : '#38bdf8', borderColor: syncStatus === 'ok' ? 'rgba(16,185,129,0.35)' : syncStatus === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(56, 189, 248, 0.35)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: syncing ? 0.6 : 1 }}>
                            <RefreshCw size={11} className={syncing ? 'spin' : ''} /> {syncing ? 'Syncing...' : syncStatus === 'ok' ? 'Synced!' : syncStatus === 'error' ? 'Failed' : 'Sync Now'}
                        </button>
                        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                    </div>
                </div>
            </div>

            {/* Progress Summary & Performance Charts */}
            <ProgressSummary mode={mode} totalQuestions={totalQuestions}
                chapterCounts={chapters.map(ch => ({ id: ch.id, title: ch.title, total: ch.total, answered: chapterProgress[ch.id] || 0 }))} />

            <PerformanceCharts />

            <QuizHistory />

            {/* Chapter Grid */}
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '1.25rem', marginBottom: '0.75rem' }}>
                Chapters
            </h2>
            <div className="grid">
                {chapters.map((chapter, index) => {
                    const completed = chapterProgress[chapter.id] || 0;
                    const progressPercent = chapter.total > 0 ? (completed / chapter.total) * 100 : 0;
                    const isDone = completed >= chapter.total && chapter.total > 0;
                    return (
                        <div key={chapter.id} className={`glass-card topic-card animate-in delay-${(index % 3) + 1}`}
                            onClick={() => { sfx.playSelect(); onSelect(chapter.id); }} onMouseEnter={() => sfx.playHover()}
                            style={{ position: 'relative', overflow: 'hidden', padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                    <span className="chip" style={{ flexShrink: 0 }}>{isDone ? <CheckCircle2 size={12} /> : `Ch ${chapter.id}`}</span>
                                    <div className="topic-header" style={{ marginBottom: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>{chapter.title}</div>
                                </div>
                                <span style={{ color: cfg.accent, fontSize: '1.1rem', flexShrink: 0 }}>→</span>
                            </div>
                            <div className="topic-meta" style={{ marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                                {completed > 0 ? <span>{completed} / {chapter.total} · {Math.round(progressPercent)}%</span> : <span>{chapter.total} questions</span>}
                            </div>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: 'var(--glass-border)' }}>
                                <div style={{ width: `${progressPercent}%`, height: '100%', background: isDone ? 'var(--success-color)' : cfg.accent, transition: 'width 0.3s ease' }} />
                            </div>
                            {completed > 0 && (
                                <button onClick={(e) => { e.stopPropagation(); if (onResetChapter && window.confirm(`Reset Chapter ${chapter.id}?`)) onResetChapter(chapter.id); }}
                                    style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'transparent', border: 'none', color: 'var(--error-color)', cursor: 'pointer', opacity: 0.5, fontSize: '0.7rem' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
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
