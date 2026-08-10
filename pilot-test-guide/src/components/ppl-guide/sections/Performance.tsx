import React, { useState } from 'react';
import { ChevronDown, Gauge, Wind, RotateCcw, ArrowUp, Activity } from 'lucide-react';
import { sfx } from '../../../utils/sfx';

const CARD: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: 'clamp(0.75rem, 3vw, 1.25rem)',
};

const EXPANDABLE: React.FC<{ title: string; icon?: React.ReactNode; color?: string; children: React.ReactNode }> = ({ title, icon, color: _color = '#f97316', children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ ...CARD, overflow: 'hidden', padding: 0 }}>
            <button
                onClick={() => { sfx.playSelect(); setOpen(!open); }}
                onMouseEnter={() => sfx.playHover()}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(0.75rem, 3vw, 1.25rem)', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', color: 'var(--text-primary)', fontWeight: 600, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{icon} {title}</span>
                <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'var(--transition)', color: 'var(--text-secondary)' }} />
            </button>
            {open && (
                <div style={{ padding: '0 clamp(0.75rem, 3vw, 1.25rem) clamp(0.75rem, 3vw, 1.25rem)', borderTop: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)', lineHeight: 1.7 }}>
                    {children}
                </div>
            )}
        </div>
    );
};

/* ───── Four Forces SVG ───── */
const FourForces: React.FC = () => {
    const [hovered, setHovered] = useState<string | null>(null);
    const forces = [
        { id: 'lift', label: 'LIFT', x: 150, y: 30, color: '#22c55e', desc: 'Upward force from wings' },
        { id: 'weight', label: 'WEIGHT', x: 150, y: 170, color: '#ef4444', desc: 'Downward force (gravity)' },
        { id: 'thrust', label: 'THRUST', x: 30, y: 100, color: '#3b82f6', desc: 'Forward force (engine)' },
        { id: 'drag', label: 'DRAG', x: 270, y: 100, color: '#f97316', desc: 'Backward force (air resistance)' },
    ];
    return (
        <div style={{ ...CARD, textAlign: 'center' }}>
            <h3 style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                The Four Forces
            </h3>
            <svg viewBox="0 0 300 200" style={{ width: '100%', maxWidth: '300px', height: 'auto' }}>
                {/* Airplane body */}
                <ellipse cx="150" cy="100" rx="50" ry="18" fill="rgba(148,163,184,0.2)" stroke="var(--text-secondary)" strokeWidth="1.5" />
                <polygon points="100,100 85,92 85,108" fill="rgba(148,163,184,0.3)" stroke="var(--text-secondary)" strokeWidth="1" />
                <polygon points="200,100 215,92 215,108" fill="rgba(148,163,184,0.3)" stroke="var(--text-secondary)" strokeWidth="1" />
                <polygon points="140,82 160,82 155,70 145,70" fill="rgba(148,163,184,0.3)" stroke="var(--text-secondary)" strokeWidth="1" />

                {/* Force arrows */}
                <defs>
                    <marker id="arrowG" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0,0 8,3 0,6" fill="#22c55e" /></marker>
                    <marker id="arrowR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0,0 8,3 0,6" fill="#ef4444" /></marker>
                    <marker id="arrowB" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0,0 8,3 0,6" fill="#3b82f6" /></marker>
                    <marker id="arrowO" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0,0 8,3 0,6" fill="#f97316" /></marker>
                </defs>
                <line x1="150" y1="80" x2="150" y2="40" stroke="#22c55e" strokeWidth="2.5" markerEnd="url(#arrowG)" opacity={hovered === 'lift' ? 1 : 0.7} />
                <line x1="150" y1="120" x2="150" y2="160" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arrowR)" opacity={hovered === 'weight' ? 1 : 0.7} />
                <line x1="110" y1="100" x2="60" y2="100" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#arrowB)" opacity={hovered === 'thrust' ? 1 : 0.7} />
                <line x1="190" y1="100" x2="240" y2="100" stroke="#f97316" strokeWidth="2.5" markerEnd="url(#arrowO)" opacity={hovered === 'drag' ? 1 : 0.7} />
            </svg>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {forces.map(f => (
                    <span
                        key={f.id}
                        onMouseEnter={() => { sfx.playHover(); setHovered(f.id); }}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', fontWeight: 700,
                            background: hovered === f.id ? `${f.color}30` : `${f.color}15`,
                            color: f.color, border: `1px solid ${f.color}40`, cursor: 'default', transition: 'all 0.2s',
                        }}
                    >
                        {f.label}: {f.desc}
                    </span>
                ))}
            </div>
        </div>
    );
};

