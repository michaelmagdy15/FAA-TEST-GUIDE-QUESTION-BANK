import React, { useState } from 'react';
import { ChevronDown, Brain, AlertTriangle, Clock, Heart, ShieldAlert, Activity, Eye, Thermometer, Droplets, Pill, Cloud } from 'lucide-react';
import { sfx } from '../../../utils/sfx';

const CARD: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: 'clamp(0.75rem, 2vw, 1.25rem)',
};

const EXPANDABLE: React.FC<{ title: string; icon?: React.ReactNode; color?: string; children: React.ReactNode }> = ({ title, icon, color: _color = '#22c55e', children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ ...CARD, overflow: 'hidden', padding: 0 }}>
            <button
                onClick={() => { sfx.playSelect(); setOpen(!open); }}
                onMouseEnter={() => sfx.playHover()}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 'clamp(0.625rem, 1.5vw, 1rem) clamp(0.75rem, 2vw, 1.25rem)', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', color: 'var(--text-primary)', fontWeight: 600, fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{icon} {title}</span>
                <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'var(--transition)', color: 'var(--text-secondary)' }} />
            </button>
            {open && (
                <div style={{ padding: '0 clamp(0.75rem, 2vw, 1.25rem) clamp(0.75rem, 2vw, 1.25rem)', borderTop: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 'clamp(0.78rem, 1.3vw, 0.88rem)', lineHeight: 1.7 }}>
                    {children}
                </div>
            )}
        </div>
    );
};

/* ───── DECIDE Model ───── */
const DECIDE_STEPS = [
    { letter: 'D', word: 'Detect', desc: 'Recognize that a change has occurred or that a hazard exists.', color: '#3b82f6' },
    { letter: 'E', word: 'Estimate', desc: 'Estimate the need to react to the change.', color: '#06b6d4' },
    { letter: 'C', word: 'Choose', desc: 'Choose a desirable outcome.', color: '#22c55e' },
    { letter: 'I', word: 'Identify', desc: 'Identify actions that could successfully control the hazard.', color: '#f97316' },
    { letter: 'D', word: 'Do', desc: 'Take the necessary action.', color: '#8b5cf6' },
    { letter: 'E', word: 'Evaluate', desc: 'Evaluate the effect of the action and repeat as necessary.', color: '#ec4899' },
];

/* ───── IMSAFE ───── */
const IMSAFE = [
    { letter: 'I', word: 'Illness', desc: 'Any illness, no matter how slight', color: '#ef4444' },
    { letter: 'M', word: 'Medication', desc: 'Prescription or over-the-counter', color: '#f97316' },
    { letter: 'S', word: 'Stress', desc: 'Physical or psychological', color: '#eab308' },
    { letter: 'A', word: 'Alcohol', desc: '8 hours bottle to throttle (BAC < 0.04%)', color: '#ec4899' },
    { letter: 'F', word: 'Fatigue', desc: 'Lack of rest, sleep, or recency', color: '#a78bfa' },
    { letter: 'E', word: 'Emotion', desc: 'Emotional state or psychological condition', color: '#06b6d4' },
];

/* ───── PAVE ───── */
const PAVE = [
    { letter: 'P', word: 'Pilot', desc: 'IMSAFE, proficiency, recency, medical', color: '#3b82f6' },
    { letter: 'A', word: 'Aircraft', desc: 'Airworthiness, equipment, weight & balance, fuel', color: '#22c55e' },
    { letter: 'V', word: 'enVironment', desc: 'Weather, airports, airspace, alternates', color: '#f97316' },
    { letter: 'E', word: 'External Pressures', desc: 'Passengers, schedule, desire to fly, budget', color: '#ef4444' },
];

