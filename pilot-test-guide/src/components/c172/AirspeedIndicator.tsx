import React, { useMemo } from 'react';
import { sfx } from '../../utils/sfx';
import { AIRSPEED_BANDS, BAND_SPEEDS, C172, UnitSystem, u } from './c172Data';

const CX = 130;
const CY = 130;

const angleFor = (s: number) => -120 + ((s - 20) / 150) * 240;

const polarPoint = (r: number, angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
};

const bandPath = (r: number, a1: number, a2: number) => {
    const start = polarPoint(r, a1);
    const end = polarPoint(r, a2);
    const large = a2 - a1 > 180 ? 1 : 0;
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
};

const TICKS: number[] = [];
for (let s = 20; s <= 160; s += 20) TICKS.push(s);

const MINOR_TICKS: number[] = [];
for (let s = 20; s <= 170; s += 10) MINOR_TICKS.push(s);

interface Props { units: UnitSystem; }

export const AirspeedIndicator: React.FC<Props> = ({ units }) => {
    const [speed, setSpeed] = React.useState<number>(99);

    const activeBand = useMemo(
        () => AIRSPEED_BANDS.find((b) => speed >= b.min && speed < b.max) || AIRSPEED_BANDS[0],
        [speed]
    );

    const needleAngle = angleFor(Math.min(speed, C172.airspeedMax));
    const needleTip = polarPoint(72, needleAngle);
    const needleTail = polarPoint(-18, needleAngle);

    const presets = BAND_SPEEDS;
    const displaySpeed = units === 'metric' ? Math.round(speed * 1.852) : speed;
    const speedUnit = units === 'metric' ? 'km/h' : 'KIAS';

    return (
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Gauge */}
            <div style={{ width: 'min(100%, 360px)', flexShrink: 0 }}>
                <svg viewBox="0 0 260 260" style={{ width: '100%', height: 'auto', display: 'block' }}>
                    <circle cx={CX} cy={CY} r="118" fill="var(--glass-bg)" stroke="var(--glass-border)" strokeWidth="3" />
                    <circle cx={CX} cy={CY} r="110" fill="rgba(2,6,23,0.85)" />

                    {AIRSPEED_BANDS.map((b) => {
                        const active = b === activeBand;
                        return (
                            <path key={b.label} d={bandPath(94, angleFor(b.min), angleFor(b.max))} fill="none" stroke={b.color} strokeWidth="12" strokeLinecap="butt" opacity={active ? 1 : 0.28} style={{ filter: active ? `drop-shadow(0 0 8px ${b.color})` : 'none', transition: 'all 0.25s ease' }} />
                        );
                    })}

                    {MINOR_TICKS.map((s) => {
                        const isMajor = s % 20 === 0;
                        const a = angleFor(s);
                        const p1 = polarPoint(isMajor ? 104 : 108, a);
                        const p2 = polarPoint(isMajor ? 111 : 111, a);
                        return <line key={`t${s}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--text-secondary)" strokeWidth={isMajor ? 2.5 : 1} opacity={isMajor ? 0.9 : 0.5} />;
                    })}
                    {TICKS.map((s) => {
                        const a = angleFor(s);
                        const p = polarPoint(78, a);
                        const label = units === 'metric' ? Math.round(s * 1.852) : s;
                        return (
                            <text key={`l${s}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fill="var(--text-primary)" fontSize="11" fontWeight="600">
                                {label}
                            </text>
                        );
                    })}

                    <line x1={polarPoint(60, angleFor(C172.vne)).x} y1={polarPoint(60, angleFor(C172.vne)).y} x2={polarPoint(104, angleFor(C172.vne)).x} y2={polarPoint(104, angleFor(C172.vne)).y} stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />

                    {(() => {
                        const a = angleFor(60);
                        return <g><line x1={polarPoint(60, a).x} y1={polarPoint(60, a).y} x2={polarPoint(104, a).x} y2={polarPoint(104, a).y} stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 3" opacity={0.7} /><text x={polarPoint(68, a).x} y={polarPoint(68, a).y} textAnchor="middle" dominantBaseline="central" fill="#06b6d4" fontSize="8" fontWeight="700" opacity={0.9}>VX</text></g>;
                    })()}

                    {(() => {
                        const a = angleFor(79);
                        return <g><line x1={polarPoint(60, a).x} y1={polarPoint(60, a).y} x2={polarPoint(104, a).x} y2={polarPoint(104, a).y} stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 3" opacity={0.7} /><text x={polarPoint(68, a).x} y={polarPoint(68, a).y} textAnchor="middle" dominantBaseline="central" fill="#06b6d4" fontSize="8" fontWeight="700" opacity={0.9}>VY</text></g>;
                    })()}

                    <g style={{ transition: 'transform 0.15s ease' }}>
                        <line x1={needleTail.x} y1={needleTail.y} x2={needleTip.x} y2={needleTip.y} stroke={activeBand.color} strokeWidth="5" strokeLinecap="round" />
                        <circle cx={CX} cy={CY} r="10" fill="var(--text-primary)" stroke="var(--bg-color)" strokeWidth="3" />
                    </g>
                </svg>
            </div>

            {/* Control + info panel */}
            <div style={{ flex: 1, minWidth: '280px', maxWidth: '460px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span className="chip" style={{ fontSize: '0.9rem' }}>Airspeed Indicator</span>
                    <span style={{ fontSize: '2.2rem', fontWeight: 700, color: activeBand.color, lineHeight: 1 }}>
                        {displaySpeed}
                        <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>{speedUnit}</span>
                    </span>
                </div>

                <input type="range" min={20} max={C172.vne} step={1} value={speed} onChange={(e) => { setSpeed(parseInt(e.target.value, 10)); sfx.playSelect(); }} style={{ width: '100%', accentColor: activeBand.color, cursor: 'pointer' }} />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1rem 0 1.25rem' }}>
                    {presets.map((p) => (
                        <button key={p.kias + p.label} onClick={() => { setSpeed(p.kias); sfx.playHover(); }} onMouseEnter={() => sfx.playHover()} style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: speed === p.kias ? 'var(--accent-soft)' : 'var(--glass-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', transition: 'var(--transition)', borderColor: speed === p.kias ? '#06b6d4' : 'var(--glass-border)' }}>
                            <strong>{p.label}</strong> {units === 'metric' ? Math.round(p.kias * 1.852) : p.kias}
                        </button>
                    ))}
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', borderColor: activeBand.color, borderLeft: `4px solid ${activeBand.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                        <span style={{ width: '14px', height: '14px', borderRadius: '4px', background: activeBand.color, flexShrink: 0 }} />
                        <strong style={{ color: activeBand.color }}>{activeBand.label}</strong>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>({u.knots(activeBand.min, units)}–{u.knots(activeBand.max, units)})</span>
                    </div>
                    <p style={{ lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>{activeBand.desc}</p>
                </div>
            </div>
        </div>
    );
};