/* ───── V-Speeds ───── */
const V_SPEEDS = [
    { speed: 'VS0', value: '48 KIAS', desc: 'Stall speed, landing configuration', color: '#ef4444', arc: 'white' },
    { speed: 'VS1', value: '54 KIAS', desc: 'Stall speed, clean configuration', color: '#ef4444', arc: 'white' },
    { speed: 'VFE', value: '85 KIAS', desc: 'Max flap extended speed', color: '#22c55e', arc: 'white' },
    { speed: 'VNO', value: '129 KIAS', desc: 'Max structural cruising speed', color: '#eab308', arc: 'green' },
    { speed: 'VNE', value: '163 KIAS', desc: 'Never exceed speed', color: '#ef4444', arc: 'red' },
    { speed: 'VA', value: '99 KIAS', desc: 'Design maneuvering speed', color: '#3b82f6', arc: 'yellow' },
    { speed: 'VX', value: '62 KIAS', desc: 'Best angle of climb', color: '#8b5cf6', arc: 'none' },
    { speed: 'VY', value: '76 KIAS', desc: 'Best rate of climb', color: '#06b6d4', arc: 'none' },
    { speed: 'Vglide', value: '73 KIAS', desc: 'Best glide speed', color: '#a78bfa', arc: 'none' },
    { speed: 'Vr', value: '55 KIAS', desc: 'Rotation speed', color: '#f97316', arc: 'none' },
];

