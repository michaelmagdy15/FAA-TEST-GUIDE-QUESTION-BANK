import React, { useEffect, useMemo, useState } from 'react';
import { Flame, ArrowLeft, ArrowRight, Eye, EyeOff, RotateCcw, CheckCircle2, XCircle, ListOrdered } from 'lucide-react';
import { sfx } from '../../utils/sfx';
import { EMERGENCY_SCENARIOS } from './c172Data';

const shuffle = (n: number): number[] => {
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
};

export const EmergencyTrainer: React.FC = () => {
    const [scenarioId, setScenarioId] = useState<string>(EMERGENCY_SCENARIOS[0].id);
    const [order, setOrder] = useState<number[]>(() => shuffle(EMERGENCY_SCENARIOS[0].steps.length));
    const [nextIndex, setNextIndex] = useState(0);
    const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
    const [flashIndex, setFlashIndex] = useState<number | null>(null);
    const [mistakes, setMistakes] = useState(0);
    const [revealed, setRevealed] = useState(false);

    const scenario = useMemo(() => EMERGENCY_SCENARIOS.find((s) => s.id === scenarioId) || EMERGENCY_SCENARIOS[0], [scenarioId]);

    const reset = (sid: string, reshuffle = true) => {
        const s = EMERGENCY_SCENARIOS.find((x) => x.id === sid) || EMERGENCY_SCENARIOS[0];
        setOrder(reshuffle ? shuffle(s.steps.length) : Array.from({ length: s.steps.length }, (_, i) => i));
        setNextIndex(0);
        setDoneSteps(new Set());
        setFlashIndex(null);
        setMistakes(0);
        setRevealed(false);
    };

    useEffect(() => {
        reset(scenarioId);
    }, [scenarioId]);

    const complete = nextIndex === scenario.steps.length;

    const handleTap = (stepIdx: number) => {
        if (doneSteps.has(stepIdx)) return;
        if (revealed) return;

        if (stepIdx === order[nextIndex]) {
            sfx.playCorrect();
            const next = new Set(doneSteps);
            next.add(stepIdx);
            setDoneSteps(next);
            setNextIndex(nextIndex + 1);
        } else {
            sfx.playIncorrect();
            setMistakes((m) => m + 1);
            setFlashIndex(stepIdx);
            setTimeout(() => setFlashIndex(null), 600);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Scenario picker */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.9rem' }}>
                    <Flame size={20} color="#ef4444" />
                    <strong style={{ fontSize: '1.1rem' }}>Emergency Procedure Drills</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {EMERGENCY_SCENARIOS.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => { sfx.playSelect(); setScenarioId(s.id); }}
                            onMouseEnter={() => sfx.playHover()}
                            style={{
                                padding: '0.5rem 0.9rem', borderRadius: '10px', border: '1px solid var(--glass-border)',
                                background: scenarioId === s.id ? 'rgba(6,182,212,0.15)' : 'var(--glass-bg)',
                                color: scenarioId === s.id ? '#06b6d4' : 'var(--text-primary)',
                                cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
                                transition: 'var(--transition)', borderColor: scenarioId === s.id ? '#06b6d4' : 'var(--glass-border)',
                            }}
                        >
                            {s.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scenario card */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.4rem' }}>{scenario.title}</div>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{scenario.description}</div>
                    </div>
                    <span className="chip" style={{ flexShrink: 0 }}>
                        Step {Math.min(nextIndex + 1, scenario.steps.length)} / {scenario.steps.length}
                    </span>
                </div>

                {/* Steps list */}
                {!complete ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                        {order.map((stepIdx) => {
                            const isDone = doneSteps.has(stepIdx);
                            const isFlash = flashIndex === stepIdx;
                            return (
                                <button
                                    key={stepIdx}
                                    onClick={() => handleTap(stepIdx)}
                                    onMouseEnter={() => !isDone && sfx.playHover()}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.9rem',
                                        padding: '0.95rem 1.1rem', borderRadius: '10px',
                                        border: '1px solid var(--glass-border)', textAlign: 'left',
                                        background: isDone ? 'rgba(16,185,129,0.1)' : isFlash ? 'rgba(239,68,68,0.18)' : 'var(--glass-bg)',
                                        color: 'var(--text-primary)', cursor: isDone ? 'default' : 'pointer',
                                        fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: 1.4,
                                        transition: 'all 0.2s ease',
                                        borderColor: isDone ? 'var(--success-color)' : isFlash ? 'var(--error-color)' : 'var(--glass-border)',
                                        opacity: isDone ? 0.85 : 1,
                                    }}
                                >
                                    <span
                                        style={{
                                            width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isDone ? 'rgba(16,185,129,0.2)' : isFlash ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.12)',
                                            color: isDone ? 'var(--success-color)' : isFlash ? 'var(--error-color)' : 'var(--text-secondary)',
                                            fontWeight: 700, fontSize: '0.9rem',
                                        }}
                                    >
                                        {isDone ? <CheckCircle2 size={16} /> : isFlash ? <XCircle size={16} /> : <ListOrdered size={16} />}
                                    </span>
                                    <span style={{ flex: 1 }}>{scenario.steps[stepIdx]}</span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="glass-card animate-in" style={{ padding: '1.75rem', textAlign: 'center', background: 'rgba(16,185,129,0.08)', borderColor: 'var(--success-color)' }}>
                        <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#10b981', marginBottom: '0.4rem' }}>Procedure Complete!</div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                            {mistakes === 0 ? 'Perfect — no mistakes. Ready for the checkride.' : `Completed with ${mistakes} mistake${mistakes === 1 ? '' : 's'}. Repeat until you get a perfect run.`}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn-primary" onClick={() => { sfx.playSelect(); reset(scenarioId); }} style={{ background: '#06b6d4', boxShadow: '0 4px 14px rgba(6,182,212,0.4)' }}>
                                <RotateCcw size={15} style={{ marginRight: '0.4rem' }} /> Try Again
                            </button>
                            <button className="btn-secondary" onClick={() => { sfx.playSelect(); const next = EMERGENCY_SCENARIOS.find((s) => s.id !== scenarioId)?.id || scenarioId; setScenarioId(next); }}>
                                Next Scenario <ArrowRight size={15} style={{ marginLeft: '0.4rem' }} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => { sfx.playSelect(); setRevealed((r) => !r); }}
                        onMouseEnter={() => sfx.playHover()}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
                        {revealed ? 'Hide Answer' : 'Show Answer'}
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => { sfx.playSelect(); reset(scenarioId); }}
                        onMouseEnter={() => sfx.playHover()}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <RotateCcw size={15} /> New Order
                    </button>
                </div>

                {/* Revealed answer */}
                {revealed && (
                    <div className="glass-card animate-in" style={{ marginTop: '1rem', padding: '1.25rem', borderColor: '#06b6d4', borderLeft: '4px solid #06b6d4' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.7rem', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <ArrowLeft size={15} /> Correct order
                        </div>
                        {scenario.steps.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.7rem', padding: '0.35rem 0', color: 'var(--text-secondary)' }}>
                                <span style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'rgba(6,182,212,0.15)', color: '#06b6d4', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                                {s}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
