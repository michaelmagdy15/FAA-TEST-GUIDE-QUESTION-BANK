import React, { useMemo } from 'react';
import { Cog, AlertTriangle, ShieldCheck, Gauge as GaugeIcon } from 'lucide-react';
import { sfx } from '../../utils/sfx';
import { C172, POWERPLANT_GAUGES, Gauge, UnitSystem, u } from './c172Data';

interface GaugeRowProps {
    spec: Gauge;
    units: UnitSystem;
}

const GaugeRow: React.FC<GaugeRowProps> = ({ spec, units }) => {
    const [value, setValue] = React.useState<number>(spec.default);

    const zone = useMemo(() => spec.zones.find((z) => value >= z.from && value < z.to), [spec, value]);

    const status = zone?.color === '#ef4444' ? 'LIMIT' : zone?.color === '#f59e0b' ? 'CAUTION' : zone?.color === '#10b981' ? 'NORMAL' : 'CHECK';

    const displayValue = () => {
        if (spec.id === 'oilTemp') return u.tempF(value, units);
        if (spec.id === 'oilPress') return u.psi(value, units);
        if (spec.id === 'fuelQty') return u.gal(value, units);
        if (spec.id === 'fuelFlow') return u.gph(value, units);
        if (spec.id === 'vacuum') return u.inhg(value, units);
        return `${value} ${spec.unit}`;
    };

    const barMin = units === 'metric'
        ? spec.id === 'oilTemp' ? -20 : spec.id === 'oilPress' ? 0 : spec.id === 'fuelQty' ? 0 : spec.id === 'fuelFlow' ? 0 : spec.id === 'vacuum' ? 0 : spec.min
        : spec.min;
    const barMax = units === 'metric'
        ? spec.id === 'oilTemp' ? 130 : spec.id === 'oilPress' ? 830 : spec.id === 'fuelQty' ? 106 : spec.id === 'fuelFlow' ? 42 : spec.id === 'vacuum' ? 24 : spec.max
        : spec.max;
    const barValue = units === 'metric'
        ? spec.id === 'oilTemp' ? (value - 32) * 5 / 9 : spec.id === 'oilPress' ? value * 6.895 : spec.id === 'fuelQty' ? value * 3.785 : spec.id === 'fuelFlow' ? value * 3.785 : spec.id === 'vacuum' ? value * 3.386 : value
        : value;

    return (
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: zone?.color === '#ef4444' ? 'var(--error-color)' : 'var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <GaugeIcon size={18} color="#06b6d4" />
                    <span style={{ fontWeight: 600 }}>{spec.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: zone?.color }}>{displayValue()}</span>
                    <span className="chip" style={{ background: zone?.color === '#ef4444' ? 'rgba(239,68,68,0.15)' : zone?.color === '#f59e0b' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.12)', color: zone?.color, borderColor: `${zone?.color}55`, fontSize: '0.7rem' }}>{status}</span>
                </div>
            </div>

            <div style={{ position: 'relative', height: '20px', borderRadius: '6px', background: 'rgba(2,6,23,0.7)', border: '1px solid var(--glass-border)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                {spec.zones.map((z) => {
                    const zFrom = units === 'metric'
                        ? spec.id === 'oilTemp' ? (z.from - 32) * 5 / 9 : spec.id === 'oilPress' ? z.from * 6.895 : spec.id === 'fuelQty' ? z.from * 3.785 : spec.id === 'fuelFlow' ? z.from * 3.785 : spec.id === 'vacuum' ? z.from * 3.386 : z.from
                        : z.from;
                    const zTo = units === 'metric'
                        ? spec.id === 'oilTemp' ? (z.to - 32) * 5 / 9 : spec.id === 'oilPress' ? z.to * 6.895 : spec.id === 'fuelQty' ? z.to * 3.785 : spec.id === 'fuelFlow' ? z.to * 3.785 : spec.id === 'vacuum' ? z.to * 3.386 : z.to
                        : z.to;
                    return (
                        <div key={z.label} style={{ position: 'absolute', top: 0, bottom: 0, left: `${((zFrom - barMin) / (barMax - barMin)) * 100}%`, width: `${((zTo - zFrom) / (barMax - barMin)) * 100}%`, background: z.color, opacity: 0.55 }} title={z.label} />
                    );
                })}
                <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${((barValue - barMin) / (barMax - barMin)) * 100}%`, transform: 'translateX(-50%)', width: '4px', borderRadius: '2px', background: '#fff', boxShadow: `0 0 8px ${zone?.color || '#fff'}`, transition: 'left 0.12s ease', zIndex: 2 }} />
            </div>

            <input type="range" min={spec.min} max={spec.max} step={spec.step} value={value} onChange={(e) => { setValue(parseFloat(e.target.value)); sfx.playSelect(); }} style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }} />
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, marginTop: '0.4rem' }}>{spec.note}</div>
        </div>
    );
};

interface Props { units: UnitSystem; }

export const PowerplantPanel: React.FC<Props> = ({ units }) => {
    return (
        <div>
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', borderLeft: '4px solid #06b6d4' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>
                    <Cog size={24} />
                </div>
                <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{C172.engine.manufacturer} {C172.engine.model}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Maximum Power: {C172.engine.maxPower}</div>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Max RPM</div>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{C172.engine.maxRPM} RPM</div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Max Oil Temp</div>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{u.tempF(C172.engine.maxOilTempF, units)}</div>
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Oil Pressure</div>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{u.psiRange(C172.engine.oilPressMin, C172.engine.oilPressMax, units)}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <AlertTriangle size={18} color="#f59e0b" />
                <span style={{ color: 'var(--text-secondary)' }}>Drag the markers across each gauge. Green = normal operating range, yellow = caution, red = limit.</span>
                <ShieldCheck size={18} color="#10b981" style={{ marginLeft: 'auto' }} />
            </div>

            <div className="grid">
                {POWERPLANT_GAUGES.map((g) => (
                    <GaugeRow key={g.id} spec={g} units={units} />
                ))}
            </div>
        </div>
    );
};