/* ───── 5P Model ───── */
const FIVE_P = [
    { letter: 'P', word: 'Plan', desc: 'Flight plan, weather, alternates, fuel', color: '#3b82f6' },
    { letter: 'P', word: 'Plane', desc: 'Airworthiness, equipment, maintenance', color: '#22c55e' },
    { letter: 'P', word: 'Pilot', desc: 'IMSAFE, proficiency, medical', color: '#f97316' },
    { letter: 'P', word: 'Passengers', desc: 'Briefing, comfort, external pressures', color: '#8b5cf6' },
    { letter: 'P', word: 'Programming', desc: 'Avionics, GPS, radios, automation', color: '#ec4899' },
];

/* ───── Hazardous Attitudes ───── */
const HAZARDOUS_ATTITUDES = [
    { type: 'Anti-authority', attitude: '"The rules don\'t apply to me"', antidote: 'Follow the rules — they are usually right', color: '#ef4444' },
    { type: 'Impulsivity', attitude: '"Do something quickly!"', antidote: 'Think first — act impulsively', color: '#f97316' },
    { type: 'Invulnerability', attitude: '"It won\'t happen to me"', antidote: 'It could happen to anyone', color: '#eab308' },
    { type: 'Macho', attitude: '"I can do it"', antidote: 'Taking chances is foolish', color: '#ec4899' },
    { type: 'Resignation', attitude: '"What\'s the use?"', antidote: 'I\'m not helpless — I can make a difference', color: '#a78bfa' },
];

/* ───── Aeromedical: Hypoxia ───── */
const HYPOXIA_SYMPTOMS = [
    { altitude: '5,000 ft', symptoms: 'No symptoms', color: '#22c55e' },
    { altitude: '10,000 ft', symptoms: 'Impaired judgment, headache, fatigue', color: '#eab308' },
    { altitude: '15,000 ft', symptoms: 'Poor vision, tingling, drowsiness', color: '#f97316' },
    { altitude: '18,000 ft', symptoms: 'Blackout, loss of consciousness', color: '#ef4444' },
    { altitude: '25,000+ ft', symptoms: 'Unconscious in 30-60 seconds', color: '#ef4444' },
];

/* ───── Supplemental Oxygen ───── */
const OXYGEN_REQS = [
    { altitude: '5,000-12,000', crew: 'Recommended >12,000', passengers: 'Recommended >15,000', color: '#22c55e' },
    { altitude: '12,000-14,000', crew: 'Required >30 min', passengers: 'Recommended', color: '#eab308' },
    { altitude: '14,000-15,000', crew: 'Required', passengers: 'Required', color: '#f97316' },
    { altitude: '15,000+', crew: 'Required', passengers: 'Required', color: '#ef4444' },
];

/* ───── Decompression Sickness ───── */
const SCUBA_WAIT_TIMES = [
    { depth: '0-40 ft (single)', wait: 'None', color: '#22c55e' },
    { depth: '0-40 ft (repetitive)', wait: '12 hours', color: '#eab308' },
    { depth: '40-80 ft', wait: '12 hours', color: '#f97316' },
    { depth: '80-100 ft', wait: '24 hours', color: '#ef4444' },
    { depth: '100+ ft', wait: '48+ hours', color: '#ef4444' },
];

/* ───── Alcohol / Drugs FAR 91.17 ───── */
const ALCOHOL_RULES = [
    'No person may act as crewmember within 8 hours of consuming alcohol',
    'BAC must be less than 0.04%',
    'Under the influence of alcohol or any drug that affects faculties',
    'No prohibition on medication — but must be medically safe',
];

/* ───── Illusions ───── */
const VESTIBULAR_ILLUSIONS = [
    { name: 'The Leans', desc: 'Banked turn entered too slowly for vestibular system to detect. Fix: trust instruments.', color: '#3b82f6' },
    { name: 'Graveyard Spiral', desc: 'Continued bank after loss of level flight sensation. Fix: trust instruments, apply power, level wings.', color: '#ef4444' },
    { name: 'Coriolis', desc: 'Head movement during a turn creates sensation of tumbling. Fix: focus on instruments.', color: '#f97316' },
    { name: 'Somatogravic', desc: 'Acceleration perceived as nose-up pitch (or deceleration as nose-down). Fix: trust instruments.', color: '#a78bfa' },
    { name: 'Inversion', desc: 'Sensation of tilting opposite of actual attitude. Fix: trust instruments.', color: '#06b6d4' },
    { name: 'Elevator', desc: 'False sensation of climbing or descending. Fix: trust instruments.', color: '#22c55e' },
];

