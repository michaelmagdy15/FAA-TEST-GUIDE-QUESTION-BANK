import React, { useState } from 'react';
import { ChevronDown, Cog, Thermometer, Gauge, Monitor, Wind, AlertTriangle } from 'lucide-react';
import { sfx } from '../../../utils/sfx';

const CARD: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '1.25rem',
};

const EXPANDABLE: React.FC<{ title: string; icon?: React.ReactNode; color?: string; children: React.ReactNode }> = ({ title, icon, color = '#eab308', children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ ...CARD, overflow: 'hidden', padding: 0 }}>
            <button
                onClick={() => { sfx.playSelect(); setOpen(!open); }}
                onMouseEnter={() => sfx.playHover()}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{icon} {title}</span>
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

/* ───── Axes Diagram ───── */
const AxesDiagram: React.FC = () => {
    const [hovered, setHovered] = useState<string | null>(null);
    const axes = [
        { id: 'pitch', label: 'PITCHING', axis: 'Lateral', control: 'Elevator', color: '#3b82f6' },
        { id: 'roll', label: 'ROLLING', axis: 'Longitudinal', control: 'Ailerons', color: '#22c55e' },
        { id: 'yaw', label: 'YAWING', axis: 'Vertical', control: 'Rudder', color: '#f97316' },
    ];
    return (
        <div style={{ ...CARD, textAlign: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Aircraft Axes of Rotation
            </h3>
            <svg width="300" height="200" viewBox="0 0 300 200" style={{ maxWidth: '100%' }}>
                {/* Airplane */}
                <ellipse cx="150" cy="100" rx="55" ry="16" fill="rgba(148,163,184,0.15)" stroke="var(--text-secondary)" strokeWidth="1.5" />
                <polygon points="95,100 78,90 78,110" fill="rgba(148,163,184,0.2)" stroke="var(--text-secondary)" strokeWidth="1" />
                <polygon points="205,100 222,90 222,110" fill="rgba(148,163,184,0.2)" stroke="var(--text-secondary)" strokeWidth="1" />
                <polygon points="140,84 160,84 155,72 145,72" fill="rgba(148,163,184,0.2)" stroke="var(--text-secondary)" strokeWidth="1" />

                {/* Pitching axis (lateral) */}
                <line x1="40" y1="100" x2="260" y2="100" stroke="#3b82f6" strokeWidth={hovered === 'pitch' ? 3 : 1.5} strokeDasharray="6,4" opacity={hovered === 'pitch' ? 1 : 0.4} />
                <text x="150" y="80" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="700" opacity={hovered === 'pitch' ? 1 : 0.5}>← PITCH (Lateral) →</text>

                {/* Rolling axis (longitudinal) */}
                <line x1="150" y1="30" x2="150" y2="170" stroke="#22c55e" strokeWidth={hovered === 'roll' ? 3 : 1.5} strokeDasharray="6,4" opacity={hovered === 'roll' ? 1 : 0.4} />
                <text x="170" y="28" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700" opacity={hovered === 'roll' ? 1 : 0.5}>ROLL (Longitudinal)</text>

                {/* Yawing axis (vertical) */}
                <circle cx="150" cy="100" r="4" fill="#f97316" opacity={hovered === 'yaw' ? 1 : 0.4} />
                <text x="150" y="145" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="700" opacity={hovered === 'yaw' ? 1 : 0.5}>Yaw (Vertical)</text>
            </svg>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                {axes.map(a => (
                    <span
                        key={a.id}
                        onMouseEnter={() => { sfx.playHover(); setHovered(a.id); }}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                            background: hovered === a.id ? `${a.color}30` : `${a.color}15`,
                            color: a.color, border: `1px solid ${a.color}40`, cursor: 'default', transition: 'all 0.2s',
                        }}
                    >
                        {a.label} — {a.axis} — {a.control}
                    </span>
                ))}
            </div>
        </div>
    );
};

