import React, { useState } from 'react';
import { Plane, Navigation, Zap, Gauge, Wind, Activity, Fuel, Siren, BookOpenCheck, Globe } from 'lucide-react';
import { sfx } from '../../utils/sfx';
import { TestMode } from '../../types';
import { AuthButton } from '../AuthButton';
import { AirspeedIndicator } from './AirspeedIndicator';
import { VSpeedExplorer } from './VSpeedExplorer';
import { PowerplantPanel } from './PowerplantPanel';
import { FuelWeightPanel } from './FuelWeightPanel';
import { EmergencyTrainer } from './EmergencyTrainer';
import { QuizTab } from './QuizTab';
import { UnitSystem } from './c172Data';

interface C172HubProps {
    onModeSwitch: (mode: TestMode) => void;
}

const SECTIONS = [
    { id: 'airspeed', label: 'Airspeed', icon: <Gauge size={17} /> },
    { id: 'vspeeds', label: 'V-Speeds', icon: <Wind size={17} /> },
    { id: 'powerplant', label: 'Powerplant', icon: <Activity size={17} /> },
    { id: 'fuelweight', label: 'Fuel & Weight', icon: <Fuel size={17} /> },
    { id: 'emergencies', label: 'Emergencies', icon: <Siren size={17} /> },
    { id: 'quiz', label: 'Quiz', icon: <BookOpenCheck size={17} /> },
];

const MODES: { id: TestMode; label: string; icon: React.ReactNode; accent: string; rgb: string }[] = [
    { id: 'ppl', label: 'PPL', icon: <Plane size={15} />, accent: '#3b82f6', rgb: '59, 130, 246' },
    { id: 'ir', label: 'IR', icon: <Navigation size={15} />, accent: '#10b981', rgb: '16, 185, 129' },
    { id: 'cpl', label: 'CPL', icon: <Zap size={15} />, accent: '#f59e0b', rgb: '245, 158, 11' },
    { id: 'c172', label: 'C172', icon: <Plane size={15} />, accent: '#06b6d4', rgb: '6, 182, 212' },
];

export const C172Hub: React.FC<C172HubProps> = ({ onModeSwitch }) => {
    const [section, setSection] = useState<string>('airspeed');
    const [units, setUnits] = useState<UnitSystem>('imperial');

    return (
        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                {/* Unit toggle */}
                <div style={{ display: 'flex', gap: '0.25rem', padding: '4px', borderRadius: '10px' }} className="glass-card">
                    <button
                        onClick={() => { sfx.playSelect(); setUnits('imperial'); }}
                        onMouseEnter={() => sfx.playHover()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.45rem 0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: units === 'imperial' ? 700 : 500,
                            background: units === 'imperial' ? '#06b6d4' : 'transparent',
                            color: units === 'imperial' ? '#fff' : 'var(--text-secondary)',
                            transition: 'var(--transition)',
                        }}
                    >
                        <Globe size={14} /> Imperial
                    </button>
                    <button
                        onClick={() => { sfx.playSelect(); setUnits('metric'); }}
                        onMouseEnter={() => sfx.playHover()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.45rem 0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: units === 'metric' ? 700 : 500,
                            background: units === 'metric' ? '#06b6d4' : 'transparent',
                            color: units === 'metric' ? '#fff' : 'var(--text-secondary)',
                            transition: 'var(--transition)',
                        }}
                    >
                        <Globe size={14} /> Metric
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem', padding: '4px', borderRadius: '12px' }} className="glass-card">
                    {MODES.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => { sfx.playSelect(); onModeSwitch(m.id); }}
                            onMouseEnter={() => sfx.playHover()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.55rem 1rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                                fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: m.id === 'c172' ? 700 : 500,
                                background: m.id === 'c172' ? m.accent : 'transparent',
                                color: m.id === 'c172' ? '#fff' : 'var(--text-secondary)',
                                boxShadow: m.id === 'c172' ? `0 4px 14px rgba(${m.rgb},0.4)` : 'none',
                                transition: 'var(--transition)',
                            }}
                        >
                            {m.icon} {m.label}
                        </button>
                    ))}
                </div>
                <AuthButton />
            </div>

            {/* Title */}
            <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                    <span style={{ width: '58px', height: '58px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.4)', boxShadow: '0 0 30px rgba(6,182,212,0.25)' }}>
                        <Plane size={30} color="#06b6d4" />
                    </span>
                    <h1 className="title" style={{ fontSize: '2.4rem', margin: 0 }}>Cessna 172R</h1>
                </div>
                <p className="subtitle" style={{ fontSize: '1rem', marginBottom: 0 }}>
                    Limitations & Emergency Procedures — an interactive learning cockpit.
                </p>
            </header>

            {/* Section tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                {SECTIONS.map((s) => {
                    const active = section === s.id;
                    return (
                        <button
                            key={s.id}
                            onClick={() => { sfx.playSelect(); setSection(s.id); }}
                            onMouseEnter={() => sfx.playHover()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.45rem',
                                padding: '0.65rem 1.2rem', borderRadius: '12px', border: '1px solid var(--glass-border)',
                                fontFamily: 'inherit', fontSize: '0.92rem', fontWeight: active ? 700 : 500, cursor: 'pointer',
                                background: active ? 'rgba(6,182,212,0.15)' : 'var(--glass-bg)',
                                color: active ? '#06b6d4' : 'var(--text-secondary)',
                                borderColor: active ? '#06b6d4' : 'var(--glass-border)',
                                boxShadow: active ? '0 4px 18px rgba(6,182,212,0.25)' : 'none',
                                transition: 'var(--transition)',
                            }}
                        >
                            {s.icon} {s.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '1rem' }}>
                <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
                    {section === 'airspeed' && <AirspeedIndicator units={units} />}
                    {section === 'vspeeds' && <VSpeedExplorer units={units} />}
                    {section === 'powerplant' && <PowerplantPanel units={units} />}
                    {section === 'fuelweight' && <FuelWeightPanel units={units} />}
                    {section === 'emergencies' && <EmergencyTrainer />}
                    {section === 'quiz' && <QuizTab />}
                </div>
            </div>
        </div>
    );
};
