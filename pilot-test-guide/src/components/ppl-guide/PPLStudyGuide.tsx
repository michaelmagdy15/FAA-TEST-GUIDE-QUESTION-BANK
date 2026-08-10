import React, { Suspense, useState, lazy } from 'react';
import { BookOpen, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { sfx } from '../../utils/sfx';

const PilotQualifications = lazy(() => import('./sections/PilotQualifications').then(m => ({ default: m.PilotQualifications })));
const Airworthiness = lazy(() => import('./sections/Airworthiness').then(m => ({ default: m.Airworthiness })));
const WeatherInfo = lazy(() => import('./sections/WeatherInfo').then(m => ({ default: m.WeatherInfo })));
const CrossCountry = lazy(() => import('./sections/CrossCountry').then(m => ({ default: m.CrossCountry })));
const Airspace = lazy(() => import('./sections/Airspace').then(m => ({ default: m.Airspace })));
const Performance = lazy(() => import('./sections/Performance').then(m => ({ default: m.Performance })));
const Systems = lazy(() => import('./sections/Systems').then(m => ({ default: m.Systems })));
const HumanFactors = lazy(() => import('./sections/HumanFactors').then(m => ({ default: m.HumanFactors })));

const LOADER = (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '0.75rem' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-color)' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Loading section...</span>
    </div>
);

interface SectionDef {
    id: string;
    title: string;
    pages: string;
    description: string;
    color: string;
    icon: React.ReactNode;
    component: React.LazyExoticComponent<React.FC<{ onBack?: () => void }>>;
}

const SECTIONS: SectionDef[] = [
    {
        id: 'pilot-quals', title: 'Pilot Qualifications', pages: '3-4',
        description: 'Requirements, privileges, medical certificates, and endorsements for private pilots.',
        color: '#3b82f6', icon: <BookOpen size={20} />, component: PilotQualifications,
    },
    {
        id: 'airworthiness', title: 'Airworthiness', pages: '5',
        description: 'Required equipment, inspections, documents, and inoperative equipment procedures.',
        color: '#3b82f6', icon: <BookOpen size={20} />, component: Airworthiness,
    },
    {
        id: 'weather', title: 'Weather Information', pages: '6-12',
        description: 'METAR, TAF, PIREP, weather hazards, atmospheric science, and chart interpretation.',
        color: '#06b6d4', icon: <BookOpen size={20} />, component: WeatherInfo,
    },
    {
        id: 'cross-country', title: 'Cross-Country', pages: '13-18',
        description: 'Navigation, flight planning, radio communications, airport signs, and regulations.',
        color: '#8b5cf6', icon: <BookOpen size={20} />, component: CrossCountry,
    },
    {
        id: 'airspace', title: 'Airspace', pages: '19-23',
        description: 'Airspace classes, VFR minimums, special use airspace, and sectional chart reading.',
        color: '#ec4899', icon: <BookOpen size={20} />, component: Airspace,
    },
    {
        id: 'performance', title: 'Performance', pages: '24-25',
        description: 'Aerodynamics, V-speeds, load factors, stability, and density altitude.',
        color: '#f97316', icon: <BookOpen size={20} />, component: Performance,
    },
    {
        id: 'systems', title: 'Systems', pages: '26-27',
        description: 'Flight controls, engine, pitot-static, vacuum, and avionics systems.',
        color: '#eab308', icon: <BookOpen size={20} />, component: Systems,
    },
    {
        id: 'human-factors', title: 'Human Factors', pages: '28-31',
        description: 'DECIDE model, IMSAFE, hazardous attitudes, aeromedical factors, and illusions.',
        color: '#22c55e', icon: <BookOpen size={20} />, component: HumanFactors,
    },
];

export const PPLStudyGuide: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    if (activeSection) {
        const sec = SECTIONS.find(s => s.id === activeSection);
        if (sec) {
            const SectionComp = sec.component;
            return (
                <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <button
                        onClick={() => { sfx.playSelect(); setActiveSection(null); }}
                        onMouseEnter={() => sfx.playHover()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: 'none', border: 'none', color: sec.color, cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600,
                            marginBottom: '0.75rem', padding: '0.3rem 0',
                        }}
                    >
                        <ArrowLeft size={16} /> Back to Study Guide
                    </button>
                    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        <Suspense fallback={LOADER}>
                            <SectionComp onBack={() => setActiveSection(null)} />
                        </Suspense>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <button
                    onClick={() => { sfx.playSelect(); onBack(); }}
                    onMouseEnter={() => sfx.playHover()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none',
                        color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
                        fontWeight: 500, padding: '0.3rem 0',
                    }}
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>

            <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span style={{
                        width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.4)',
                        boxShadow: '0 0 20px rgba(56,189,248,0.25)', flexShrink: 0,
                    }}>
                        <BookOpen size={20} color="#38bdf8" />
                    </span>
                    <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        PPL Study Guide
                    </h1>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', margin: 0 }}>
                    Private Pilot Airman Certification Standards — 8 Interactive Sections
                </p>
            </header>

            {/* Section Grid */}
            <div className="ppl-section-grid" style={{
                flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: '1rem',
            }}>
                {SECTIONS.map((sec, i) => (
                    <button
                        key={sec.id}
                        onClick={() => { sfx.playSelect(); setActiveSection(sec.id); }}
                        onMouseEnter={() => sfx.playHover()}
                        className="glass-card"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: 'clamp(0.75rem, 2vw, 1.25rem)',
                            cursor: 'pointer', textAlign: 'left', border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius)', background: 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
                            transition: 'var(--transition)',
                            animationDelay: `${i * 0.05}s`,
                        }}
                    >
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            background: `${sec.color}20`, border: `1px solid ${sec.color}60`,
                            color: sec.color,
                        }}>
                            {sec.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                                <span style={{ fontWeight: 700, fontSize: 'clamp(0.82rem, 2vw, 0.95rem)', color: 'var(--text-primary)' }}>
                                    {sec.title}
                                </span>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.45rem',
                                    borderRadius: '999px', background: `${sec.color}25`, color: sec.color,
                                    border: `1px solid ${sec.color}40`,
                                }}>
                                    pp. {sec.pages}
                                </span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', margin: 0, lineHeight: 1.4 }}>
                                {sec.description}
                            </p>
                        </div>
                        <ChevronRight size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    </button>
                ))}
            </div>
        </div>
    );
};