/* ───── ASI Gauge SVG ───── */
const AirspeedGauge: React.FC = () => {
    const [hoveredArc, setHoveredArc] = useState<string | null>(null);
    const arcs = [
        { id: 'white', label: 'Flap Operating Range', color: '#ffffff', startAngle: 135, endAngle: 195, desc: 'VS0 to VFE (48-85 KIAS)' },
        { id: 'green', label: 'Normal Operating Range', color: '#22c55e', startAngle: 195, endAngle: 280, desc: 'VS1 to VNO (54-129 KIAS)' },
        { id: 'yellow', label: 'Caution Range', color: '#eab308', startAngle: 280, endAngle: 330, desc: 'VNO to VNE (129-163 KIAS)' },
        { id: 'red', label: 'Never Exceed', color: '#ef4444', startAngle: 330, endAngle: 360, desc: 'VNE (163 KIAS)' },
    ];
    const toXY = (cx: number, cy: number, r: number, angleDeg: number) => ({
        x: cx + r * Math.cos((angleDeg * Math.PI) / 180),
        y: cy + r * Math.sin((angleDeg * Math.PI) / 180),
    });
    const arc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
        const start = toXY(cx, cy, r, startAngle);
        const end = toXY(cx, cy, r, endAngle);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
    };

    return (
        <div style={{ ...CARD, textAlign: 'center' }}>
            <h3 style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                <Gauge size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                Airspeed Indicator Markings
            </h3>
            <svg viewBox="0 0 220 220" style={{ width: '100%', maxWidth: '220px', height: 'auto' }}>
                {/* Background */}
                <circle cx="110" cy="110" r="100" fill="rgba(15,23,42,0.8)" stroke="var(--glass-border)" strokeWidth="2" />
                {/* Arcs */}
                {arcs.map(a => (
                    <path
                        key={a.id}
                        d={arc(110, 110, 85, a.startAngle, a.endAngle)}
                        fill="none"
                        stroke={a.color}
                        strokeWidth={hoveredArc === a.id ? 12 : 8}
                        strokeLinecap="round"
                        opacity={hoveredArc && hoveredArc !== a.id ? 0.4 : 0.9}
                        style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                        onMouseEnter={() => { sfx.playHover(); setHoveredArc(a.id); }}
                        onMouseLeave={() => setHoveredArc(null)}
                    />
                ))}
                {/* Needle */}
                <line x1="110" y1="110" x2="40" y2="110" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" transform="rotate(-45, 110, 110)" />
                <circle cx="110" cy="110" r="5" fill="var(--text-primary)" />
                {/* Center label */}
                <text x="110" y="130" textAnchor="middle" fill="var(--text-secondary)" fontSize="9" fontFamily="monospace">KIAS</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem', textAlign: 'left' }}>
                {arcs.map(a => (
                    <div
                        key={a.id}
                        onMouseEnter={() => { sfx.playHover(); setHoveredArc(a.id); }}
                        onMouseLeave={() => setHoveredArc(null)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.5rem',
                            borderRadius: '6px', background: hoveredArc === a.id ? `${a.color}20` : 'transparent',
                            transition: 'all 0.15s',
                        }}
                    >
                        <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: a.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 'clamp(0.68rem, 1.8vw, 0.78rem)', color: 'var(--text-primary)', fontWeight: hoveredArc === a.id ? 700 : 500 }}>{a.label}</span>
                        <span style={{ fontSize: 'clamp(0.62rem, 1.5vw, 0.72rem)', color: 'var(--text-secondary)', marginLeft: 'auto' }}>{a.desc}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ───── Aerodynamic Terms ───── */
const AERO_TERMS = [
    { term: 'Angle of Attack (AoA)', desc: 'Angle between chord line and relative wind. Increases with pitch.', color: '#3b82f6' },
    { term: 'Critical AoA', desc: 'Angle of attack at which stall occurs (~18° for most airfoils).', color: '#ef4444' },
    { term: 'Load Factor', desc: 'Ratio of lift to weight. In level flight = 1G. In turn = increased.', color: '#f97316' },
    { term: 'Adverse Yaw', desc: 'Nose yaw in opposite direction of turn. Caused by drag differential.', color: '#a78bfa' },
    { term: 'Wingtip Vortices', desc: 'Rotating air from high to low pressure at wingtips. Strongest during slow, heavy, clean configurations.', color: '#06b6d4' },
    { term: 'Aspect Ratio', desc: 'Ratio of wingspan to chord. Higher = more efficient.', color: '#22c55e' },
];

const LEFT_TURN_TENDENCIES = [
    { name: 'P-Factor', desc: 'Asymmetric thrust — descending right blade has more angle of attack, producing more thrust on right side.', color: '#3b82f6' },
    { name: 'Torque', desc: 'Newton\'s 3rd law — propeller rotation causes aircraft to roll opposite direction.', color: '#f97316' },
    { name: 'Gyroscopic Precession', desc: 'Applied force manifests 90° later in rotation direction.', color: '#a78bfa' },
    { name: 'Spiral Slipstream', desc: 'Propwash strikes left side of vertical stabilizer, pushing tail right, nose left.', color: '#22c55e' },
];

const STABILITY = [
    { type: 'Static', desc: 'Initial tendency to return to original attitude after disturbance', sub: [
        { kind: 'Positive', detail: 'Returns to original attitude', color: '#22c55e' },
        { kind: 'Neutral', detail: 'Remains at new attitude', color: '#eab308' },
        { kind: 'Negative', detail: 'Continues away from original attitude', color: '#ef4444' },
    ]},
    { type: 'Dynamic', desc: 'Longer-term tendency after disturbance', sub: [
        { kind: 'Divergent', detail: 'Oscillations increase', color: '#ef4444' },
        { kind: 'Neutral', detail: 'Oscillations remain constant', color: '#eab308' },
        { kind: 'Convergent', detail: 'Oscillations decrease', color: '#22c55e' },
    ]},
];

const LOAD_FACTOR_LIMITS = [
    { maneuver: 'Level flight', load: '1.0 G', color: '#22c55e' },
    { maneuver: 'Normal turn (45° bank)', load: '1.41 G', color: '#3b82f6' },
    { maneuver: 'Steep turn (60° bank)', load: '2.0 G', color: '#f97316' },
    { maneuver: 'Acrobatic (pull-up)', load: '3.8 G (normal category)', color: '#ef4444' },
];

const DRAG_TYPES = [
    { type: 'Parasite', desc: 'Drag from aircraft shape. Increases with speed squared.', color: '#ef4444' },
    { type: 'Induced', desc: 'Drag from lift production. Decreases with speed.', color: '#3b82f6' },
    { type: 'Interference', desc: 'Drag where components meet (wing-fuselage).', color: '#f97316' },
    { type: 'Skin Friction', desc: 'Drag from air viscosity on surface.', color: '#a78bfa' },
    { type: 'Form', desc: 'Drag from cross-sectional area.', color: '#06b6d4' },
];

const ALTITUDE_TYPES = [
    { type: 'Indicated (IA)', desc: 'Raw instrument reading', color: '#94a3b8' },
    { type: 'Calibrated (CA)', desc: 'IA corrected for instrument and position error', color: '#3b82f6' },
    { type: 'Equivalent (EA)', desc: 'CA corrected for compressibility', color: '#06b6d4' },
    { type: 'True (TA)', desc: 'EA corrected for non-standard temperature/pressure', color: '#22c55e' },
    { type: 'Density (DA)', desc: 'Pressure altitude corrected for non-standard temperature', color: '#f97316' },
];

export const Performance: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 2vw, 1rem)' }}>
            <header style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 700, color: '#f97316', marginBottom: '0.3rem' }}>
                    Performance & Aerodynamics
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>Forces, V-Speeds, Stability, and Airspeed/Altitude Types</p>
            </header>

            {/* Four Forces */}
            <FourForces />

            {/* V-Speeds */}
            <div style={CARD}>
                <h3 style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    <Wind size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                    V-Speeds Reference
                </h3>
                <div className="ppl-table-scroll">
                    <table className="ppl-compact-table">
                        <thead>
                            <tr>
                                <th>Speed</th>
                                <th>Value</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {V_SPEEDS.map(v => (
                                <tr key={v.speed}>
                                    <td style={{ fontWeight: 800, color: v.color, fontFamily: 'monospace' }}>{v.speed}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{v.value}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{v.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ASI Gauge */}
            <AirspeedGauge />

            {/* Aerodynamic Terms */}
            <EXPANDABLE title="📚 Aerodynamic Terms" icon={<Activity size={18} />} color="#f97316">
                <div className="ppl-card-grid-3" style={{ marginTop: '0.5rem' }}>
                    {AERO_TERMS.map(t => (
                        <div key={t.term} style={{ padding: '0.5rem', borderRadius: '8px', background: `${t.color}15`, border: `1px solid ${t.color}40` }}>
                            <strong style={{ color: t.color, fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>{t.term}</strong>
                            <p style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.78rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>{t.desc}</p>
                        </div>
                    ))}
                </div>
            </EXPANDABLE>

            {/* Left-Turning Tendencies */}
            <EXPANDABLE title="↩️ Left-Turning Tendencies" icon={<RotateCcw size={18} />} color="#a78bfa">
                <div className="ppl-card-grid-3" style={{ marginTop: '0.5rem' }}>
                    {LEFT_TURN_TENDENCIES.map(t => (
                        <div key={t.name} style={{ padding: '0.5rem', borderRadius: '8px', background: `${t.color}15`, border: `1px solid ${t.color}40` }}>
                            <strong style={{ color: t.color, fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>{t.name}</strong>
                            <p style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.78rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>{t.desc}</p>
                        </div>
                    ))}
                </div>
            </EXPANDABLE>

            {/* Stability */}
            <EXPANDABLE title="⚖️ Stability" icon={<Activity size={18} />} color="#06b6d4">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                    {STABILITY.map(s => (
                        <div key={s.type}>
                            <h4 style={{ color: '#06b6d4', marginBottom: '0.3rem' }}>{s.type} Stability</h4>
                            <p style={{ fontSize: 'clamp(0.72rem, 2vw, 0.82rem)', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{s.desc}</p>
                            <div className="ppl-tab-row">
                                {s.sub.map(sub => (
                                    <div key={sub.kind} style={{ flex: 1, minWidth: 'min(100px, 30vw)', padding: '0.4rem', borderRadius: '6px', background: `${sub.color}15`, border: `1px solid ${sub.color}40`, textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, color: sub.color, fontSize: 'clamp(0.72rem, 2vw, 0.82rem)' }}>{sub.kind}</div>
                                        <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', color: 'var(--text-secondary)' }}>{sub.detail}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </EXPANDABLE>

            {/* Load Factor */}
            <div style={CARD}>
                <h3 style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Load Factor Limits</h3>
                <div className="ppl-card-grid-4">
                    {LOAD_FACTOR_LIMITS.map(l => (
                        <div key={l.maneuver} style={{ padding: '0.5rem', borderRadius: '8px', background: `${l.color}15`, border: `1px solid ${l.color}40`, textAlign: 'center' }}>
                            <div style={{ fontWeight: 700, color: l.color, fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>{l.load}</div>
                            <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', color: 'var(--text-secondary)' }}>{l.maneuver}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Slip vs Skid & Spins */}
            <EXPANDABLE title="🔄 Slip vs Skid / Spins" icon={<RotateCcw size={18} />} color="#ec4899">
                <div style={{ marginTop: '0.5rem' }}>
                    <p><strong>Slip:</strong> Nose points outside the turn. Ball is toward inside of turn. Fix by adding inside rudder.</p>
                    <p style={{ marginTop: '0.3rem' }}><strong>Skid:</strong> Nose points inside the turn. Ball is toward outside of turn. Fix by reducing inside rudder.</p>
                    <p style={{ marginTop: '0.5rem' }}><strong>Spin:</strong> Aerodynamic stall + yaw. Wing on inside of turn is more stalled. Recovery: PARE</p>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)', marginTop: '0.5rem' }}>
                        <strong style={{ color: '#ec4899' }}>PARE Recovery:</strong>
                        <span style={{ marginLeft: '0.5rem', fontSize: 'clamp(0.72rem, 2vw, 0.82rem)', color: 'var(--text-secondary)' }}>
                            <strong>P</strong>ower — Idle | <strong>A</strong>ilerons — Neutral | <strong>R</strong>udder — Full opposite | <strong>E</strong>levator — Forward to break stall
                        </span>
                    </div>
                </div>
            </EXPANDABLE>

            {/* Types of Drag */}
            <EXPANDABLE title="💨 Types of Drag" icon={<Wind size={18} />} color="#94a3b8">
                <div className="ppl-card-grid-3" style={{ marginTop: '0.5rem' }}>
                    {DRAG_TYPES.map(d => (
                        <div key={d.type} style={{ padding: '0.5rem', borderRadius: '8px', background: `${d.color}15`, border: `1px solid ${d.color}40` }}>
                            <strong style={{ color: d.color, fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>{d.type} Drag</strong>
                            <p style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.78rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>{d.desc}</p>
                        </div>
                    ))}
                </div>
            </EXPANDABLE>

            {/* Airspeed Types */}
            <EXPANDABLE title="🛩️ Airspeed Types" icon={<Gauge size={18} />} color="#06b6d4">
                <div className="ppl-card-grid-3" style={{ marginTop: '0.5rem' }}>
                    {ALTITUDE_TYPES.slice(0, 4).map(a => (
                        <div key={a.type} style={{ padding: '0.5rem', borderRadius: '8px', background: `${a.color}15`, border: `1px solid ${a.color}40` }}>
                            <strong style={{ color: a.color, fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>{a.type}</strong>
                            <p style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.78rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>{a.desc}</p>
                        </div>
                    ))}
                    <div key="GS" style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)' }}>
                        <strong style={{ color: '#a78bfa', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>Groundspeed (GS)</strong>
                        <p style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.78rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>TAS corrected for wind — actual speed over ground</p>
                    </div>
                </div>
            </EXPANDABLE>

            {/* Altitude Types */}
            <EXPANDABLE title="🏔️ Altitude Types" icon={<ArrowUp size={18} />} color="#22c55e">
                <div className="ppl-card-grid-3" style={{ marginTop: '0.5rem' }}>
                    {ALTITUDE_TYPES.map(a => (
                        <div key={a.type} style={{ padding: '0.5rem', borderRadius: '8px', background: `${a.color}15`, border: `1px solid ${a.color}40` }}>
                            <strong style={{ color: a.color, fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>{a.type} Altitude</strong>
                            <p style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.78rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>{a.desc}</p>
                        </div>
                    ))}
                </div>
            </EXPANDABLE>

            {/* Density Altitude */}
            <EXPANDABLE title="🌡️ Density Altitude" icon={<ArrowUp size={18} />} color="#f97316">
                <div style={{ marginTop: '0.5rem' }}>
                    <p><strong>Density Altitude:</strong> Pressure altitude corrected for non-standard temperature. High density altitude reduces performance.</p>
                    <p style={{ marginTop: '0.3rem' }}><strong>Factors that increase density altitude:</strong></p>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                        <li>High temperature</li>
                        <li>High altitude (pressure altitude)</li>
                        <li>High humidity</li>
                        <li>Low barometric pressure</li>
                    </ul>
                    <p style={{ marginTop: '0.3rem' }}><strong>Effects:</strong> Longer takeoff roll, reduced climb rate, reduced engine power, higher true airspeed.</p>
                </div>
            </EXPANDABLE>

            {/* Weight & Balance */}
            <EXPANDABLE title="⚖️ Weight & Balance" icon={<Activity size={18} />} color="#f97316">
                <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', marginBottom: '0.6rem' }}>
                        <strong style={{ color: '#f97316', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>Key Rule — FAR 91.103</strong>
                        <p style={{ fontSize: 'clamp(0.72rem, 2vw, 0.82rem)', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                            Pilot must ensure aircraft is within weight and CG limits before every flight. No excuses.
                        </p>
                    </div>

                    <h4 style={{ color: '#f97316', marginBottom: '0.3rem', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>Formulas</h4>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(15,23,42,0.5)', border: '1px solid var(--glass-border)', marginBottom: '0.5rem', fontFamily: 'monospace', fontSize: 'clamp(0.72rem, 2vw, 0.82rem)', color: 'var(--text-primary)' }}>
                        <div><strong style={{ color: '#f97316' }}>Weight:</strong> Total Weight = Empty Weight + Pilot + Passengers + Fuel + Baggage</div>
                        <div style={{ marginTop: '0.3rem' }}><strong style={{ color: '#f97316' }}>Moment:</strong> Moment = Weight × Arm</div>
                        <div style={{ marginTop: '0.2rem' }}><strong style={{ color: '#f97316' }}>CG:</strong> CG = Total Moment / Total Weight</div>
                    </div>

                    <h4 style={{ color: '#f97316', marginBottom: '0.3rem', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>Fuel Weight</h4>
                    <p style={{ fontSize: 'clamp(0.72rem, 2vw, 0.82rem)', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Avgas (100LL) = <strong style={{ color: '#f97316' }}>6 lbs/gal</strong> &nbsp;|&nbsp; Jet-A = <strong style={{ color: '#f97316' }}>6.7 lbs/gal</strong>
                    </p>

                    <h4 style={{ color: '#f97316', marginBottom: '0.3rem', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>CG Limits</h4>
                    <p style={{ fontSize: 'clamp(0.72rem, 2vw, 0.82rem)', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Must remain between forward and aft CG limits specified in the POH. Out-of-CG flight is dangerous and illegal.
                    </p>

                    <h4 style={{ color: '#f97316', marginBottom: '0.3rem', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>Sample Calculation (C172)</h4>
                    <div className="ppl-table-scroll">
                        <table className="ppl-compact-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Weight (lbs)</th>
                                    <th>Moment (in-lbs)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Empty Weight</td>
                                    <td>1,663</td>
                                    <td>136,800</td>
                                </tr>
                                <tr>
                                    <td>Pilot (front)</td>
                                    <td>170</td>
                                    <td>170 × 85 = 14,450</td>
                                </tr>
                                <tr>
                                    <td>Front Passenger</td>
                                    <td>150</td>
                                    <td>150 × 85 = 12,750</td>
                                </tr>
                                <tr>
                                    <td>Rear Passengers</td>
                                    <td>200</td>
                                    <td>200 × 121 = 24,200</td>
                                </tr>
                                <tr>
                                    <td>Fuel (40 gal)</td>
                                    <td>240</td>
                                    <td>240 × 48 = 11,520</td>
                                </tr>
                                <tr>
                                    <td>Oil</td>
                                    <td>8</td>
                                    <td>8 × −14 = −112</td>
                                </tr>
                                <tr>
                                    <td>Baggage</td>
                                    <td>50</td>
                                    <td>50 × 150 = 7,500</td>
                                </tr>
                                <tr style={{ fontWeight: 800, borderTop: '2px solid rgba(249,115,22,0.5)' }}>
                                    <td style={{ color: '#f97316' }}>TOTAL</td>
                                    <td style={{ color: '#f97316' }}>2,481 lbs</td>
                                    <td style={{ color: '#f97316' }}>207,108 in-lbs</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: '0.4rem', padding: '0.4rem', borderRadius: '6px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
                        <strong style={{ color: '#f97316' }}>CG = 207,108 / 2,481 = 83.5″</strong>
                        <span style={{ fontSize: 'clamp(0.68rem, 1.8vw, 0.78rem)', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                            Check against POH CG envelope — must be within forward/aft limits.
                        </span>
                    </div>

                    <h4 style={{ color: '#f97316', marginTop: '0.5rem', marginBottom: '0.3rem', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>Common Errors</h4>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem', fontSize: 'clamp(0.72rem, 2vw, 0.82rem)', color: 'var(--text-secondary)' }}>
                        <li><strong style={{ color: '#ef4444' }}>Overloading:</strong> Exceeds max gross weight — longer takeoff, reduced climb, structural risk</li>
                        <li><strong style={{ color: '#ef4444' }}>Aft CG:</strong> Improperly loaded passengers/fuel shifts CG aft — unstable, may be unrecoverable</li>
                        <li><strong style={{ color: '#ef4444' }}>Incorrect fuel weight:</strong> Forgetting to convert gallons to pounds (40 gal ≠ 40 lbs)</li>
                    </ul>
                </div>
            </EXPANDABLE>

            {/* Takeoff & Landing Distance */}
            <EXPANDABLE title="🛫 Takeoff & Landing Distance" icon={<ArrowUp size={18} />} color="#f97316">
                <div style={{ marginTop: '0.5rem' }}>
                    <h4 style={{ color: '#f97316', marginBottom: '0.3rem', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>Takeoff Distance Required (TODR)</h4>
                    <p style={{ fontSize: 'clamp(0.72rem, 2vw, 0.82rem)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        Total distance from brake release to 50 ft obstacle clearance. Includes ground roll + clearance distance.
                    </p>

                    <h4 style={{ color: '#f97316', marginBottom: '0.3rem', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>Factors that Increase TODR</h4>
                    <div className="ppl-card-grid-3" style={{ marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
                            <strong style={{ color: '#f97316', fontSize: 'clamp(0.72rem, 2vw, 0.82rem)' }}>Environment</strong>
                            <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>High altitude, high temperature, headwind reduction</p>
                        </div>
                        <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
                            <strong style={{ color: '#f97316', fontSize: 'clamp(0.72rem, 2vw, 0.82rem)' }}>Weight & Runway</strong>
                            <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>High weight, short/soft/wet/grass runway, upslope</p>
                        </div>
                    </div>

                    <h4 style={{ color: '#f97316', marginBottom: '0.3rem', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>Landing Distance Required (LDR)</h4>
                    <p style={{ fontSize: 'clamp(0.72rem, 2vw, 0.82rem)', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        Total distance from threshold crossing (50 ft) to full stop. Includes approach/flare + ground roll.
                    </p>

                    <h4 style={{ color: '#f97316', marginBottom: '0.3rem', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>Factors that Increase LDR</h4>
                    <div className="ppl-card-grid-3" style={{ marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
                            <strong style={{ color: '#f97316', fontSize: 'clamp(0.72rem, 2vw, 0.82rem)' }}>Environment</strong>
                            <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>High altitude, high temperature, tailwind, downslope</p>
                        </div>
                        <div style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
                            <strong style={{ color: '#f97316', fontSize: 'clamp(0.72rem, 2vw, 0.82rem)' }}>Weight & Runway</strong>
                            <p style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>High weight, short/soft/wet/grass runway, go-around</p>
                        </div>
                    </div>

                    <h4 style={{ color: '#f97316', marginBottom: '0.3rem', fontSize: 'clamp(0.78rem, 2vw, 0.88rem)' }}>POH Chart Reading</h4>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem', fontSize: 'clamp(0.72rem, 2vw, 0.82rem)', color: 'var(--text-secondary)' }}>
                        <li><strong style={{ color: '#f97316' }}>Density Altitude:</strong> Enter chart at current density altitude</li>
                        <li><strong style={{ color: '#f97316' }}>Weight Correction:</strong> Adjust for actual takeoff/landing weight vs. chart weight</li>
                        <li><strong style={{ color: '#f97316' }}>Wind Correction:</strong> Headwind reduces distance; tailwind increases distance</li>
                        <li><strong style={{ color: '#f97316' }}>Surface Correction:</strong> Grass, soft, or wet surfaces multiply ground roll by correction factor</li>
                    </ul>

                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', marginTop: '0.5rem' }}>
                        <strong style={{ color: '#f97316' }}>Rule of Thumb:</strong>
                        <span style={{ fontSize: 'clamp(0.72rem, 2vw, 0.82rem)', color: 'var(--text-secondary)', marginLeft: '0.3rem' }}>
                            Every 1,000 ft density altitude increase → ~10% longer takeoff distance. Every 100 lbs over gross → ~10% longer distance.
                        </span>
                    </div>
                </div>
            </EXPANDABLE>
        </div>
    );
};
