import React, { useState } from 'react';
import { ChevronDown, Cog, Thermometer, Gauge, Monitor, Wind, AlertTriangle } from 'lucide-react';
import { sfx } from '../../../utils/sfx';

const CARD: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: 'clamp(0.75rem, 3vw, 1.25rem)',
};

const EXPANDABLE: React.FC<{ title: string; icon?: React.ReactNode; color?: string; children: React.ReactNode }> = ({ title, icon, color: _color = '#eab308', children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ ...CARD, overflow: 'hidden', padding: 0 }}>
            <button
                onClick={() => { sfx.playSelect(); setOpen(!open); }}
                onMouseEnter={() => sfx.playHover()}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 'clamp(0.6rem, 2vw, 1rem) clamp(0.75rem, 3vw, 1.25rem)', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', color: 'var(--text-primary)', fontWeight: 600, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{icon} {title}</span>
                <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'var(--transition)', color: 'var(--text-secondary)' }} />
            </button>
            {open && (
                <div style={{ padding: '0 clamp(0.75rem, 3vw, 1.25rem) clamp(0.75rem, 3vw, 1.25rem)', borderTop: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: 'clamp(0.8rem, 2vw, 0.88rem)', lineHeight: 1.7 }}>
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
            <h3 style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Aircraft Axes of Rotation
            </h3>
            <svg viewBox="0 0 300 200" style={{ width: '100%', maxWidth: '300px', height: 'auto' }}>
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
                            padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: 'clamp(0.65rem, 1.8vw, 0.78rem)', fontWeight: 700,
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
                <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 700, color: '#eab308', marginBottom: '0.3rem' }}>
                    Aircraft Systems
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>Flight Controls, Engine, Instruments & Avionics</p>
            </header>

            {/* Axes Diagram */}
            <AxesDiagram />

            {/* Primary Flight Controls */}
            <div style={CARD}>
                <h3 style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    <Cog size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                    Primary Flight Controls
                </h3>
                <div className="ppl-card-grid-3">
                    {PRIMARY_CONTROLS.map(c => (
                        <div key={c.name} style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', borderRadius: '10px', background: `${c.color}15`, border: `1px solid ${c.color}40`, textAlign: 'center' }}>
                            <strong style={{ color: c.color, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>{c.name}</strong>
                            <div style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.78rem)', color: 'var(--text-primary)', marginTop: '0.2rem', fontWeight: 600 }}>{c.axis}</div>
                            <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{c.location}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Secondary Controls */}
            <div style={CARD}>
                <h3 style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Secondary Flight Controls
                </h3>
                <div className="ppl-tab-row" style={{ gap: '0.4rem' }}>
                    {SECONDARY_CONTROLS.map(c => (
                        <div key={c.name} style={{ padding: '0.4rem 0.7rem', borderRadius: '8px', background: `${c.color}15`, border: `1px solid ${c.color}40`, display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                            <strong style={{ color: c.color, fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>{c.name}</strong>
                            <span style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', color: 'var(--text-secondary)' }}>— {c.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Engine Issues */}
            <div className="ppl-card-grid-3">
                {ENGINE_ISSUES.map(e => (
                    <div key={e.name} style={{ ...CARD, border: `1px solid ${e.color}40` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: e.color, fontWeight: 700, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                            {e.icon} {e.name}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: 'clamp(0.72rem, 1.8vw, 0.82rem)' }}>
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
                <div className="ppl-table-scroll">
                    <table className="ppl-compact-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                <div className="ppl-card-grid-4" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                    {GLASS_COMPONENTS.map(g => (
                        <div key={g.name} style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', borderRadius: '10px', background: `${g.color}15`, border: `1px solid ${g.color}40` }}>
                            <strong style={{ color: g.color, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>{g.name}</strong>
                            <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{g.full}</div>
                            <p style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.78rem)', color: 'var(--text-secondary)', margin: '0.3rem 0 0' }}>{g.desc}</p>
                        </div>
                    ))}
                </div>
            </EXPANDABLE>

            {/* Deicing vs Anti-icing */}
            <EXPANDABLE title="❄️ Deicing vs Anti-icing" icon={<Thermometer size={18} />} color="#06b6d4">
                <div className="ppl-card-grid-2" style={{ marginTop: '0.5rem' }}>
                    <div style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                        <strong style={{ color: '#3b82f6' }}>Anti-icing</strong>
                        <p style={{ fontSize: 'clamp(0.72rem, 1.8vw, 0.82rem)', color: 'var(--text-secondary)', margin: '0.3rem 0 0' }}>
                            Prevents ice from forming. Applied before entering icing conditions. Types: thermal (bleed air), chemical (fluid), pneumatic (boots).
                        </p>
                    </div>
                    <div style={{ padding: 'clamp(0.5rem, 2vw, 0.75rem)', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <strong style={{ color: '#ef4444' }}>Deicing</strong>
                        <p style={{ fontSize: 'clamp(0.72rem, 1.8vw, 0.82rem)', color: 'var(--text-secondary)', margin: '0.3rem 0 0' }}>
                            Removes ice after it has formed. Types: thermal, chemical, mechanical. Pneumatic boots inflate to crack ice.
                        </p>
                    </div>
                </div>
            </EXPANDABLE>

            {/* Electrical System */}
            <EXPANDABLE title="⚡ Electrical System" icon={<Monitor size={18} />} color="#eab308">
                <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Components:</strong> Battery, alternator, master switch (ALT/BAT), bus, circuit breakers, fuses.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Master Switch:</strong> Two positions — BAT (battery only) and ALT (alternator + battery).
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Alternator:</strong> Driven by engine, generates AC converted to DC, voltage regulator controls output.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Bus:</strong> Distributes power to all circuits.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Circuit Breakers:</strong> Push-to-reset; if one trips, determine cause before resetting.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Fuses:</strong> One-time protection; must be replaced with correct amperage.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Volts/Amps:</strong> Volts = pressure, Amps = flow.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}><strong>Electrical Failure:</strong></p>
                    <ol style={{ paddingLeft: '1.5rem', marginBottom: '0.5rem' }}>
                        <li style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)' }}>Check master switch</li>
                        <li style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)' }}>Check circuit breakers</li>
                        <li style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)' }}>Check alternator field fuse</li>
                        <li style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)' }}>Reduce electrical load (turn off non-essential avionics)</li>
                        <li style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)' }}>Land as soon as practicable</li>
                    </ol>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', color: '#eab308', fontWeight: 700 }}>
                        Key Rule: Never pull a circuit breaker in flight unless instructed by checklist.
                    </p>
                </div>
            </EXPANDABLE>

            {/* Fuel System */}
            <EXPANDABLE title="⛽ Fuel System" icon={<Gauge size={18} />} color="#eab308">
                <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}><strong>Fuel Types:</strong></p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.5rem' }}>
                        <li style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)' }}><strong>100LL (low lead)</strong> — blue, for piston engines</li>
                        <li style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)' }}><strong>Jet-A</strong> — clear/straw, for turbine engines</li>
                        <li style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)' }}><strong>Mogas</strong> — automotive fuel (approved for some aircraft with STC)</li>
                    </ul>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Fuel Contamination:</strong> Water, dirt, debris — always visually check fuel during preflight.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Fuel Vents:</strong> Allow expansion; must be clear of obstructions.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Fuel Gauges:</strong> Indicate quantity only (not quality); use dipstick for accuracy.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Fuel Selector:</strong> ON, OFF, LEFT, RIGHT, BOTH, or AUX positions.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Fuel System Check:</strong> Verify correct tank selected, check fuel quantity, check for contamination.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Gascolator:</strong> Drain point at lowest point in fuel system; check for water during preflight.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', color: '#eab308', fontWeight: 700 }}>
                        Key Rule: Always visually verify fuel quantity; never trust gauges alone.
                    </p>
                </div>
            </EXPANDABLE>

            {/* Ignition System */}
            <EXPANDABLE title="🔌 Ignition System" icon={<Cog size={18} />} color="#eab308">
                <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Magneto System:</strong> Self-contained AC generators, one per engine.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Ignition Switch Positions:</strong> OFF → R → L → BOTH → START.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Why TWO magnetos:</strong> Redundancy; if one fails, engine runs on the other.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}><strong>Magneto Check:</strong> During runup, check each magneto for 50-125 RPM drop.</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.5rem' }}>
                        <li style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)' }}>Excessive drop = dirty plug or magneto issue</li>
                        <li style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)' }}>No drop = magneto not grounding (stuck P-lead)</li>
                    </ul>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>P-Lead:</strong> Grounding wire from magneto to ignition switch.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Impulse Coupling:</strong> Helps starting by snapping the magneto at low RPM.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Spark Plugs:</strong> Check during 100-hour inspection.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', color: '#eab308', fontWeight: 700 }}>
                        Key Rule: Never turn off magnetos in flight (engine will continue to run but poorly).
                    </p>
                </div>
            </EXPANDABLE>

            {/* Hydraulic System */}
            <EXPANDABLE title="🔧 Hydraulic System" icon={<Cog size={18} />} color="#eab308">
                <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Purpose:</strong> Power boost for landing gear, flaps, brakes (on larger aircraft).
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Components:</strong> Reservoir, pump (engine-driven or electric), actuators, lines.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Hydraulic Fluid:</strong> MIL-H-5606 (red), MIL-PRF-83282 (amber).
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', marginBottom: '0.5rem' }}>
                        <strong>Failure:</strong> Loss of hydraulic pressure → manual backup for gear/flaps.
                    </p>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.85rem)', color: '#eab308', fontWeight: 700 }}>
                        Key Point: Most light aircraft (C172) have minimal or no hydraulic systems.
                    </p>
                </div>
            </EXPANDABLE>
        </div>
    );
};
