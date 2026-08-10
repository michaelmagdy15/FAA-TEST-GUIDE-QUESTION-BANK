import React, { useState } from 'react';
import { ChevronDown, Shield, Map, AlertTriangle, Radio, Plane } from 'lucide-react';
import { sfx } from '../../../utils/sfx';

const CARD: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '1.25rem',
};

const EXPANDABLE: React.FC<{ title: string; icon?: React.ReactNode; color?: string; children: React.ReactNode }> = ({ title, icon, color = '#ec4899', children }) => {
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

const AIRSPACE_CLASSES = [
    { class: 'A', name: 'Class A', description: '18,000-60,000 ft MSL. IFR only. ATC clearance required.', color: '#ef4444', shape: 'solid' },
    { class: 'B', name: 'Class B', description: 'Major airports. 3 rings. ATC clearance required. Mode C + ADS-B.', color: '#3b82f6', shape: 'solid' },
    { class: 'C', name: 'Class C', description: 'Busy airports. 2 rings. 2-way radio + Mode C. Contact approach before entering.', color: '#22c55e', shape: 'dashed' },
    { class: 'D', name: 'Class D', description: 'Towered airports. 2-way radio. Contact tower.', color: '#eab308', shape: 'dashed' },
    { class: 'E', name: 'Class E', description: 'Controlled airspace not A/B/C/D. VFR weather minimums apply.', color: '#a78bfa', shape: 'dashed-outer' },
    { class: 'G', name: 'Class G', description: 'Uncontrolled airspace. No ATC service.', color: '#94a3b8', shape: 'none' },
    { class: 'F', name: 'Class F', description: 'Not used in U.S. airspace.', color: '#64748b', shape: 'none' },
];

const AIRSPACE_ENTRY: { class: string; reqs: string[]; color: string }[] = [
    { class: 'A', reqs: ['IFR clearance', 'IFR flight plan'], color: '#ef4444' },
    { class: 'B', reqs: ['ATC clearance', 'VFR or IFR flight plan'], color: '#3b82f6' },
    { class: 'C', reqs: ['Two-way radio', 'Mode C transponder', 'Contact approach before entering'], color: '#22c55e' },
    { class: 'D', reqs: ['Two-way radio', 'Contact tower'], color: '#eab308' },
    { class: 'E', reqs: ['VFR weather minimums'], color: '#a78bfa' },
    { class: 'G', reqs: ['None'], color: '#94a3b8' },
];

const VFR_WEATHER_MINS = [
    { class: 'A', clear: '—', cloud: '—', visibility: '—', note: 'IFR only' },
    { class: 'B', clear: '3 SM', cloud: 'Clear of clouds', visibility: '3 SM', note: 'SVFR allowed' },
    { class: 'C', clear: '3 SM', cloud: '500 below, 1000 above, 2000 horiz', visibility: '3 SM', note: '' },
    { class: 'D', clear: '3 SM', cloud: '500 below, 1000 above, 2000 horiz', visibility: '3 SM', note: '' },
    { class: 'E (<10k)', clear: '3 SM', cloud: '500 below, 1000 above, 2000 horiz', visibility: '3 SM', note: '' },
    { class: 'E (≥10k)', clear: '5 SM', cloud: '1000 below, 1000 above, 1 SM horiz', visibility: '5 SM', note: '' },
    { class: 'G (day ≤1200)', clear: 'SM', cloud: 'Clear of clouds', visibility: 'SM', note: 'Special rules' },
    { class: 'G (night)', clear: '3 SM', cloud: '500 below, 1000 above, 2000 horiz', visibility: '3 SM', note: '' },
];

const SPECIAL_USE: { name: string; code: string; color: string; desc: string; symbol: string }[] = [
    { name: 'MOA', code: 'Military Operations Area', color: '#f97316', desc: 'Military training. VFR traffic should exercise extreme caution.', symbol: ' MOA ' },
    { name: 'Alert', code: 'Alert Area', color: '#eab308', desc: 'High volume of pilot training or unusual aerial activity.', symbol: ' ALERT ' },
    { name: 'Prohibited', code: 'Prohibited Area', color: '#ef4444', desc: 'Entry prohibited. National security.', symbol: ' P-## ' },
    { name: 'Restricted', code: 'Restricted Area', color: '#ef4444', desc: 'Hazardous activities. Requires ATC authorization.', symbol: ' R-## ' },
    { name: 'Warning', code: 'Warning Area', color: '#f97316', desc: 'Over water, potential hazard to non-participating aircraft.', symbol: ' W-## ' },
    { name: 'NSA', code: 'National Security Area', color: '#ef4444', desc: 'Flight is prohibited without authorization from US Secret Service.', symbol: ' NSA ' },
];

const OTHER_AIRSPACE: { name: string; desc: string; color: string }[] = [
    { name: 'VFR Flyway', desc: 'Parallel to busy corridors. Recommended VFR route.', color: '#22c55e' },
    { name: 'VFR Corridor', desc: 'Through Class B airspace. No ATC service.', color: '#3b82f6' },
    { name: 'Class B Transition Route', desc: 'Corridor through Class B for VFR.', color: '#06b6d4' },
    { name: 'MTR (Military Training Route)', desc: 'Low-level military routes. IFR or VFR.', color: '#f97316' },
    { name: 'TRSA', desc: 'Terminal Radar Service Area. Radar service recommended.', color: '#8b5cf6' },
    { name: 'ADIZ', desc: 'Air Defense Identification Zone. Flight plan required.', color: '#ef4444' },
    { name: 'SFRA', desc: 'Special Flight Rules Area. Flight plan required.', color: '#ef4444' },
    { name: 'TFR', desc: 'Temporary Flight Restriction. Check NOTAMs.', color: '#ef4444' },
];

const SECTIONAL_READING = [
    { label: 'CT', desc: 'Control tower frequency (black)', color: 'var(--text-primary)' },
    { label: 'ATIS', desc: 'Automatic Terminal Information Service', color: '#06b6d4' },
    { label: 'Elev', desc: 'Field elevation in feet MSL', color: '#f97316' },
    { label: 'Lighting', desc: 'L = lighting, L* = best lighting', color: '#eab308' },
    { label: 'Rwy', desc: 'Runway length (hundreds of feet)', color: '#22c55e' },
    { label: 'UNICOM', desc: 'Unicom frequency', color: '#a78bfa' },
    { label: 'RP', desc: 'Right-hand traffic pattern', color: '#ec4899' },
];

export const Airspace: React.FC = () => {
    const [tab, setTab] = useState<'classes' | 'vfr' | 'special' | 'other' | 'sectional'>('classes');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ec4899', marginBottom: '0.3rem' }}>
                    Airspace
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Airspace Classes, Special Use, and Sectional Charts</p>
            </header>

            <div style={{ display: 'flex', gap: '0.25rem', padding: '3px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
                {([
                    ['classes', 'Classes'], ['vfr', 'VFR Mins'], ['special', 'Special Use'],
                    ['other', 'Other'], ['sectional', 'Sectional'],
                ] as const).map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => { sfx.playSelect(); setTab(id); }}
                        onMouseEnter={() => sfx.playHover()}
                        style={{
                            padding: '0.4rem 0.8rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: tab === id ? 700 : 500,
                            background: tab === id ? '#ec4899' : 'transparent',
                            color: tab === id ? '#fff' : 'var(--text-secondary)',
                            transition: 'var(--transition)', flexShrink: 0,
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {tab === 'classes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* Airspace Class Circles (PDF visual) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                            {AIRSPACE_CLASSES.map(a => (
                                <div key={a.class} style={{ padding: '1rem', borderRadius: '12px', background: `${a.color}15`, border: `1px solid ${a.color}40`, textAlign: 'center' }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 0.5rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: `3px solid ${a.color}`, background: `${a.color}20`,
                                        fontSize: '1.5rem', fontWeight: 800, color: a.color,
                                    }}>
                                        {a.class}
                                    </div>
                                    <div style={{ fontWeight: 700, color: a.color, fontSize: '0.88rem' }}>{a.name}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{a.description}</div>
                                </div>
                            ))}
                        </div>

                        {/* Airspace Entry Requirements */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                Airspace VFR Entry Requirements
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                                {AIRSPACE_ENTRY.map(a => (
                                    <div key={a.class} style={{ padding: '0.75rem', borderRadius: '10px', background: `${a.color}15`, border: `1px solid ${a.color}40` }}>
                                        <div style={{ fontWeight: 700, color: a.color, marginBottom: '0.3rem' }}>Class {a.class}</div>
                                        <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.78rem' }}>
                                            {a.reqs.map((r, i) => <li key={i} style={{ color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>{r}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mode C and ADS-B */}
                        <EXPANDABLE title="📡 Mode C & ADS-B Required" icon={<Shield size={18} />} color="#3b82f6">
                            <div style={{ marginTop: '0.5rem' }}>
                                <p><strong>Mode C:</strong> Required within Class A, B, and C airspace; and above Class B/C airspace up to 10,000 ft MSL.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>ADS-B Out:</strong> Required in all airspace where Mode C is required, plus Class E above 10,000 ft MSL (except below 2,500 AGL within 20 NM of airport), and Class A.</p>
                            </div>
                        </EXPANDABLE>

                        {/* Speed Limits */}
                        <EXPANDABLE title="⚡ Speed Limits" icon={<AlertTriangle size={18} />} color="#eab308">
                            <div style={{ marginTop: '0.5rem' }}>
                                <p><strong>250 KIAS:</strong> Below 10,000 ft MSL</p>
                                <p style={{ marginTop: '0.3rem' }}><strong>200 KIAS:</strong> In Class B airspace, at or below 2,500 ft AGL within 4 NM of airport</p>
                                <p style={{ marginTop: '0.3rem' }}><strong>150 KIAS:</strong> In Class D airspace, at or below 2,500 ft AGL within 4 NM</p>
                                <p style={{ marginTop: '0.3rem' }}><strong>150 KIAS:</strong> In VFR traffic patterns at airports</p>
                            </div>
                        </EXPANDABLE>

                        {/* SVFR */}
                        <EXPANDABLE title="✈️ Special VFR (SVFR)" icon={<Plane size={18} />} color="#06b6d4">
                            <p style={{ marginTop: '0.5rem' }}>
                                SVFR allows VFR flight in controlled airspace when VFR weather minimums are not met. Requires:
                            </p>
                            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                                <li>Pilot must hold at least a private pilot certificate</li>
                                <li>Aircraft must be equipped for IFR or have a weather service</li>
                                <li>Must remain clear of clouds</li>
                                <li>Not available in Class A airspace</li>
                                <li>SVFR not available at night unless certain conditions are met</li>
                            </ul>
                        </EXPANDABLE>

                        {/* MEF */}
                        <EXPANDABLE title="📊 Maximum Elevation Figure (MEF)" icon={<Map size={18} />} color="#a78bfa">
                            <p style={{ marginTop: '0.5rem' }}>
                                MEF is the highest feature (terrain or obstruction) within a quadrangle on sectional charts, rounded up to the nearest 100 ft, then plus 200 ft for obstacle clearance. Found in the corner of each quadrangle.
                            </p>
                        </EXPANDABLE>
                    </div>
                )}
                {tab === 'vfr' && (
                    <div style={CARD}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            VFR Weather Minimums
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                        <th style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-primary)' }}>Class</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Clear of Clouds</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Cloud Clearance</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Visibility</th>
                                        <th style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {VFR_WEATHER_MINS.map((v, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '0.5rem', fontWeight: 700, color: '#3b82f6' }}>{v.class}</td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{v.clear}</td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{v.cloud}</td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{v.visibility}</td>
                                            <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{v.note}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {tab === 'special' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
                            {SPECIAL_USE.map(s => (
                                <div key={s.name} style={{ ...CARD, border: `1px solid ${s.color}40`, padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                        <strong style={{ color: s.color, fontSize: '1rem' }}>{s.name}</strong>
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{s.code}</div>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>{s.desc}</p>
                                    {/* Chart symbol representation */}
                                    <div style={{ marginTop: '0.5rem', padding: '0.3rem 0.5rem', borderRadius: '4px', border: `1px dashed ${s.color}`, color: s.color, fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, display: 'inline-block' }}>
                                        {s.symbol}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {tab === 'other' && (
                    <div style={CARD}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            Other Airspace Areas
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                            {OTHER_AIRSPACE.map(o => (
                                <div key={o.name} style={{ padding: '0.75rem', borderRadius: '10px', background: `${o.color}15`, border: `1px solid ${o.color}40` }}>
                                    <strong style={{ color: o.color, fontSize: '0.88rem' }}>{o.name}</strong>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>{o.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {tab === 'sectional' && (
                    <div style={CARD}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            Sectional Chart — Airport Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                            {SECTIONAL_READING.map(s => (
                                <div key={s.label} style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)' }}>
                                    <strong style={{ color: '#ec4899', fontFamily: 'monospace' }}>{s.label}</strong>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
