import React from 'react';
import { Fuel, Weight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { sfx } from '../../utils/sfx';
import { C172, UnitSystem, u } from './c172Data';

const WT_MIN = 0;
const WT_MAX = 2700;
const pct = (w: number) => ((w - WT_MIN) / (WT_MAX - WT_MIN)) * 100;

interface Props { units: UnitSystem; }

export const FuelWeightPanel: React.FC<Props> = ({ units }) => {
    const [galPerTank, setGalPerTank] = React.useState<number>(26.5);
    const [pilotPax, setPilotPax] = React.useState<number>(400);
    const [baggage, setBaggage] = React.useState<number>(20);

    const totalFuelGal = galPerTank * 2;
    const usablePerTank = Math.max(0, galPerTank - C172.fuel.unusablePerTank);
    const usableTotal = usablePerTank * 2;

    const fuelWeightLb = totalFuelGal * C172.fuel.lbPerGallon;
    const rampWeightLb = C172.weights.standardEmpty + fuelWeightLb + pilotPax + baggage;

    const displayWeight = units === 'metric' ? Math.round(rampWeightLb * 0.4536) : Math.round(rampWeightLb);
    const weightUnit = units === 'metric' ? 'kg' : 'lb';
    const limitRamp = units === 'metric' ? Math.round(C172.weights.rampNormal * 0.4536) : C172.weights.rampNormal;
    const limitTOLanding = units === 'metric' ? Math.round(C172.weights.takeoffNormal * 0.4536) : C172.weights.takeoffNormal;

    const status = rampWeightLb > C172.weights.rampNormal
        ? { color: '#ef4444', text: `OVER max ramp weight (${limitRamp} ${weightUnit})` }
        : rampWeightLb > C172.weights.takeoffNormal
            ? { color: '#f59e0b', text: `Above normal takeoff weight (${limitTOLanding} ${weightUnit}) — burn fuel before takeoff` }
            : { color: '#10b981', text: 'Within normal category limits' };

    const num = (v: number) => Math.round(v * 10) / 10;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* FUEL */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>
                        <Fuel size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Fuel System</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Approved: {C172.fuel.grades.join(' · ')}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Capacity</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{u.gal(C172.fuel.total, units)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{u.galPerTank(C172.fuel.totalPerTank, units)} per tank</div>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Usable (all conditions)</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981' }}>{u.gal(C172.fuel.usable, units)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{u.galPerTank(C172.fuel.usablePerTank, units)} per tank</div>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Unusable</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ef4444' }}>{u.gal(C172.fuel.unusable, units)}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{u.galPerTank(C172.fuel.unusablePerTank, units)} per tank</div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 600 }}>Fuel in each tank</span>
                    <span style={{ fontWeight: 700, color: '#06b6d4' }}>{u.galPerTank(num(galPerTank), units)} / tank</span>
                </div>
                <input type="range" min={0} max={28} step={0.5} value={galPerTank} onChange={(e) => { setGalPerTank(parseFloat(e.target.value)); sfx.playSelect(); }} style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }} />

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Onboard:</span> <strong>{u.gal(num(totalFuelGal), units)}</strong></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Usable:</span> <strong style={{ color: '#10b981' }}>{u.gal(num(usableTotal), units)}</strong></div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Unusable:</span> <strong style={{ color: '#ef4444' }}>{u.gal(num(C172.fuel.unusable), units)}</strong></div>
                </div>
            </div>

            {/* WEIGHT */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>
                        <Weight size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Weight Calculator</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Empty {u.lb(C172.weights.standardEmpty, units)} + fuel × {C172.fuel.lbPerGallon} lb/gal + pilot/passengers + baggage
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Pilot & Passengers ({u.lbUnit(units)})</label>
                        <input type="number" min={0} max={900} value={pilotPax} onChange={(e) => { setPilotPax(Math.max(0, parseInt(e.target.value || '0', 10))); sfx.playSelect(); }} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(2,6,23,0.6)', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Baggage ({u.lbUnit(units)})</label>
                        <input type="number" min={0} max={200} value={baggage} onChange={(e) => { setBaggage(Math.max(0, parseInt(e.target.value || '0', 10))); sfx.playSelect(); }} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(2,6,23,0.6)', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                    </div>
                    <div>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>Fuel ({u.galUnit(units)} / tank)</label>
                        <input type="number" min={0} max={28} step={0.5} value={num(galPerTank)} onChange={(e) => { const v = Math.max(0, Math.min(28, parseFloat(e.target.value || '0'))); setGalPerTank(v); sfx.playSelect(); }} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(2,6,23,0.6)', color: 'var(--text-primary)', fontFamily: 'inherit' }} />
                    </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ position: 'relative', height: '26px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct(2200)}%`, width: `${pct(2450) - pct(2200)}%`, background: 'rgba(16,185,129,0.45)' }} />
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct(2450)}%`, width: `${pct(2457) - pct(2450)}%`, background: 'rgba(245,158,11,0.55)' }} />
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct(2457)}%`, width: `${pct(2700) - pct(2457)}%`, background: 'rgba(239,68,68,0.45)' }} />
                        <div style={{ position: 'absolute', top: -4, bottom: -4, left: `${pct(rampWeightLb)}%`, transform: 'translateX(-50%)', width: '5px', background: '#fff', boxShadow: `0 0 10px ${status.color}`, transition: 'left 0.15s ease', zIndex: 2 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        <span>{units === 'metric' ? '998 kg util' : '2200 util'}</span>
                        <span>{units === 'metric' ? '1111 kg T/O' : '2450 T/O'}</span>
                        <span>{units === 'metric' ? '1114 kg ramp' : '2457 ramp'}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>{displayWeight} <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{weightUnit} ramp weight</span></span>
                    <span className="chip" style={{ background: `${status.color}22`, color: status.color, borderColor: `${status.color}66`, padding: '0.45rem 0.9rem' }}>
                        {status.text.includes('OVER') ? <AlertTriangle size={13} style={{ marginRight: '0.3rem' }} /> : <CheckCircle2 size={13} style={{ marginRight: '0.3rem' }} />}
                        {status.text}
                    </span>
                </div>
            </div>
        </div>
    );
};