/* ───── Flight Controls ───── */
const PRIMARY_CONTROLS = [
    { name: 'Ailerons', axis: 'Rolling (Longitudinal)', location: 'Trailing edge of wings', color: '#22c55e' },
    { name: 'Elevator', axis: 'Pitching (Lateral)', location: 'Horizontal stabilizer', color: '#3b82f6' },
    { name: 'Rudder', axis: 'Yawing (Vertical)', location: 'Vertical stabilizer', color: '#f97316' },
];

const SECONDARY_CONTROLS = [
    { name: 'Flaps', desc: 'Increase lift and drag for slow flight', color: '#06b6d4' },
    { name: 'Trim', desc: 'Relieves control pressure', color: '#8b5cf6' },
    { name: 'Spoilers/Speed Brakes', desc: 'Reduce lift, increase drag', color: '#ef4444' },
    { name: 'Slats', desc: 'Increase critical AoA', color: '#ec4899' },
    { name: 'Slots', desc: 'Channel airflow at high AoA', color: '#a78bfa' },
];

/* ───── Engine Issues ───── */
const ENGINE_ISSUES = [
    {
        name: 'Carburetor Icing',
        color: '#06b6d4',
        icon: <Thermometer size={18} />,
        conditions: 'Temperature 20-70°F, visible moisture',
        effects: 'Reduced RPM, rough engine, possible engine failure',
        remedy: 'Apply full carb heat, lean mixture, increase RPM',
    },
    {
        name: 'Preignition',
        color: '#f97316',
        icon: <AlertTriangle size={18} />,
        conditions: 'Hot spots in combustion chamber ignite fuel early',
        effects: 'Knocking/pinging, reduced power, engine damage',
        remedy: 'Reduce power, lean mixture, check timing',
    },
    {
        name: 'Detonation',
        color: '#ef4444',
        icon: <AlertTriangle size={18} />,
        conditions: 'High manifold pressure, low RPM, lean mixture, high CHT',
        effects: 'Sharp metallic knocking, extreme pressure rise, engine destruction',
        remedy: 'Enrich mixture, reduce power, reduce manifold pressure',
    },
];

/* ───── Pitot-Static ───── */
const PITOT_STATIC_EFFECTS = [
    { instrument: 'Airspeed', blockedPitot: 'Stuck at last reading (or zero if blocked before flight)', blockedStatic: 'Acts like altimeter — increases with altitude', color: '#3b82f6' },
    { instrument: 'Altimeter', blockedPitot: 'No effect', blockedStatic: 'Stuck at last reading (or increases on climb)', color: '#22c55e' },
    { instrument: 'VSI', blockedPitot: 'No effect', blockedStatic: 'Stuck at zero (or delayed response)', color: '#f97316' },
];

/* ───── Glass Cockpit ───── */
const GLASS_COMPONENTS = [
    { name: 'AHRS', full: 'Attitude and Heading Reference System', desc: 'Provides pitch, roll, and heading data using gyros and accelerometers', color: '#3b82f6' },
    { name: 'ADC', full: 'Air Data Computer', desc: 'Processes pitot-static data for airspeed, altitude, and vertical speed', color: '#22c55e' },
    { name: 'PFD', full: 'Primary Flight Display', desc: 'Main instrument display: attitude, airspeed, altitude, heading, VSI, HSI', color: '#06b6d4' },
    { name: 'MFD', full: 'Multi-Function Display', desc: 'Moving map, engine instruments, weather, traffic, flight plan', color: '#8b5cf6' },
];