const VISUAL_ILLUSIONS = [
    { name: 'Runway Width', desc: 'Narrower runway appears higher, wider appears lower. Fix: use precision approach.', color: '#3b82f6' },
    { name: 'False Horizon', desc: 'Sloping terrain or cloud layers misinterpreted as horizon. Fix: trust instruments.', color: '#ef4444' },
    { name: 'Runway Slope', desc: 'Upslope runway appears higher (tendency to land short). Fix: use glide slope.', color: '#f97316' },
];

const NIGHT_ILLUSIONS = [
    { name: 'Auto-Kinesis', desc: 'Staring at a single light causes perceived movement. Fix: scan, don\'t fixate.', color: '#3b82f6' },
    { name: 'Flicker Vertigo', desc: 'Flickering lights cause disorientation, nausea. Fix: look away from light source.', color: '#ef4444' },
    { name: 'Black-Hole Approach', desc: 'Approach over dark terrain with only runway lights visible — tendency to be too low.', color: '#f97316' },
    { name: 'Ground Lighting', desc: 'Difficulty judging height over unlit terrain. Fix: trust instruments.', color: '#a78bfa' },
];

export const HumanFactors: React.FC = () => {
    const [tab, setTab] = useState<'decision' | 'checklists' | 'attitudes' | 'aero' | 'illusions'>('decision');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.75rem, 1.5vw, 1.25rem)' }}>
            <header style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)', fontWeight: 700, color: '#22c55e', marginBottom: '0.3rem' }}>
                    Human Factors
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)' }}>Decision Making, Risk Management & Aeromedical Factors</p>
            </header>

            <div className="ppl-tab-row" style={{ display: 'flex', gap: '0.25rem', padding: '3px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                {([
                    ['decision', 'DECIDE'], ['checklists', 'Checklists'], ['attitudes', 'Attitudes'],
                    ['aero', 'Aeromedical'], ['illusions', 'Illusions'],
                ] as const).map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => { sfx.playSelect(); setTab(id); }}
                        onMouseEnter={() => sfx.playHover()}
                        style={{
                            padding: 'clamp(0.25rem, 0.8vw, 0.4rem) clamp(0.5rem, 1.2vw, 0.8rem)', borderRadius: '9px', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: 'clamp(0.68rem, 1.2vw, 0.78rem)', fontWeight: tab === id ? 700 : 500,
                            background: tab === id ? '#22c55e' : 'transparent',
                            color: tab === id ? '#fff' : 'var(--text-secondary)',
                            transition: 'var(--transition)', flexShrink: 0,
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {tab === 'decision' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* DECIDE Model */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                <Brain size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                                DECIDE Model
                            </h3>
                            <div className="ppl-card-grid-3">
                                {DECIDE_STEPS.map(s => (
                                    <div key={s.letter} style={{ padding: 'clamp(0.5rem, 1.2vw, 0.75rem)', borderRadius: '10px', background: `${s.color}15`, border: `1px solid ${s.color}40`, textAlign: 'center' }}>
                                        <div style={{ width: 'clamp(28px, 5vw, 36px)', height: 'clamp(28px, 5vw, 36px)', borderRadius: '8px', background: s.color, color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.3rem', fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)' }}>
                                            {s.letter}
                                        </div>
                                        <div style={{ fontWeight: 700, color: s.color, fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)' }}>{s.word}</div>
                                        <div style={{ fontSize: 'clamp(0.62rem, 1vw, 0.72rem)', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{s.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 5P Model */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                5P Model
                            </h3>
                            <div className="ppl-card-grid-3">
                                {FIVE_P.map(p => (
                                    <div key={p.letter + p.word} style={{ padding: 'clamp(0.5rem, 1.2vw, 0.75rem)', borderRadius: '10px', background: `${p.color}15`, border: `1px solid ${p.color}40`, textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, color: p.color, fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)' }}>{p.word}</div>
                                        <div style={{ fontSize: 'clamp(0.62rem, 1vw, 0.72rem)', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{p.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {tab === 'checklists' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* IMSAFE */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                <Heart size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                                IMSAFE Checklist
                            </h3>
                            <div className="ppl-card-grid-3">
                                {IMSAFE.map(s => (
                                    <div key={s.letter} style={{ padding: 'clamp(0.5rem, 1.2vw, 0.75rem)', borderRadius: '10px', background: `${s.color}15`, border: `1px solid ${s.color}40`, textAlign: 'center' }}>
                                        <div style={{ width: 'clamp(24px, 4.5vw, 32px)', height: 'clamp(24px, 4.5vw, 32px)', borderRadius: '8px', background: s.color, color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.3rem', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>
                                            {s.letter}
                                        </div>
                                        <div style={{ fontWeight: 700, color: s.color, fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)' }}>{s.word}</div>
                                        <div style={{ fontSize: 'clamp(0.62rem, 1vw, 0.72rem)', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{s.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PAVE */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                <ShieldAlert size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                                PAVE Checklist
                            </h3>
                            <div className="ppl-card-grid-4">
                                {PAVE.map(p => (
                                    <div key={p.letter} style={{ padding: 'clamp(0.5rem, 1.2vw, 0.75rem)', borderRadius: '10px', background: `${p.color}15`, border: `1px solid ${p.color}40`, textAlign: 'center' }}>
                                        <div style={{ width: 'clamp(24px, 4.5vw, 32px)', height: 'clamp(24px, 4.5vw, 32px)', borderRadius: '8px', background: p.color, color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.3rem', fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }}>
                                            {p.letter}
                                        </div>
                                        <div style={{ fontWeight: 700, color: p.color, fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)' }}>{p.word}</div>
                                        <div style={{ fontSize: 'clamp(0.62rem, 1vw, 0.72rem)', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{p.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {tab === 'attitudes' && (
                    <div style={CARD}>
                        <h3 style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            <AlertTriangle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                            Hazardous Attitudes
                        </h3>
                        <div className="ppl-hazard-row" style={{ display: 'flex', gap: '0.5rem' }}>
                            {HAZARDOUS_ATTITUDES.map(h => (
                                <div key={h.type} style={{ display: 'flex', gap: '0.75rem', padding: 'clamp(0.5rem, 1.2vw, 0.75rem)', borderRadius: '10px', background: `${h.color}12`, border: `1px solid ${h.color}30`, alignItems: 'center', minWidth: '250px' }}>
                                    <div style={{ padding: 'clamp(0.2rem, 0.6vw, 0.3rem) clamp(0.375rem, 0.8vw, 0.6rem)', borderRadius: '6px', background: h.color, color: '#fff', fontWeight: 700, fontSize: 'clamp(0.68rem, 1.2vw, 0.78rem)', whiteSpace: 'nowrap' }}>
                                        {h.type}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontStyle: 'italic', color: h.color, fontSize: 'clamp(0.78rem, 1.5vw, 0.88rem)' }}>{h.attitude}</div>
                                        <div style={{ fontSize: 'clamp(0.72rem, 1.2vw, 0.82rem)', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                                            <strong>Antidote:</strong> {h.antidote}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {tab === 'aero' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* Hypoxia */}
                        <EXPANDABLE title="🧠 Hypoxia" icon={<Activity size={18} />} color="#ef4444">
                            <div style={{ marginTop: '0.5rem' }}>
                                <p><strong>Definition:</strong> Insufficient oxygen to the body's tissues and brain.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                                    {HYPOXIA_SYMPTOMS.map(h => (
                                        <div key={h.altitude} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 'clamp(0.2rem, 0.6vw, 0.3rem) clamp(0.375rem, 0.8vw, 0.5rem)', borderRadius: '6px', background: `${h.color}15`, border: `1px solid ${h.color}30` }}>
                                            <span style={{ fontWeight: 700, color: h.color, minWidth: '80px', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)' }}>{h.altitude}</span>
                                            <span style={{ fontSize: 'clamp(0.72rem, 1.2vw, 0.82rem)', color: 'var(--text-secondary)' }}>{h.symptoms}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </EXPANDABLE>

                        {/* Hyperventilation */}
                        <EXPANDABLE title="💨 Hyperventilation" icon={<Activity size={18} />} color="#f97316">
                            <p style={{ marginTop: '0.5rem' }}>
                                <strong>Symptoms:</strong> Tingling fingers, light-headedness, visual disturbances, muscle spasms. Often confused with hypoxia.
                            </p>
                            <p style={{ marginTop: '0.3rem' }}><strong>Remedy:</strong> Slow breathing rate, breathe into cupped hands or paper bag, talk out loud.</p>
                        </EXPANDABLE>

                        {/* Spatial Disorientation */}
                        <EXPANDABLE title="🌀 Spatial Disorientation" icon={<Activity size={18} />} color="#a78bfa">
                            <p style={{ marginTop: '0.5rem' }}>
                                <strong>Definition:</strong> Bodily sensation of position, motion, or acceleration inconsistent with actual environment. Most dangerous in IMC.
                            </p>
                            <p style={{ marginTop: '0.3rem' }}><strong>Prevention:</strong> Trust instruments, maintain instrument scan, avoid head movements in turbulence.</p>
                        </EXPANDABLE>

                        {/* CO Poisoning */}
                        <EXPANDABLE title="☠️ Carbon Monoxide Poisoning" icon={<AlertTriangle size={18} />} color="#ef4444">
                            <p style={{ marginTop: '0.5rem' }}>
                                <strong>Source:</strong> Exhaust system leaks, heating system. Colorless, odorless gas.
                            </p>
                            <p style={{ marginTop: '0.3rem' }}><strong>Symptoms:</strong> Headache, drowsiness, dizziness, confusion, impaired judgment. Similar to hypoxia.</p>
                            <p style={{ marginTop: '0.3rem' }}><strong>Prevention:</strong> Preflight heating system, carry CO detector.</p>
                        </EXPANDABLE>

                        {/* Oxygen Requirements */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                Supplemental Oxygen Requirements
                            </h3>
                            <div className="ppl-table-scroll">
                                <table className="ppl-compact-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                            <th style={{ padding: 'clamp(0.375rem, 0.8vw, 0.5rem)', textAlign: 'left', color: 'var(--text-primary)' }}>Altitude (MSL)</th>
                                            <th style={{ padding: 'clamp(0.375rem, 0.8vw, 0.5rem)', textAlign: 'center', color: 'var(--text-primary)' }}>Flight Crew</th>
                                            <th style={{ padding: 'clamp(0.375rem, 0.8vw, 0.5rem)', textAlign: 'center', color: 'var(--text-primary)' }}>Passengers</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {OXYGEN_REQS.map(o => (
                                            <tr key={o.altitude} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: 'clamp(0.375rem, 0.8vw, 0.5rem)', fontWeight: 700, color: o.color }}>{o.altitude} ft</td>
                                                <td style={{ padding: 'clamp(0.375rem, 0.8vw, 0.5rem)', textAlign: 'center', color: 'var(--text-secondary)' }}>{o.crew}</td>
                                                <td style={{ padding: 'clamp(0.375rem, 0.8vw, 0.5rem)', textAlign: 'center', color: 'var(--text-secondary)' }}>{o.passengers}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* DCS */}
                        <EXPANDABLE title="🫁 Decompression Sickness" icon={<Activity size={18} />} color="#06b6d4">
                            <p style={{ marginTop: '0.5rem' }}>
                                <strong>Definition:</strong> Bubbles form in body tissues when ambient pressure decreases rapidly. Can occur after scuba diving and flying.
                            </p>
                            <p style={{ marginTop: '0.3rem' }}><strong>Scuba Diving Wait Times:</strong></p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                                {SCUBA_WAIT_TIMES.map(s => (
                                    <div key={s.depth} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 'clamp(0.2rem, 0.6vw, 0.3rem) clamp(0.375rem, 0.8vw, 0.5rem)', borderRadius: '6px', background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                                        <span style={{ fontWeight: 700, color: s.color, minWidth: '100px', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)' }}>{s.depth}</span>
                                        <span style={{ fontSize: 'clamp(0.72rem, 1.2vw, 0.82rem)', color: 'var(--text-secondary)' }}>Wait: {s.wait}</span>
                                    </div>
                                ))}
                            </div>
                        </EXPANDABLE>

                        {/* Fatigue */}
                        <EXPANDABLE title="😴 Fatigue" icon={<Clock size={18} />} color="#a78bfa">
                            <p style={{ marginTop: '0.5rem' }}>
                                <strong>Acute fatigue:</strong> Normal tiredness from lack of sleep or long duty periods.
                            </p>
                            <p style={{ marginTop: '0.3rem' }}><strong>Chronic fatigue:</strong> Prolonged sleep deprivation. Can impair performance equivalent to alcohol intoxication.</p>
                            <p style={{ marginTop: '0.3rem' }}><strong>Effects:</strong> Impaired judgment, slower reaction times, poor decision-making, microsleeps.</p>
                        </EXPANDABLE>

                        {/* Alcohol/Drugs */}
                        <EXPANDABLE title="🍺 Alcohol & Drugs — FAR 91.17" icon={<AlertTriangle size={18} />} color="#ef4444">
                            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                {ALCOHOL_RULES.map((r, i) => (
                                    <li key={i} style={{ marginBottom: '0.3rem' }}>{r}</li>
                                ))}
                            </ul>
                        </EXPANDABLE>

                        {/* Motion Sickness / Stress */}
                        <div className="ppl-card-grid-2">
                            <EXPANDABLE title="🤢 Motion Sickness" icon={<Activity size={16} />} color="#f97316">
                                <p style={{ marginTop: '0.5rem' }}>
                                    Conflict between visual and vestibular systems. Symptoms: nausea, sweating, dizziness.
                                </p>
                                <p style={{ marginTop: '0.3rem' }}><strong>Prevention:</strong> Look at horizon, avoid heavy meals, fresh air, avoid reading.</p>
                            </EXPANDABLE>
                            <EXPANDABLE title="😰 Stress" icon={<Activity size={16} />} color="#eab308">
                                <p style={{ marginTop: '0.5rem' }}>
                                    <strong>Eustress:</strong> Positive stress that improves performance. <strong>Distress:</strong> Negative stress that impairs performance.
                                </p>
                                <p style={{ marginTop: '0.3rem' }}><strong>Management:</strong> Adequate rest, proper nutrition, exercise, relaxation techniques.</p>
                            </EXPANDABLE>
                        </div>
                    </div>
                )}
                {tab === 'illusions' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="ppl-card-grid-3">
                            {/* Vestibular */}
                            <div style={CARD}>
                                <h3 style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, color: '#3b82f6', marginBottom: '0.5rem' }}>
                                    Vestibular Illusions
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {VESTIBULAR_ILLUSIONS.map(v => (
                                        <div key={v.name} style={{ padding: 'clamp(0.375rem, 0.8vw, 0.5rem)', borderRadius: '8px', background: `${v.color}12`, border: `1px solid ${v.color}30` }}>
                                            <strong style={{ color: v.color, fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)' }}>{v.name}</strong>
                                            <p style={{ fontSize: 'clamp(0.68rem, 1.2vw, 0.78rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>{v.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Visual */}
                            <div style={CARD}>
                                <h3 style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, color: '#22c55e', marginBottom: '0.5rem' }}>
                                    Visual Illusions
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {VISUAL_ILLUSIONS.map(v => (
                                        <div key={v.name} style={{ padding: 'clamp(0.375rem, 0.8vw, 0.5rem)', borderRadius: '8px', background: `${v.color}12`, border: `1px solid ${v.color}30` }}>
                                            <strong style={{ color: v.color, fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)' }}>{v.name}</strong>
                                            <p style={{ fontSize: 'clamp(0.68rem, 1.2vw, 0.78rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>{v.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Night Visual */}
                            <div style={CARD}>
                                <h3 style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', fontWeight: 700, color: '#a78bfa', marginBottom: '0.5rem' }}>
                                    Night Visual Illusions
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {NIGHT_ILLUSIONS.map(v => (
                                        <div key={v.name} style={{ padding: 'clamp(0.375rem, 0.8vw, 0.5rem)', borderRadius: '8px', background: `${v.color}12`, border: `1px solid ${v.color}30` }}>
                                            <strong style={{ color: v.color, fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)' }}>{v.name}</strong>
                                            <p style={{ fontSize: 'clamp(0.68rem, 1.2vw, 0.78rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>{v.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <EXPANDABLE title="🌙 Night Vision & Dark Adaptation" icon={<Eye size={18} />} color="#22c55e">
                <p style={{ marginTop: '0.5rem' }}>
                    <strong>Rod vs Cone Vision:</strong>
                </p>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                    <li><strong>Rods:</strong> Peripheral vision, low light, no color, motion sensitive</li>
                    <li><strong>Cones:</strong> Center vision, bright light, color, detail</li>
                </ul>
                <p style={{ marginTop: '0.5rem' }}><strong>Dark Adaptation:</strong> 30 minutes for full night vision.</p>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                    <li>Avoid bright lights (resets adaptation)</li>
                    <li>Use red cockpit lights (doesn't bleach rhodopsin)</li>
                </ul>
                <p style={{ marginTop: '0.5rem' }}><strong>Scotopic Vision:</strong> Night-only rod-based vision, no color perception.</p>
                <p style={{ marginTop: '0.5rem' }}><strong>Night Vision Limitations:</strong></p>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                    <li>Reduced color perception</li>
                    <li>Reduced depth perception</li>
                    <li>Blind spot enlarges</li>
                    <li>Peripheral vision becomes primary</li>
                </ul>
                <p style={{ marginTop: '0.5rem', fontWeight: 700, color: '#22c55e' }}>Key Rule: Avoid looking directly at bright lights at night; scan slowly.</p>
            </EXPANDABLE>

            <EXPANDABLE title="🥶 Hypothermia" icon={<Thermometer size={18} />} color="#22c55e">
                <p style={{ marginTop: '0.5rem' }}><strong>Definition:</strong> Body temperature drops below 95°F (35°C).</p>
                <p style={{ marginTop: '0.5rem' }}><strong>Stages:</strong></p>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                    <li><strong>Mild (90-95°F):</strong> Shivering, numbness, poor judgment</li>
                    <li><strong>Moderate (82-90°F):</strong> Shivering stops, confusion, drowsiness</li>
                    <li><strong>Severe (&lt;82°F):</strong> Unconsciousness, heart fibrillation, death</li>
                </ul>
                <p style={{ marginTop: '0.5rem' }}><strong>Causes:</strong> Wet clothing, wind, cold water immersion.</p>
                <p style={{ marginTop: '0.3rem' }}><strong>Prevention:</strong> Layered clothing, windproof outer layer, stay dry.</p>
                <p style={{ marginTop: '0.3rem' }}><strong>Flying Impact:</strong> Impaired judgment, slow reaction time, confusion.</p>
                <p style={{ marginTop: '0.5rem', fontWeight: 700, color: '#22c55e' }}>Key Rule: Hypothermia can be fatal; seek warmth immediately.</p>
            </EXPANDABLE>

            <EXPANDABLE title="💧 Dehydration" icon={<Droplets size={18} />} color="#22c55e">
                <p style={{ marginTop: '0.5rem' }}><strong>Definition:</strong> Loss of body water exceeding intake.</p>
                <p style={{ marginTop: '0.5rem' }}><strong>Symptoms:</strong> Thirst, fatigue, dizziness, headache, dark urine.</p>
                <p style={{ marginTop: '0.3rem' }}><strong>Flying Impact:</strong> Fatigue, impaired judgment, reduced reaction time.</p>
                <p style={{ marginTop: '0.3rem' }}><strong>Causes:</strong> Dry cockpit air, caffeine, altitude, physical exertion.</p>
                <p style={{ marginTop: '0.3rem' }}><strong>Prevention:</strong> Drink water regularly, avoid excessive caffeine/alcohol.</p>
                <p style={{ marginTop: '0.5rem', fontWeight: 700, color: '#22c55e' }}>Key Rule: By the time you feel thirsty, you're already dehydrated.</p>
            </EXPANDABLE>

            <EXPANDABLE title="💊 Medications" icon={<Pill size={18} />} color="#22c55e">
                <p style={{ marginTop: '0.5rem' }}><strong>FAR 91.17:</strong> No person may act as PIC while using any drug that affects faculties.</p>
                <p style={{ marginTop: '0.5rem' }}><strong>Disqualifying Medications:</strong></p>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                    <li><strong>Antihistamines</strong> (Benadryl, Zyrtec) — drowsiness</li>
                    <li><strong>Sedatives/Tranquilizers</strong> (Valium, Xanax)</li>
                    <li><strong>Pain medications</strong> (opioids, some NSAIDs)</li>
                    <li><strong>Antidepressants</strong> (SSRIs, MAOIs) — require special issuance</li>
                    <li><strong>Blood pressure medications</strong> — some cause drowsiness</li>
                    <li><strong>Motion sickness medications</strong> (Dramamine) — cause drowsiness</li>
                </ul>
                <p style={{ marginTop: '0.5rem' }}><strong>Over-the-Counter:</strong> Even OTC meds can impair; always check pilot medical guidelines.</p>
                <p style={{ marginTop: '0.5rem', fontWeight: 700, color: '#22c55e' }}>Key Rule: When in doubt, don't fly; consult AME if uncertain.</p>
            </EXPANDABLE>

            <EXPANDABLE title="☁️ Carbon Dioxide Poisoning" icon={<Cloud size={18} />} color="#22c55e">
                <p style={{ marginTop: '0.5rem' }}><strong>Cause:</strong> CO₂ buildup in cockpit (not the same as CO poisoning).</p>
                <p style={{ marginTop: '0.5rem' }}><strong>Sources:</strong> Passenger exhalation in unventilated cockpit, cabin heating system.</p>
                <p style={{ marginTop: '0.3rem' }}><strong>Symptoms:</strong> Drowsiness, headache, increased breathing rate, confusion.</p>
                <p style={{ marginTop: '0.3rem' }}><strong>Prevention:</strong> Use fresh air vents, maintain cabin ventilation.</p>
                <p style={{ marginTop: '0.3rem' }}><strong>Difference from CO:</strong> CO is from exhaust (odorless, colorless); CO₂ is from respiration.</p>
                <p style={{ marginTop: '0.5rem', fontWeight: 700, color: '#22c55e' }}>Key Rule: Always maintain adequate cabin ventilation.</p>
            </EXPANDABLE>
        </div>
    );
};
