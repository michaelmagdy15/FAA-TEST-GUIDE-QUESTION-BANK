import React, { useMemo } from 'react';
import { sfx } from '../../utils/sfx';
import { AIRSPEED_BANDS, V_SPEEDS, OPERATIONAL_SPEEDS, UnitSystem, u } from './c172Data';

const SCALE_MIN = 20;
const SCALE_MAX = 170;

const pct = (s: number) => ((s - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

interface Props { units: UnitSystem; }

export const VSpeedExplorer: React.FC<Props> = ({ units }) => {
    const [selected, setSelected] = React.useState<string>('VNE');

    const current = useMemo(() => V_SPEEDS.find((v) => v.symbol === selected) || V_SPEEDS[0], [selected]);

    return (
        <div>
            {/* Scale bar */}
            <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <span>{u.knots(SCALE_MIN, units)}</span>
                    <span className="chip">{u.knotsLabel(units)} Scale</span>
                    <span>{u.knots(SCALE_MAX, units)}</span>
                </div>
                <div style={{ position: 'relative', height: '34px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    {AIRSPEED_BANDS.map((b) => (
                        <div key={b.label} style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct(b.min)}%`, width: `${pct(b.max) - pct(b.min)}%`, background: b.color, opacity: 0.85 }} />
                    ))}
                    {V_SPEEDS.map((v) => (
                        <div key={v.symbol} onClick={() => { setSelected(v.symbol); sfx.playHover(); }} onMouseEnter={() => sfx.playHover()} style={{ position: 'absolute', top: -5, left: `${pct(v.marker)}%`, transform: 'translateX(-50%)', cursor: 'pointer', zIndex: 2 }} title={`${v.symbol} ${u.knots(v.kias, units)}`}>
                            <div style={{ width: '3px', height: '44px', background: selected === v.symbol ? '#fff' : 'rgba(0,0,0,0.85)', boxShadow: selected === v.symbol ? '0 0 10px rgba(255,255,255,0.8)' : 'none', transition: 'var(--transition)', borderRadius: 2 }} />
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                    <span style={{ marginLeft: '5%' }}>{units === 'metric' ? '61' : '33'}</span>
                    <span style={{ marginLeft: '15%' }}>{units === 'metric' ? '81' : '44'}</span>
                    <span style={{ marginLeft: '35%' }}>{units === 'metric' ? '157' : '85'}</span>
                    <span style={{ marginLeft: '16%' }}>{units === 'metric' ? '239' : '129'}</span>
                    <span style={{ marginLeft: '16%' }}>{units === 'metric' ? '302' : '163'}</span>
                </div>
            </div>

            {/* Selected V-speed detail */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #06b6d4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: '#06b6d4', lineHeight: 1 }}>{current.symbol}</span>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontWeight: 600 }}>{current.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {u.knots(current.kias, units)}{current.kcas !== undefined ? ` · ${u.knots(current.kcas, units).replace('KIAS', 'KCAS')}` : ''}
                        </div>
                    </div>
                    <div style={{ flexBasis: '100%', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{current.note}</div>
                </div>
            </div>

            {/* V-speed cards grid */}
            <div className="grid">
                {V_SPEEDS.map((v) => (
                    <div key={v.symbol} className="glass-card topic-card animate-in" onClick={() => { setSelected(v.symbol); sfx.playSelect(); }} onMouseEnter={() => sfx.playHover()} style={{ padding: '1.25rem', cursor: 'pointer', borderColor: selected === v.symbol ? '#06b6d4' : 'var(--glass-border)', boxShadow: selected === v.symbol ? '0 0 20px rgba(6,182,212,0.15)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#06b6d4' }}>{v.symbol}</span>
                            <span className="chip">{u.knots(v.kias, units)}</span>
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.4rem' }}>{v.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{v.note}</div>
                    </div>
                ))}
            </div>

            {/* Operational Speeds Reference */}
            <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                    <span className="chip" style={{ fontSize: '0.9rem' }}>Operational Speeds</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Based on 2450 lb max weight (checklist reference)</span>
                </div>
                {Object.entries(OPERATIONAL_SPEEDS.reduce<Record<string, typeof OPERATIONAL_SPEEDS>>((acc, op) => { (acc[op.category] ??= []).push(op); return acc; }, {})).map(([cat, speeds]) => (
                    <div key={cat} className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', color: '#06b6d4' }}>{cat}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {speeds.map((op) => (
                                <div key={op.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', padding: '0.35rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{op.label}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', flexShrink: 0 }}>
                                        {cat === 'Crosswind' ? `${u.knotsPlain(parseInt(op.kias), units)} ${u.knotsLabel(units)}` : op.kias.includes('–') ? `${u.knotsPlain(parseInt(op.kias.split('–')[0]), units)}–${u.knotsPlain(parseInt(op.kias.split('–')[1]), units)} ${u.knotsLabel(units)}` : `${u.knotsPlain(parseInt(op.kias), units)} ${u.knotsLabel(units)}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