export const Systems: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#eab308', marginBottom: '0.3rem' }}>
                    Aircraft Systems
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Flight Controls, Engine, Instruments & Avionics</p>
            </header>

            {/* Axes Diagram */}
            <AxesDiagram />

            {/* Primary Flight Controls */}
            <div style={CARD}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    <Cog size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                    Primary Flight Controls
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {PRIMARY_CONTROLS.map(c => (
                        <div key={c.name} style={{ padding: '0.75rem', borderRadius: '10px', background: `${c.color}15`, border: `1px solid ${c.color}40`, textAlign: 'center' }}>
                            <strong style={{ color: c.color, fontSize: '0.95rem' }}>{c.name}</strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginTop: '0.2rem', fontWeight: 600 }}>{c.axis}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{c.location}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Secondary Controls */}
            <div style={CARD}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Secondary Flight Controls
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {SECONDARY_CONTROLS.map(c => (
                        <div key={c.name} style={{ padding: '0.4rem 0.7rem', borderRadius: '8px', background: `${c.color}15`, border: `1px solid ${c.color}40`, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <strong style={{ color: c.color, fontSize: '0.85rem' }}>{c.name}</strong>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>— {c.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Engine Issues */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {ENGINE_ISSUES.map(e => (
                    <div key={e.name} style={{ ...CARD, border: `1px solid ${e.color}40` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: e.color, fontWeight: 700, fontSize: '0.95rem' }}>
                            {e.icon} {e.name}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem' }}>
                            <div><strong>Conditions:</strong> <span style={{ color: 'var(--text-secondary)' }}>{e.conditions}</span></div>
                            <div><strong>Effects:</strong> <span style={{ color: 'var(--text-secondary)' }}>{e.effects}</span></div>
                            <div><strong>Remedy:</strong> <span style={{ color: 'var(--text-secondary)' }}>{e.remedy}</span></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pitot-Static */}
            <EXPANDABLE title="🌡️ Pitot-Static System" icon={<Gauge size={18} />} color="#06b6d4">
                <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                    The pitot-static system provides airspeed, altitude, and vertical speed information. Blocked ports cause erroneous readings:
                </p>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                <th style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-primary)' }}>Instrument</th>
                                <th style={{ padding: '0.5rem', textAlign: 'center', color: '#f97316' }}>Blocked Pitot</th>
                                <th style={{ padding: '0.5rem', textAlign: 'center', color: '#ef4444' }}>Blocked Static</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PITOT_STATIC_EFFECTS.map(p => (
                                <tr key={p.instrument} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '0.5rem', fontWeight: 700, color: p.color }}>{p.instrument}</td>
                                    <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{p.blockedPitot}</td>
                                    <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{p.blockedStatic}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </EXPANDABLE>

            {/* Vacuum System */}
            <EXPANDABLE title="🌀 Vacuum System" icon={<Wind size={18} />} color="#a78bfa">
                <div style={{ marginTop: '0.5rem' }}>
                    <p><strong>Purpose:</strong> Powers gyroscopic instruments (attitude indicator, heading indicator, turn coordinator).</p>
                    <p style={{ marginTop: '0.3rem' }}><strong>Failure indication:</strong> Gyro instruments slowly drift or tumble. Attitude indicator may show false attitude.</p>
                    <p style={{ marginTop: '0.3rem' }}><strong>Red line:</strong> Vacuum gauge shows operating range. Below minimum = insufficient vacuum.</p>
                </div>
            </EXPANDABLE>

            {/* Glass Cockpit */}
            <EXPANDABLE title="🖥️ Glass Cockpit" icon={<Monitor size={18} />} color="#06b6d4">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {GLASS_COMPONENTS.map(g => (
                        <div key={g.name} style={{ padding: '0.75rem', borderRadius: '10px', background: `${g.color}15`, border: `1px solid ${g.color}40` }}>
                            <strong style={{ color: g.color, fontSize: '0.95rem' }}>{g.name}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{g.full}</div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0' }}>{g.desc}</p>
                        </div>
                    ))}
                </div>
            </EXPANDABLE>

            {/* Deicing vs Anti-icing */}
            <EXPANDABLE title="❄️ Deicing vs Anti-icing" icon={<Thermometer size={18} />} color="#06b6d4">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                        <strong style={{ color: '#3b82f6' }}>Anti-icing</strong>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0' }}>
                            Prevents ice from forming. Applied before entering icing conditions. Types: thermal (bleed air), chemical (fluid), pneumatic (boots).
                        </p>
                    </div>
                    <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <strong style={{ color: '#ef4444' }}>Deicing</strong>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0' }}>
                            Removes ice after it has formed. Types: thermal, chemical, mechanical. Pneumatic boots inflate to crack ice.
                        </p>
                    </div>
                </div>
            </EXPANDABLE>
        </div>
    );
};
