import React, { useState } from 'react';
import { ChevronDown, Wrench, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { sfx } from '../../../utils/sfx';

const EXPANDABLE: React.FC<{ title: string; color?: string; children: React.ReactNode }> = ({ title, color = '#3b82f6', children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{
            background: 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
            border: `1px solid ${open ? color + '60' : 'var(--glass-border)'}`, borderRadius: 'var(--radius)',
            overflow: 'hidden', transition: 'var(--transition)',
        }}>
            <button
                onClick={() => { sfx.playSelect(); setOpen(!open); }}
                onMouseEnter={() => sfx.playHover()}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem',
                }}
            >
                <span>{title}</span>
                <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'var(--transition)', color: 'var(--text-secondary)' }} />
            </button>
            {open && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    {children}
                </div>
            )}
        </div>
    );
};

const CARD: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '1.25rem',
};

const ATOMATOFLAMES: { letter: string; item: string; color: string }[] = [
    { letter: 'A', item: 'Airworthiness certificate — Required to be on board', color: '#3b82f6' },
    { letter: 'T', item: 'Transponder — Required in controlled airspace', color: '#06b6d4' },
    { letter: 'O', item: 'Oil — Sufficient supply, temp & pressure normal', color: '#22c55e' },
    { letter: 'M', item: 'Manifold pressure — Required for constant-speed prop', color: '#f97316' },
    { letter: 'A', item: 'Altimeter — Calibrated within 24hrs (IFR) / 12mo (VFR)', color: '#a78bfa' },
    { letter: 'T', item: 'Tachometer — Required for Class B/C airspace ops', color: '#ec4899' },
    { letter: 'O', item: 'Operating limitations — Must be in aircraft', color: '#eab308' },
    { letter: 'F', item: 'Fuel — Required quantity for planned flight', color: '#ef4444' },
    { letter: 'L', item: 'Landing gear — Extended and locked (fixed gear)', color: '#10b981' },
    { letter: 'A', item: 'Anticollision lights — Required for night ops', color: '#3b82f6' },
    { letter: 'M', item: 'Magnetos — Operating properly', color: '#06b6d4' },
    { letter: 'E', item: 'Emergency equipment — As required', color: '#f97316' },
    { letter: 'S', item: 'Seatbelts — Required for all occupants', color: '#a78bfa' },
];

const FLAPS: Record<string, string> = {
    F: 'Fuel gauge — Quantity in each tank',
    L: 'Landing light — Required for night operations',
    A: 'Anticollision light — Required for all operations (strobes/beacon)',
    P: 'Position lights — Required for night operations (red/green/white)',
    S: 'Seatbelts — Required for all occupants',
};

const AAV1ATE: { letter: string; item: string; color: string; description: string }[] = [
    { letter: 'A', item: 'Annual Inspection', color: '#3b82f6', description: 'Every 12 calendar months by A&P with IA' },
    { letter: 'A', item: '100-Hour Inspection', color: '#06b6d4', description: 'Every 100 hours if used for hire (instruction/sightseeing)' },
    { letter: 'V', item: 'VOR Check', color: '#8b5cf6', description: 'Every 30 days for IFR operations (VOR, GPS, or RAIM)' },
    { letter: '1', item: '12-Month Altimeter', color: '#f97316', description: 'Inspection/permission within 24 calendar months' },
    { letter: 'A', item: 'ATC Transponder', color: '#ec4899', description: 'Inspection within 24 calendar months' },
    { letter: 'T', item: 'ELT Battery', color: '#eab308', description: 'Inspection/replacement per manufacturer' },
    { letter: 'E', item: 'ELT Installation', color: '#22c55e', description: 'Inspection after installation or replacement' },
];

const ARROW_DOCS: { name: string; desc: string }[] = [
    { name: 'A — Airworthiness Certificate', desc: 'Original or replacement, on board at all times' },
    { name: 'R — Registration', desc: 'Certificate of Aircraft Registration (N-number)' },
    { name: 'R — Radio Station License', desc: 'Required for international flight only (FCC)' },
    { name: 'W — Weight & Balance', desc: 'Current weight and balance data' },
];

