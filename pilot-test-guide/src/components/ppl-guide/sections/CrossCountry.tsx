import React, { useState } from 'react';
import { ChevronDown, Navigation, Compass, Radio, Map, Plane, AlertTriangle, Lightbulb } from 'lucide-react';
import { sfx } from '../../../utils/sfx';

const CARD: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '1.25rem',
};

const EXPANDABLE: React.FC<{ title: string; icon?: React.ReactNode; color?: string; children: React.ReactNode }> = ({ title, icon, color = '#8b5cf6', children }) => {
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

const NAWFTA: { letter: string; item: string; color: string }[] = [
    { letter: 'N', item: 'Notices to Airmen (NOTAMs)', color: '#3b82f6' },
    { letter: 'A', item: 'ATIS / AWOS (weather)', color: '#06b6d4' },
    { letter: 'W', item: 'Weather (current & forecast)', color: '#22c55e' },
    { letter: 'F', item: 'Fuel (quantity & plan)', color: '#f97316' },
    { letter: 'T', item: 'Technology (GPS, radios, transponder)', color: '#8b5cf6' },
    { letter: 'A', item: 'Airspace & alternates', color: '#ec4899' },
];

const REGS: { rule: string; detail: string; far: string }[] = [
    { rule: 'NTSB Reporting', detail: 'Must report certain accidents/incidents within 10 days', far: '830.15' },
    { rule: 'Seatbelt Rules', detail: 'Seatbelts required for all occupants. Children under 2 in approved child restraint or held by adult.', far: '91.107' },
    { rule: 'Night Definition', detail: 'Period between end of evening civil twilight and beginning of morning civil twilight', far: '' },
    { rule: 'Right-of-Way', detail: 'Balloon > Glider > Airship > Powered > Other', far: '91.113' },
    { rule: 'Minimum Safe Altitudes', detail: 'Sufficient altitude to make a safe emergency landing. 500ft above surface (congested: 1000ft above highest obstacle within 2000ft)', far: '91.119' },
];

const VFR_CRUISE_ALTITUDES = [
    { heading: '000°-179°', rule: 'Odd thousands + 500', examples: ['3,500', '5,500', '7,500', '9,500', '11,500'], color: '#3b82f6' },
    { heading: '180°-359°', rule: 'Even thousands + 500', examples: ['2,500', '4,500', '6,500', '8,500', '10,500'], color: '#ec4899' },
];

const FLIGHT_PLAN_ELEMENTS = [
    'Type of aircraft', 'Full name of pilot', 'Route of flight', 'Departure point',
    'Destination', 'True airspeed', 'Departure time (proposed & actual)',
    'Altitude (filed)', 'Fuel on board (endurance)', 'Alternate airport',
    'Pilot name, address, and phone', 'Color of aircraft',
];

const LOST_PROCEDURES = [
    { letter: 'C', item: 'Confess', desc: 'Acknowledge the situation. Admit you are lost.', color: '#ef4444' },
    { letter: 'O', item: 'Observe', desc: 'Look for landmarks, rivers, roads, towns.', color: '#f97316' },
    { letter: 'W', item: 'Wise', desc: 'Think clearly. Don\'t let stress take over.', color: '#eab308' },
    { letter: 'S', item: 'Steer', desc: 'Set a heading to a known direction (best-guess outbound course).', color: '#22c55e' },
    { letter: 'E', item: 'Emergency', desc: 'Declare an emergency if necessary. Squawk 7700.', color: '#ef4444' },
];

const MAG_COMPASS_ERRORS = [
    { mnemonic: 'ANDS', desc: 'Accelerate North, Decelerate South', detail: 'During acceleration on E/W heading, compass indicates a turn to the north. During deceleration, it indicates a turn to the south.', color: '#3b82f6' },
    { mnemonic: 'UNOS', desc: 'Undershoot North, Overshoot South', detail: 'When turning from E/W to N, compass lags (undershoots). When turning from E/W to S, compass leads (overshoots).', color: '#ef4444' },
];

const COMMS = [
    { name: 'ATIS', desc: 'Automatic Terminal Information Service — Broadcasts weather, runways in use', color: '#3b82f6' },
    { name: 'AWOS', desc: 'Automated Weather Observing System — Real-time weather at airports', color: '#06b6d4' },
    { name: 'ASOS', desc: 'Automated Surface Observing System — NWS weather observation', color: '#22c55e' },
    { name: 'Ground', desc: 'Ground Control — Manages taxiing aircraft', color: '#8b5cf6' },
    { name: 'Tower', desc: 'Tower Control — Manages runways and traffic in immediate vicinity', color: '#ec4899' },
    { name: 'Approach', desc: 'Approach Control — Manages arriving/departing traffic in terminal area', color: '#f97316' },
    { name: 'Departure', desc: 'Departure Control — Manages departing traffic after takeoff', color: '#eab308' },
    { name: 'Center', desc: 'ARTCC — Manages en route traffic in controlled airspace', color: '#a78bfa' },
];

const LIGHT_GUN_SIGNALS = [
    { signal: 'Steady green', takeoff: 'Cleared for takeoff', landing: 'Cleared to land', ground: 'Cleared to taxi', color: '#22c55e' },
    { signal: 'Flashing green', takeoff: 'Cleared for taxi', landing: 'Return for landing', ground: 'Taxi clear of runway', color: '#22c55e' },
    { signal: 'Steady red', takeoff: 'Give way, continue taxiing', landing: 'Stop', ground: 'Stop', color: '#ef4444' },
    { signal: 'Flashing red', takeoff: 'Taxi clear of runway', landing: 'Airport unsafe, do not land', ground: 'Taxi clear of runway', color: '#ef4444' },
    { signal: 'Flashing white', takeoff: '—', landing: '—', ground: 'Return to starting point', color: '#e2e8f0' },
    { signal: 'Red + Green', takeoff: 'Exercise extreme caution', landing: 'Exercise extreme caution', ground: 'Exercise extreme caution', color: '#eab308' },
];

const XPDR_CODES = [
    { code: '1200', desc: 'VFR', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    { code: '7500', desc: 'Hijacking', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    { code: '7600', desc: 'Communications failure', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
    { code: '7700', desc: 'Emergency', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
];

const SIGNS = [
    { type: 'Mandatory Instruction', color: '#ef4444', bg: 'red', desc: 'Red background, white text. MUST comply.', examples: ['RUNWAY HOLD POSITION', 'DO NOT ENTER', 'STOP'] },
    { type: 'Location', color: '#eab308', bg: 'yellow', desc: 'Yellow background, black text. Shows location.', examples: ['A', 'B', 'C', '5', '23L'] },
    { type: 'Direction', color: '#22c55e', bg: 'green', desc: 'Green background, white text. Points to runway.', examples: ['Runway 23L-05R →'] },
    { type: 'Destination', color: '#3b82f6', bg: 'blue', desc: 'Black background, yellow text. Points to facilities.', examples: ['Terminal', 'FBO', 'Cargo'] },
    { type: 'Information', color: '#94a3b8', bg: 'white', desc: 'White background, black text. General info.', examples: ['Hot Spot 1', 'VFR Chart'] },
];

export const CrossCountry: React.FC = () => {
    const [tab, setTab] = useState<'naefta' | 'regs' | 'nav' | 'plan' | 'radio' | 'signals' | 'signs'>('regs');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '0.3rem' }}>
                    Cross-Country
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Navigation, Planning, Communications & Airport Operations</p>
            </header>

            <div style={{ display: 'flex', gap: '0.25rem', padding: '3px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
                {([
                    ['regs', 'Regulations'], ['naefta', 'Preflight'], ['nav', 'Navigation'],
                    ['plan', 'Flight Plan'], ['radio', 'Comms'], ['signals', 'Signals'], ['signs', 'Signs'],
                ] as const).map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => { sfx.playSelect(); setTab(id); }}
                        onMouseEnter={() => sfx.playHover()}
                        style={{
                            padding: '0.4rem 0.8rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: tab === id ? 700 : 500,
                            background: tab === id ? '#8b5cf6' : 'transparent',
                            color: tab === id ? '#fff' : 'var(--text-secondary)',
                            transition: 'var(--transition)', flexShrink: 0,
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {tab === 'regs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {REGS.map(r => (
                            <div key={r.rule} style={CARD}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>{r.rule}</strong>
                                    {r.far && <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.4rem', borderRadius: '999px', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>FAR {r.far}</span>}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem', margin: '0.3rem 0 0' }}>{r.detail}</p>
                            </div>
                        ))}
                    </div>
                )}
                {tab === 'naefta' && (
                    <div style={CARD}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            NAWFTA — Preflight Checklist
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Click each letter to reveal the item.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                            {NAWFTA.map(n => (
                                <div key={n.letter} style={{ padding: '0.75rem', borderRadius: '10px', background: `${n.color}15`, border: `1px solid ${n.color}40`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: n.color, color: '#fff', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                                        {n.letter}
                                    </span>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500 }}>{n.item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {tab === 'nav' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Navigation Techniques */}
                        <EXPANDABLE title="🧭 Navigation Techniques" icon={<Navigation size={18} />} color="#8b5cf6">
                            <div style={{ marginTop: '0.5rem' }}>
                                <p><strong>Dead Reckoning:</strong> Estimating position based on speed, time, heading, and wind correction.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>Pilotage:</strong> Navigating by reference to visible landmarks.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>VOR Navigation:</strong> Using VOR radials for tracking to/from stations.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>GPS Navigation:</strong> Using satellite-based navigation (WAAS-enabled for LPV approaches).</p>
                            </div>
                        </EXPANDABLE>

                        {/* TC Formula */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                True Course Formula
                            </h3>
                            <div style={{
                                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                                borderRadius: '10px', padding: '1rem', textAlign: 'center', fontFamily: 'monospace', fontSize: '1.1rem',
                                fontWeight: 700, color: '#a78bfa',
                            }}>
                                TC ± Var = MC ± WCA = MH ± Dev = CH
                            </div>
                            <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                                <div><strong>TC</strong> — True Course</div>
                                <div><strong>Var</strong> — Magnetic Variation</div>
                                <div><strong>MC</strong> — Magnetic Course</div>
                                <div><strong>WCA</strong> — Wind Correction Angle</div>
                                <div><strong>MH</strong> — Magnetic Heading</div>
                                <div><strong>Dev</strong> — Compass Deviation</div>
                                <div><strong>CH</strong> — Compass Heading</div>
                            </div>
                        </div>

                        {/* VFR Cruise Altitudes */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                <Compass size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                                VFR Cruising Altitudes
                            </h3>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {VFR_CRUISE_ALTITUDES.map(v => (
                                    <div key={v.heading} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: `${v.color}15`, border: `1px solid ${v.color}40` }}>
                                        <div style={{ fontWeight: 700, color: v.color, marginBottom: '0.3rem' }}>Magnetic Heading {v.heading}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{v.rule}</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            {v.examples.map(e => (
                                                <span key={e} style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: `${v.color}20`, fontSize: '0.72rem', color: v.color, fontWeight: 600 }}>{e}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lost Procedures */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                Lost Procedures — 5 C's
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {LOST_PROCEDURES.map(lp => (
                                    <div key={lp.letter} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: `${lp.color}15`, border: `1px solid ${lp.color}40`, textAlign: 'center' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: lp.color, color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.3rem', fontSize: '1rem' }}>
                                            {lp.letter}
                                        </div>
                                        <div style={{ fontWeight: 700, color: lp.color, fontSize: '0.88rem' }}>{lp.item}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{lp.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Compass Errors */}
                        <EXPANDABLE title="🧭 Magnetic Compass Errors" icon={<Compass size={18} />} color="#ef4444">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {MAG_COMPASS_ERRORS.map(m => (
                                    <div key={m.mnemonic} style={{ padding: '0.5rem', borderRadius: '8px', background: `${m.color}15`, border: `1px solid ${m.color}40` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <strong style={{ color: m.color, fontSize: '1rem', fontFamily: 'monospace' }}>{m.mnemonic}</strong>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{m.desc}</span>
                                        </div>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0' }}>{m.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </EXPANDABLE>

                        {/* GPS/RAIM/WAAS */}
                        <EXPANDABLE title="📡 GPS / RAIM / WAAS" icon={<Navigation size={18} />} color="#06b6d4">
                            <div style={{ marginTop: '0.5rem' }}>
                                <p><strong>GPS:</strong> Global Positioning System — satellite-based navigation. Provides position, groundspeed, track, and time.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>RAIM:</strong> Receiver Autonomous Integrity Monitoring — checks GPS accuracy. Requires 5+ satellites for fault detection, 6+ for fault detection and exclusion.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>WAAS:</strong> Wide Area Augmentation System — provides corrections for GPS errors. Enables LPV approaches with vertical guidance.</p>
                            </div>
                        </EXPANDABLE>
                    </div>
                )}
                {tab === 'plan' && (
                    <div style={CARD}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            VFR Flight Plan Elements
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                            {FLIGHT_PLAN_ELEMENTS.map((el, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                                    <span style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#8b5cf6', color: '#fff', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0 }}>
                                        {i + 1}
                                    </span>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{el}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {tab === 'radio' && (
                    <div style={CARD}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            <Radio size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                            Radio Communications
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                            {COMMS.map(c => (
                                <div key={c.name} style={{ padding: '0.75rem', borderRadius: '10px', background: `${c.color}15`, border: `1px solid ${c.color}40` }}>
                                    <strong style={{ color: c.color, fontSize: '0.95rem' }}>{c.name}</strong>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>{c.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {tab === 'signals' && (
                    <div style={CARD}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            Light Gun Signals
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                            Used when radio communications fail. Signals are given from the control tower.
                        </p>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                        <th style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-primary)' }}>Signal</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Aircraft Airborne</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Landing</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Ground</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {LIGHT_GUN_SIGNALS.map((s, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: s.color, display: 'inline-block', boxShadow: `0 0 6px ${s.color}` }} />
                                                <strong style={{ color: s.color }}>{s.signal}</strong>
                                            </td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{s.takeoff}</td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{s.landing}</td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{s.ground}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {tab === 'signs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={CARD}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                Airport Signs
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {SIGNS.map(s => (
                                    <div key={s.type} style={{ padding: '0.75rem', borderRadius: '10px', background: `${s.color}15`, border: `1px solid ${s.color}40` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                            <strong style={{ color: s.color }}>{s.type}</strong>
                                        </div>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.3rem' }}>{s.desc}</p>
                                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                            {s.examples.map(e => (
                                                <span key={e} style={{
                                                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700,
                                                    background: s.bg === 'red' ? '#ef4444' : s.bg === 'yellow' ? '#eab308' : s.bg === 'green' ? '#22c55e' : s.bg === 'blue' ? '#3b82f6' : '#94a3b8',
                                                    color: s.bg === 'yellow' || s.bg === 'white' ? '#000' : '#fff',
                                                }}>
                                                    {e}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Transponder Codes */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                Transponder Codes
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {XPDR_CODES.map(x => (
                                    <div key={x.code} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: x.bg, border: `1px solid ${x.color}40`, textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: x.color, fontFamily: 'monospace' }}>{x.code}</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{x.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* NOTAMs */}
                        <EXPANDABLE title="📋 NOTAMs" icon={<AlertTriangle size={18} />} color="#f97316">
                            <div style={{ marginTop: '0.5rem' }}>
                                <p><strong>FDC NOTAMs:</strong> Flight Data Center — Regulatory, issued by the FAA.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>NOTAM (D):</strong> Notices to Airmen — General operational information.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>NOTAM (L):</strong> Local — At non-towered airports, issued by flight service.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>TFR:</strong> Temporary Flight Restriction — Created by NOTAM.</p>
                            </div>
                        </EXPANDABLE>
                    </div>
                )}
            </div>
        </div>
    );
};
