import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
                    padding: 'clamp(0.6rem, 2vw, 1rem) clamp(0.75rem, 3vw, 1.25rem)', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{title}</span>
                <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'var(--transition)', color: 'var(--text-secondary)' }} />
            </button>
            {open && (
                <div style={{ padding: '0 clamp(0.75rem, 3vw, 1.25rem) clamp(0.75rem, 3vw, 1.25rem)', borderTop: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    {children}
                </div>
            )}
        </div>
    );
};

const CARD_STYLE: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: 'clamp(0.75rem, 3vw, 1.25rem)',
};

const MEDICAL_DATA = [
    { cls: '1st Class', under40: 12, over40: 6, color: '#ef4444' },
    { cls: '2nd Class', under40: 12, over40: 6, color: '#f97316' },
    { cls: '3rd Class', under40: 60, over40: 24, color: '#eab308' },
    { cls: 'BasicMed', under40: 48, over40: 48, color: '#22c55e' },
];

const MedicalBarChart: React.FC = () => {
    const [hovered, setHovered] = useState<number | null>(null);
    const maxMonths = 60;
    return (
        <div style={{ ...CARD_STYLE, padding: 'clamp(1rem, 4vw, 1.5rem)' }}>
            <h3 style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Medical Certificate Expiration Periods
            </h3>
            <div style={{ display: 'flex', gap: 'clamp(0.75rem, 3vw, 2rem)', marginBottom: '1rem', fontSize: 'clamp(0.6rem, 2vw, 0.75rem)', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-color)' }} /> Under 40
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: '#94a3b8' }} /> Over 40
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {MEDICAL_DATA.map((m, i) => {
                    const u40Width = (m.under40 / maxMonths) * 100;
                    const o40Width = (m.over40 / maxMonths) * 100;
                    return (
                        <div
                            key={m.cls}
                            onMouseEnter={() => { sfx.playHover(); setHovered(i); }}
                            onMouseLeave={() => setHovered(null)}
                            style={{ opacity: hovered !== null && hovered !== i ? 0.5 : 1, transition: 'opacity 0.2s' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                <span style={{ width: 'clamp(50px, 12vw, 70px)', fontSize: 'clamp(0.65rem, 2vw, 0.78rem)', fontWeight: 600, color: m.color, flexShrink: 0 }}>{m.cls}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Under 40: {m.under40}mo</span>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginLeft: 'clamp(50px, 12vw, 70px)' }}>
                                <div style={{ flex: 1, height: '22px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{
                                        width: `${u40Width}%`, height: '100%', background: `linear-gradient(90deg, ${m.color}cc, ${m.color})`,
                                        borderRadius: '4px', transition: 'width 0.6s cubic-bezier(0.25,0.8,0.25,1)',
                                    }} />
                                    <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                                        {m.under40}mo
                                    </span>
                                </div>
                                <div style={{ flex: 1, height: '22px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{
                                        width: `${o40Width}%`, height: '100%', background: `linear-gradient(90deg, ${m.color}88, ${m.color}aa)`,
                                        borderRadius: '4px', transition: 'width 0.6s cubic-bezier(0.25,0.8,0.25,1)',
                                    }} />
                                    <span style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                                        {m.over40}mo
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginLeft: 'clamp(50px, 12vw, 70px)', marginTop: '2px' }}>
                                <span style={{ flex: 1, fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Under 40</span>
                                <span style={{ flex: 1, fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Over 40</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MedicalPrivilegesTable: React.FC = () => {
    const rows = [
        { privilege: 'Act as PIC (non-commercial)', first: true, second: true, third: true, basicmed: true },
        { privilege: 'Carry passengers', first: true, second: true, third: true, basicmed: true },
        { privilege: 'Flight Instructor (with endorsement)', first: true, second: true, third: true, basicmed: false },
        { privilege: 'Commercial operations', first: true, second: true, third: false, basicmed: false },
        { privilege: 'Airline Transport Pilot', first: true, second: false, third: false, basicmed: false },
    ];
    const cell: React.CSSProperties = { padding: '0.5rem 0.6rem', fontSize: '0.78rem', textAlign: 'center', borderBottom: '1px solid var(--glass-border)' };
    const yes = (v: boolean) => v ? <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> : <span style={{ color: '#ef4444', fontWeight: 700 }}>✗</span>;
    return (
        <div style={{ ...CARD_STYLE, padding: 'clamp(0.5rem, 2vw, 1rem)' }}>
            <h3 style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Medical Certificate Privileges
            </h3>
            <div className="ppl-table-scroll">
                <table className="ppl-compact-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                        <th style={{ ...cell, textAlign: 'left', fontWeight: 700 }}>Privilege</th>
                        <th style={{ ...cell, fontWeight: 700, color: '#ef4444' }}>1st</th>
                        <th style={{ ...cell, fontWeight: 700, color: '#f97316' }}>2nd</th>
                        <th style={{ ...cell, fontWeight: 700, color: '#eab308' }}>3rd</th>
                        <th style={{ ...cell, fontWeight: 700, color: '#22c55e' }}>BasicMed</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(r => (
                        <tr key={r.privilege}>
                            <td style={{ ...cell, textAlign: 'left', color: 'var(--text-primary)', fontWeight: 500 }}>{r.privilege}</td>
                            <td style={cell}>{yes(r.first)}</td>
                            <td style={cell}>{yes(r.second)}</td>
                            <td style={cell}>{yes(r.third)}</td>
                            <td style={cell}>{yes(r.basicmed)}</td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
    );
};

export const PilotQualifications: React.FC<{ onBack?: () => void }> = () => {
    const [compareTab, setCompareTab] = useState<'pic' | 'passengers'>('pic');

    const currencyItems = {
        pic: [
            'Flight review (biennial) — FAR 61.56',
            '3 takeoffs and landings in preceding 90 days (night) — FAR 61.57(c)',
            'For hire: 3 takeoffs and landings per 90 calendar days in same category/class/type — FAR 61.57(a)',
            'Instrument privileges: Instrument currency — FAR 61.57(c)',
        ],
        passengers: [
            '3 takeoffs and landings in preceding 90 days — FAR 61.57(a)',
            'Must be in same category and class',
            'To carry passengers at night: 3 full-stop landings at an airport between 1 hour after sunset and 1 hour before sunrise — FAR 61.57(b)',
        ],
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.75rem, 3vw, 1.25rem)' }}>
            <header style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 700, color: '#3b82f6', marginBottom: '0.3rem' }}>
                    Pilot Qualifications
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>FAR Part 61 — Requirements, Privileges & Medical</p>
            </header>

            {/* Requirements */}
            <EXPANDABLE title="📋 Pilot Requirements — FAR 61.103" color="#3b82f6">
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
                    <li>Be at least 17 years old (16 for glider/balloon) — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.103(a)</span></li>
                    <li>Read, speak, write, and understand English — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.103(b)</span></li>
                    <li>Hold at least a 3rd class medical certificate — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.103(c)</span></li>
                    <li>Hold a ground pilot certificate (knowledge test) — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.103(d)</span></li>
                    <li>Receive a logbook endorsement from an authorized instructor</li>
                    <li>Pass the practical test (checkride) — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.103(e)</span></li>
                </ul>
                <p style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Aeronautical Experience — FAR 61.109:</p>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
                    <li>40 hours total time — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.109(a)</span></li>
                    <li>20 hours flight training — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.109(b)</span></li>
                    <li>10 hours solo — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.109(c)</span></li>
                    <li>3 hours night flying — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.109(d)</span></li>
                    <li>3 hours instrument training — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.109(e)</span></li>
                    <li>3 hours test prep with authorized instructor — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.109(f)</span></li>
                    <li>3 hours checkride prep within 2 months — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.109(g)</span></li>
                </ul>
            </EXPANDABLE>

            {/* Privileges */}
            <EXPANDABLE title="✈️ Private Pilot Privileges — FAR 61.113" color="#3b82f6">
                <p style={{ marginBottom: '0.5rem' }}>A private pilot may:</p>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
                    <li>Act as PIC and carry passengers — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.113(a)</span></li>
                    <li>Share operating expenses (pro-rata share only) — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.113(b)</span></li>
                    <li>Operate for charity or humanitarian purposes (not for compensation) — <span style={{ color: '#3b82f6', fontWeight: 600 }}>§61.113(c)</span></li>
                    <li>Search and rescue operations</li>
                </ul>
                <p style={{ marginTop: '0.5rem', color: '#ef4444' }}>❌ Cannot fly for compensation or hire — <span style={{ fontWeight: 600 }}>§61.113(a)</span></p>
            </EXPANDABLE>

            {/* Responsibilities of PIC */}
            <EXPANDABLE title="👨‍✈️ Responsibilities of PIC" color="#3b82f6">
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
                    <li>Final authority and responsibility for operation and safety</li>
                    <li>Determine aircraft is airworthy and properly equipped</li>
                    <li>Ensure compliance with applicable FARs</li>
                    <li>Ensure all required documents are on board</li>
                    <li>Ensure weight and balance limits are not exceeded</li>
                    <li>File a flight plan (IFR), or VFR flight plan recommended</li>
                    <li>Report NTSB accidents within 10 days</li>
                </ul>
            </EXPANDABLE>

            {/* Limitations */}
            <EXPANDABLE title="⚠️ Limitations" color="#3b82f6">
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
                    <li>No operations for compensation or hire</li>
                    <li>No towing (unless appropriate endorsement)</li>
                    <li>No operations in excess of 17,500 lbs (unless endorsement)</li>
                    <li>Must have proper endorsements for complex, high-performance, tailwheel, high-altitude operations</li>
                </ul>
            </EXPANDABLE>

            {/* Currency Comparison */}
            <div style={CARD_STYLE}>
                <h3 style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    Currency Requirements
                </h3>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem', padding: '3px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                    {(['pic', 'passengers'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => { sfx.playSelect(); setCompareTab(tab); }}
                            onMouseEnter={() => sfx.playHover()}
                            style={{
                                flex: 1, padding: 'clamp(0.35rem, 1.5vw, 0.5rem)', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                fontFamily: 'inherit', fontSize: 'clamp(0.7rem, 2vw, 0.82rem)', fontWeight: compareTab === tab ? 700 : 500,
                                background: compareTab === tab ? '#3b82f6' : 'transparent',
                                color: compareTab === tab ? '#fff' : 'var(--text-secondary)',
                                transition: 'var(--transition)',
                            }}
                        >
                            {tab === 'pic' ? 'To Act as PIC' : 'To Carry Passengers'}
                        </button>
                    ))}
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    {currencyItems[compareTab].map((item, i) => (
                        <li key={i} style={{ marginBottom: '0.4rem' }}>{item}</li>
                    ))}
                </ul>
            </div>

            {/* Medical Certificates */}
            <div style={{ ...CARD_STYLE, padding: 'clamp(0.75rem, 3vw, 1.25rem)' }}>
                <p style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Medical certificates required per <span style={{ color: '#3b82f6', fontWeight: 600 }}>FAR 61.23</span>. BasicMed alternative per <span style={{ color: '#3b82f6', fontWeight: 600 }}>FAR Part 68</span>.
                </p>
            </div>
            <MedicalBarChart />
            <MedicalPrivilegesTable />

            {/* Special Endorsements */}
            <EXPANDABLE title="🏅 Special Endorsements" color="#3b82f6">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {[
                        { name: 'Tailwheel', desc: 'Endorsement for tailwheel-equipped aircraft (FAR 61.31(i))' },
                        { name: 'Complex', desc: 'Aircraft with retractable gear, flaps, and controllable-pitch prop (FAR 61.31(e))' },
                        { name: 'High Performance', desc: 'Aircraft with >200 HP engine (FAR 61.31(f))' },
                        { name: 'High Altitude', desc: 'Pressurized aircraft above 25,000 ft MSL (FAR 61.31(g))' },
                    ].map(e => (
                        <div key={e.name} style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                            <strong style={{ color: '#3b82f6' }}>{e.name}</strong>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>{e.desc}</p>
                        </div>
                    ))}
                </div>
            </EXPANDABLE>

            {/* BasicMed, Special Issuance, SODA */}
            <EXPANDABLE title="💊 BasicMed & Special Issuance" color="#3b82f6">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                        <strong style={{ color: '#22c55e' }}>BasicMed</strong>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                            Allows pilots to fly without an FAA medical certificate if they have a state-issued driver's license, completed a medical education course, and have a physician's examination every 48 months. Limits: aircraft with ≤6 seats, ≤6 occupants, ≤6,000 lbs, non-turbine. — <span style={{ color: '#3b82f6', fontWeight: 600 }}>FAR Part 68</span>
                        </p>
                    </div>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)' }}>
                        <strong style={{ color: '#a78bfa' }}>Special Issuance</strong>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                            Authorization from the FAA allowing a pilot with a medical condition to fly when an AME cannot issue a medical certificate. Requires FAA review and approval.
                        </p>
                    </div>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)' }}>
                        <strong style={{ color: '#38bdf8' }}>Statement of Demonstrated Ability (SODA)</strong>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                            An alternative to a medical certificate for pilots with certain disqualifying conditions. Based on demonstrated ability to safely perform airman duties.
                        </p>
                    </div>
                </div>
            </EXPANDABLE>

            {/* Key FAR References */}
            <EXPANDABLE title="📚 Key FAR References" color="#3b82f6">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {[
                        { far: '§61.21', desc: 'Currency requirements' },
                        { far: '§61.23', desc: 'Medical certificates required' },
                        { far: '§61.56', desc: 'Flight review (biennial)' },
                        { far: '§61.57', desc: 'Recent experience' },
                        { far: '§61.103–109', desc: 'PPL requirements' },
                        { far: '§61.113', desc: 'Private pilot privileges and limitations' },
                        { far: '§68', desc: 'BasicMed' },
                        { far: '§91.103', desc: 'Preflight action' },
                        { far: '§91.107', desc: 'Seatbelts' },
                        { far: '§91.111', desc: 'Operating near other aircraft' },
                        { far: '§91.113', desc: 'Right-of-way' },
                        { far: '§91.117', desc: 'Speed limits' },
                        { far: '§91.119', desc: 'Minimum safe altitudes' },
                        { far: '§91.126–131', desc: 'Airspace operations' },
                        { far: '§91.141', desc: 'Flight restrictions' },
                        { far: '§91.151', desc: 'Fuel requirements (VFR)' },
                        { far: '§91.155', desc: 'VFR weather minimums' },
                        { far: '§91.159', desc: 'VFR cruising altitudes' },
                        { far: '§91.169', desc: 'IFR fuel requirements' },
                        { far: '§91.173', desc: 'ATC clearance (IFR)' },
                        { far: '§91.203', desc: 'Required documents' },
                        { far: '§91.205', desc: 'Required instruments and equipment' },
                        { far: '§91.207', desc: 'ELT' },
                        { far: '§91.211', desc: 'Supplemental oxygen' },
                        { far: '§91.213', desc: 'Inoperative equipment' },
                        { far: '§91.225', desc: 'ADS-B Out' },
                    ].map(r => (
                        <div key={r.far} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: 'clamp(0.72rem, 2vw, 0.82rem)', flexShrink: 0, minWidth: 'clamp(60px, 15vw, 90px)' }}>{r.far}</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.72rem, 2vw, 0.82rem)' }}>{r.desc}</span>
                        </div>
                    ))}
                </div>
            </EXPANDABLE>
        </div>
    );
};