export const Airworthiness: React.FC = () => {
    const [atomExpanded, setAtomExpanded] = useState<string | null>(null);
    const [flapsExpanded, setFlapsExpanded] = useState<string | null>(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6', marginBottom: '0.3rem' }}>
                    Airworthiness
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Required Equipment, Inspections & Documents</p>
            </header>

            {/* ATOMATOFLAMES */}
            <div style={CARD}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wrench size={18} color="#3b82f6" /> ATOMATOFLAMES — VFR Day Required Equipment
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Click each letter to reveal the equipment item.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {ATOMATOFLAMES.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => { sfx.playSelect(); setAtomExpanded(atomExpanded === `${item.letter}-${i}` ? null : `${item.letter}-${i}`); }}
                            onMouseEnter={() => sfx.playHover()}
                            style={{
                                width: '42px', height: '42px', borderRadius: '10px', border: '1px solid var(--glass-border)',
                                background: atomExpanded === `${item.letter}-${i}` ? 'rgba(59,130,246,0.2)' : 'var(--glass-bg)',
                                color: atomExpanded === `${item.letter}-${i}` ? '#3b82f6' : 'var(--text-primary)',
                                fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit',
                                transition: 'var(--transition)',
                            }}
                        >
                            {item.letter}
                        </button>
                    ))}
                </div>
                {atomExpanded && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {ATOMATOFLAMES.find(item => item.letter === atomExpanded.split('-')[0])?.item}
                    </div>
                )}
            </div>

            {/* FLAPS */}
            <div style={CARD}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wrench size={18} color="#06b6d4" /> FLAPS — VFR Night Additional Equipment
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {Object.entries(FLAPS).map(([letter, desc], i) => (
                        <button
                            key={i}
                            onClick={() => { sfx.playSelect(); setFlapsExpanded(flapsExpanded === letter ? null : letter); }}
                            onMouseEnter={() => sfx.playHover()}
                            style={{
                                width: '42px', height: '42px', borderRadius: '10px', border: '1px solid var(--glass-border)',
                                background: flapsExpanded === letter ? 'rgba(6,182,212,0.2)' : 'var(--glass-bg)',
                                color: flapsExpanded === letter ? '#06b6d4' : 'var(--text-primary)',
                                fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', fontFamily: 'inherit',
                                transition: 'var(--transition)',
                            }}
                        >
                            {letter}
                        </button>
                    ))}
                </div>
                {flapsExpanded && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {FLAPS[flapsExpanded]}
                    </div>
                )}
            </div>

            {/* Inspections AAV1ATE */}
            <div style={CARD}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} color="#10b981" /> AAV1ATE — Required Inspections
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {AAV1ATE.map((item, i) => (
                        <div key={i} style={{
                            padding: '0.75rem', borderRadius: '10px', border: `1px solid ${item.color}40`,
                            background: `${item.color}15`, transition: 'var(--transition)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                                <span style={{
                                    width: '26px', height: '26px', borderRadius: '6px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', background: item.color,
                                    color: '#fff', fontWeight: 800, fontSize: '0.8rem',
                                }}>
                                    {item.letter}
                                </span>
                                <strong style={{ color: item.color, fontSize: '0.85rem' }}>{item.item}</strong>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ARROW Documents */}
            <EXPANDABLE title="📄 Documents — ARROW" color="#8b5cf6">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {ARROW_DOCS.map(d => (
                        <div key={d.name} style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                            <strong style={{ color: '#a78bfa' }}>{d.name}</strong>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.15rem 0 0' }}>{d.desc}</p>
                        </div>
                    ))}
                </div>
            </EXPANDABLE>

            {/* Decision Tree — Inoperative Equipment */}
            <EXPANDABLE title="🔧 Flying with Inoperative Equipment" color="#f97316">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Decision Tree (FAR 91.213):</p>
                    <ol style={{ paddingLeft: '1.2rem' }}>
                        <li>Is it required by <strong style={{ color: '#f97316' }}>type design</strong> or FAR? → If NO, may fly with MEL or without MEL.</li>
                        <li>Is it required by <strong style={{ color: '#f97316' }}>airworthiness directive (AD)</strong>? → If YES, must comply.</li>
                        <li>Is it required by the <strong style={{ color: '#f97316' }}>equipment list</strong>? → Check POH/AFM.</li>
                        <li>Is it required by <strong style={{ color: '#f97316' }}>MEL</strong>? → If YES, follow MEL procedures.</li>
                        <li>Is it required by <strong style={{ color: '#f97316' }}>91.205 (VFR/IFR)</strong>? → If YES, must have it.</li>
                    </ol>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                            <p style={{ fontWeight: 700, color: '#22c55e', margin: '0 0 0.3rem', fontSize: '0.88rem' }}>With MEL</p>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                                If aircraft has an MEL, follow the procedures for inoperative equipment. Defer repair to a later date per MEL limitations.
                            </p>
                        </div>
                        <div style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                            <p style={{ fontWeight: 700, color: '#ef4444', margin: '0 0 0.3rem', fontSize: '0.88rem' }}>Without MEL</p>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                                If no MEL, must determine if the equipment is required by FAR. If not required, deactivate and placard "INOPERATIVE." If required, must repair before flight.
                            </p>
                        </div>
                    </div>
                </div>
            </EXPANDABLE>

            {/* Special Flight Permit */}
            <EXPANDABLE title="📋 Special Flight Permit" color="#ec4899">
                <p style={{ marginTop: '0.5rem' }}>
                    A Special Flight Permit (ferry permit) is issued when an aircraft does not currently meet its type certificate requirements but is safe to fly under specific conditions. Used for:
                </p>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                    <li>Flying to a maintenance location for repairs</li>
                    <li>Flying to a location for an inspection</li>
                    <li>Flying after an AD has been exceeded</li>
                    <li>Ferry flights for sale or export</li>
                </ul>
                <p style={{ marginTop: '0.5rem', color: '#ec4899', fontWeight: 600 }}>
                    ⚠️ Issued by the FAA, not the pilot. Must be carried in the aircraft.
                </p>
            </EXPANDABLE>
        </div>
    );
};
