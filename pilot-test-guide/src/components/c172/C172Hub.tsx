import React, { useState } from 'react';
import { Plane, Navigation, Zap, Gauge, Wind, Activity, Fuel, Siren, BookOpenCheck, Globe, ArrowLeft } from 'lucide-react';
import { sfx } from '../../utils/sfx';
import { TestMode } from '../../types';
import { AirspeedIndicator } from './AirspeedIndicator';
import { VSpeedExplorer } from './VSpeedExplorer';
import { PowerplantPanel } from './PowerplantPanel';
import { FuelWeightPanel } from './FuelWeightPanel';
import { EmergencyTrainer } from './EmergencyTrainer';
import { QuizTab } from './QuizTab';
import { UnitSystem } from './c172Data';

interface C172HubProps {
    onModeSwitch: (mode: TestMode) => void;
    onBack?: () => void;
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
    { id: 'ppl', label: 'PPL', icon: <Plane size={15} />, accent: '#38bdf8', rgb: '56, 189, 248' },
    { id: 'ir', label: 'IR', icon: <Navigation size={15} />, accent: '#10b981', rgb: '16, 185, 129' },
    { id: 'cpl', label: 'CPL', icon: <Zap size={15} />, accent: '#f59e0b', rgb: '245, 158, 11' },
    { id: 'c172', label: 'C172', icon: <Plane size={15} />, accent: '#06b6d4', rgb: '6, 182, 212' },
];

export const C172Hub: React.FC<C172HubProps> = ({ onModeSwitch, onBack }) => {
    const [section, setSection] = useState<string>('airspeed');
    const [units, setUnits] = useState<UnitSystem>('imperial');

    return (
        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Back button */}
                {onBack && (
                    <button
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => { sfx.playSelect(); onBack(); }}
                        onMouseEnter={() => sfx.playHover()}
                    >
                        <ArrowLeft size={14} /> <span>Back</span>
                    </button>
                )}
                {/* Unit toggle */}
                <div style={{ display: 'flex', gap: '0.25rem', padding: '3px', borderRadius: '10px' }} className="glass-card">
                    <button
                        onClick={() => { sfx.playSelect(); setUnits('imperial'); }}
                        onMouseEnter={() => sfx.playHover()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.35rem 0.7rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: units === 'imperial' ? 700 : 500,
                            background: units === 'imperial' ? '#06b6d4' : 'transparent',
                            color: units === 'imperial' ? '#fff' : 'var(--text-secondary)',
                            transition: 'var(--transition)',
                        }}
                    >
                        <Globe size={13} /> Imperial
                    </button>
                    <button
                        onClick={() => { sfx.playSelect(); setUnits('metric'); }}
                        onMouseEnter={() => sfx.playHover()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.35rem 0.7rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: units === 'metric' ? 700 : 500,
                            background: units === 'metric' ? '#06b6d4' : 'transparent',
                            color: units === 'metric' ? '#fff' : 'var(--text-secondary)',
                            transition: 'var(--transition)',
                        }}
                    >
                        <Globe size={13} /> Metric
                    </button>
                </div>

                <div className="glass-card mode-toggle-scroll" style={{ display: 'flex', gap: '0.2rem', padding: '3px', borderRadius: '12px' }}>
                    {MODES.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => { sfx.playSelect(); onModeSwitch(m.id); }}
                            onMouseEnter={() => sfx.playHover()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.4rem 0.8rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                                fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: m.id === 'c172' ? 700 : 500,
                                background: m.id === 'c172' ? m.accent : 'transparent',
                                color: m.id === 'c172' ? '#fff' : 'var(--text-secondary)',
                                boxShadow: m.id === 'c172' ? `0 4px 14px rgba(${m.rgb},0.4)` : 'none',
                                transition: 'var(--transition)',
                                flexShrink: 0,
                            }}
                        >
                            {m.icon} {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Title */}
            <header style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.4)', boxShadow: '0 0 20px rgba(6,182,212,0.25)' }}>
                        <Plane size={22} color="#06b6d4" />
                    </span>
                    <h1 className="title" style={{ fontSize: '1.8rem', margin: 0 }}>Cessna 172R</h1>
                </div>
                <p className="subtitle" style={{ fontSize: '0.85rem', marginBottom: 0 }}>
                    Limitations & Emergency Procedures
                </p>
            </header>

            {/* Section tabs - horizontal scroll on mobile */}
            <div className="mode-toggle-scroll" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', gap: '0.35rem', paddingBottom: '2px' }}>
                {SECTIONS.map((s) => {
                    const active = section === s.id;
                    return (
                        <button
                            key={s.id}
                            onClick={() => { sfx.playSelect(); setSection(s.id); }}
                            onMouseEnter={() => sfx.playHover()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.5rem 0.9rem', borderRadius: '10px', border: '1px solid var(--glass-border)',
                                fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: active ? 700 : 500, cursor: 'pointer',
                                background: active ? 'rgba(6,182,212,0.15)' : 'var(--glass-bg)',
                                color: active ? '#06b6d4' : 'var(--text-secondary)',
                                borderColor: active ? '#06b6d4' : 'var(--glass-border)',
                                boxShadow: active ? '0 4px 18px rgba(6,182,212,0.25)' : 'none',
                                transition: 'var(--transition)',
                                flexShrink: 0,
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
