import React, { useState } from 'react';
import { ChevronDown, Cloud, CloudRain, Wind, Thermometer, AlertTriangle, Eye, Zap, ArrowDown } from 'lucide-react';
import { sfx } from '../../../utils/sfx';

const CARD: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%)',
    border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '1.25rem',
};

const EXPANDABLE: React.FC<{ title: string; icon?: React.ReactNode; color?: string; children: React.ReactNode }> = ({ title, icon, color = '#06b6d4', children }) => {
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

/* ───── METAR Decoder ───── */
const METAR_DATA = [
    { code: 'METAR', meaning: 'Routine observation', color: '#94a3b8' },
    { code: 'KJFK', meaning: 'Station: JFK Intl', color: '#3b82f6' },
    { code: '121753Z', meaning: 'Date/Time: 12th at 17:53Z', color: '#8b5cf6' },
    { code: '18009KT', meaning: 'Wind: 180° at 9 knots', color: '#06b6d4' },
    { code: '10SM', meaning: 'Visibility: 10 statute miles', color: '#22c55e' },
    { code: 'FEW040', meaning: 'Few clouds at 4,000 ft AGL', color: '#f97316' },
    { code: 'SCT250', meaning: 'Scattered clouds at 25,000 ft AGL', color: '#f97316' },
    { code: '27/18', meaning: 'Temp 27°C / Dew 18°C', color: '#ec4899' },
    { code: 'A3012', meaning: 'Altimeter: 30.12 inHg', color: '#eab308' },
    { code: 'RMK', meaning: 'Remarks section', color: '#94a3b8' },
    { code: 'AO2', meaning: 'Automated station with precipitation', color: '#94a3b8' },
    { code: 'SLP196', meaning: 'Sea level pressure: 1019.6 mb', color: '#94a3b8' },
];

const METAR_DECODER: React.FC = () => {
    const [hoveredPart, setHoveredPart] = useState<number | null>(null);
    return (
        <div style={CARD}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                METAR Decoder — Interactive
            </h3>
            <div style={{
                background: 'rgba(15,23,42,0.8)', border: '1px solid var(--glass-border)', borderRadius: '10px',
                padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: 2,
                marginBottom: '0.75rem', overflowX: 'auto',
            }}>
                {METAR_DATA.map((part, i) => (
                    <span
                        key={i}
                        onMouseEnter={() => { sfx.playHover(); setHoveredPart(i); }}
                        onMouseLeave={() => setHoveredPart(null)}
                        style={{
                            display: 'inline-block', padding: '2px 6px', borderRadius: '4px',
                            background: hoveredPart === i ? `${part.color}30` : 'transparent',
                            borderBottom: `2px solid ${hoveredPart === i ? part.color : 'transparent'}`,
                            color: part.color, cursor: 'default', transition: 'all 0.15s', margin: '0 2px',
                            fontWeight: hoveredPart === i ? 700 : 400,
                        }}
                    >
                        {part.code}
                    </span>
                ))}
            </div>
            {hoveredPart !== null && (
                <div style={{
                    padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem',
                    background: `${METAR_DATA[hoveredPart].color}15`, border: `1px solid ${METAR_DATA[hoveredPart].color}40`,
                    color: METAR_DATA[hoveredPart].color, fontWeight: 600,
                }}>
                    {METAR_DATA[hoveredPart].meaning}
                </div>
            )}
        </div>
    );
};

/* ───── TAF Decoder ───── */
const TAF_DATA = [
    { code: 'TAF', meaning: 'Terminal Aerodrome Forecast', color: '#94a3b8' },
    { code: 'KJFK', meaning: 'Station: JFK Intl', color: '#3b82f6' },
    { code: '121730Z', meaning: 'Issued: 12th at 17:30Z', color: '#8b5cf6' },
    { code: '1218/1324', meaning: 'Valid period: 12th 18Z to 13th 24Z', color: '#06b6d4' },
    { code: '18009KT', meaning: 'Wind: 180° at 9 knots', color: '#06b6d4' },
    { code: '10SM', meaning: 'Visibility: 10 statute miles', color: '#22c55e' },
    { code: 'FEW040', meaning: 'Few clouds at 4,000 ft AGL', color: '#f97316' },
    { code: 'BKN250', meaning: 'Broken clouds at 25,000 ft AGL', color: '#f97316' },
    { code: '27/18', meaning: 'Temp 27°C / Dew 18°C', color: '#ec4899' },
    { code: 'FM2200', meaning: 'From 22:00Z', color: '#a78bfa' },
    { code: '18012G18KT', meaning: 'Wind 180° at 12 gusting 18 knots', color: '#06b6d4' },
    { code: '6SM', meaning: 'Visibility: 6 statute miles', color: '#22c55e' },
    { code: 'RA', meaning: 'Rain', color: '#06b6d4' },
    { code: 'SCT030', meaning: 'Scattered clouds at 3,000 ft AGL', color: '#f97316' },
    { code: 'BKN080', meaning: 'Broken clouds at 8,000 ft AGL', color: '#f97316' },
    { code: 'TEMPO', meaning: 'Temporary conditions', color: '#eab308' },
    { code: '3SM', meaning: 'Visibility: 3 statute miles', color: '#22c55e' },
    { code: 'TSRA', meaning: 'Thunderstorms with rain', color: '#ef4444' },
    { code: 'BKN020', meaning: 'Broken clouds at 2,000 ft AGL', color: '#f97316' },
    { code: 'PROB40', meaning: '40% probability', color: '#eab308' },
    { code: 'FM0600', meaning: 'From 06:00Z', color: '#a78bfa' },
];

const TAF_DECODER: React.FC = () => {
    const [hoveredPart, setHoveredPart] = useState<number | null>(null);
    return (
        <div style={CARD}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                TAF Decoder — Interactive
            </h3>
            <div style={{
                background: 'rgba(15,23,42,0.8)', border: '1px solid var(--glass-border)', borderRadius: '10px',
                padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 2,
                marginBottom: '0.75rem', overflowX: 'auto',
            }}>
                {TAF_DATA.map((part, i) => (
                    <span
                        key={i}
                        onMouseEnter={() => { sfx.playHover(); setHoveredPart(i); }}
                        onMouseLeave={() => setHoveredPart(null)}
                        style={{
                            display: 'inline-block', padding: '2px 6px', borderRadius: '4px',
                            background: hoveredPart === i ? `${part.color}30` : 'transparent',
                            borderBottom: `2px solid ${hoveredPart === i ? part.color : 'transparent'}`,
                            color: part.color, cursor: 'default', transition: 'all 0.15s', margin: '0 2px',
                            fontWeight: hoveredPart === i ? 700 : 400,
                        }}
                    >
                        {part.code}
                    </span>
                ))}
            </div>
            {hoveredPart !== null && (
                <div style={{
                    padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem',
                    background: `${TAF_DATA[hoveredPart].color}15`, border: `1px solid ${TAF_DATA[hoveredPart].color}40`,
                    color: TAF_DATA[hoveredPart].color, fontWeight: 600,
                }}>
                    {TAF_DATA[hoveredPart].meaning}
                </div>
            )}
        </div>
    );
};

/* ───── PIREP Format ───── */
const PIREP_FIELDS = [
    { field: '/OV', desc: 'Observed VOR, fix, or airport', example: '/OV DUNRE' },
    { field: '/TM', desc: 'Time (Zulu)', example: '/TM 1435' },
    { field: '/FL', desc: 'Flight level (hundreds of feet)', example: '/FL080' },
    { field: '/TP', desc: 'Type aircraft', example: '/TP C172' },
    { field: '/SK', desc: 'Sky condition', example: '/SK BKN040 OVC080' },
    { field: '/WX', desc: 'Weather', example: '/WX FZRA' },
    { field: '/TA', desc: 'Air temperature', example: '/TA -05' },
    { field: '/WV', desc: 'Wind (direction/speed)', example: '/WV 270/35KT' },
    { field: '/TB', desc: 'Turbulence', example: '/TB MOD' },
    { field: '/IC', desc: 'Icing', example: '/IC SEV RIME' },
    { field: '/RP', desc: 'Remarks', example: '/RP REPORTED BY C172 PILOT' },
];

/* ───── Winds Aloft ───── */
const WINDS_ALOFT_DATA = [
    { station: 'JFK', alt: '3000', temp: '+15', wind: '280/12', remark: '' },
    { station: 'JFK', alt: '6000', temp: '+08', wind: '290/18', remark: '' },
    { station: 'JFK', alt: '9000', temp: '+01', wind: '300/25', remark: '' },
    { station: 'JFK', alt: '12000', temp: '-05', wind: '310/35', remark: '' },
    { station: 'BOS', alt: '3000', temp: '+12', wind: '270/10', remark: '' },
    { station: 'BOS', alt: '6000', temp: '+05', wind: '280/20', remark: '' },
    { station: 'BOS', alt: '9000', temp: '-02', wind: '290/30', remark: '' },
    { station: 'BOS', alt: '12000', temp: '-08', wind: '300/40', remark: '' },
];

/* ───── Weather Abbreviations ───── */
const PHENOMENA: { code: string; meaning: string }[] = [
    { code: 'DZ', meaning: 'Drizzle' }, { code: 'RA', meaning: 'Rain' }, { code: 'SN', meaning: 'Snow' },
    { code: 'SG', meaning: 'Snow grains' }, { code: 'IC', meaning: 'Ice crystals' }, { code: 'PL', meaning: 'Ice pellets' },
    { code: 'GR', meaning: 'Hail' }, { code: 'GS', meaning: 'Small hail' }, { code: 'UP', meaning: 'Unknown precipitation' },
    { code: 'BR', meaning: 'Mist' }, { code: 'FG', meaning: 'Fog' }, { code: 'FU', meaning: 'Smoke' },
    { code: 'VA', meaning: 'Volcanic ash' }, { code: 'DU', meaning: 'Dust' }, { code: 'SA', meaning: 'Sand' },
    { code: 'HZ', meaning: 'Haze' }, { code: 'PY', meaning: 'Spray' },
];

const SKY_CONDITION: { code: string; meaning: string }[] = [
    { code: 'CLR', meaning: 'Clear (< 1/8 cloud coverage)' },
    { code: 'FEW', meaning: 'Few (1/8 to 2/8 coverage)' },
    { code: 'SCT', meaning: 'Scattered (3/8 to 4/8 coverage)' },
    { code: 'BKN', meaning: 'Broken (5/8 to 7/8 coverage)' },
    { code: 'OVC', meaning: 'Overcast (8/8 coverage)' },
    { code: 'VV', meaning: 'Vertical visibility (obscured)' },
];

const TAF_CODES: { code: string; meaning: string }[] = [
    { code: 'FM', meaning: 'From (valid period start)' }, { code: 'TL', meaning: 'Until' },
    { code: 'AT', meaning: 'At (specific time)' }, { code: 'BECMG', meaning: 'Becoming (gradual change)' },
    { code: 'TEMPO', meaning: 'Temporary (transient conditions)' }, { code: 'PROB', meaning: 'Probability (PROB30/PROB40)' },
    { code: 'NSW', meaning: 'No significant weather' }, { code: 'SKC', meaning: 'Sky clear' },
    { code: 'FEW', meaning: 'Few clouds' }, { code: 'SCT', meaning: 'Scattered clouds' },
    { code: 'BKN', meaning: 'Broken clouds' }, { code: 'OVC', meaning: 'Overcast' },
];

const ABBREVIATION_TABLES = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        <div style={{ ...CARD, padding: '1rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#06b6d4', marginBottom: '0.5rem' }}>Phenomena</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem', fontSize: '0.78rem' }}>
                {PHENOMENA.map(p => (
                    <div key={p.code} style={{ display: 'flex', gap: '0.3rem' }}>
                        <span style={{ fontWeight: 700, color: '#06b6d4', minWidth: '28px' }}>{p.code}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{p.meaning}</span>
                    </div>
                ))}
            </div>
        </div>
        <div style={{ ...CARD, padding: '1rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f97316', marginBottom: '0.5rem' }}>Sky Condition</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.78rem' }}>
                {SKY_CONDITION.map(s => (
                    <div key={s.code} style={{ display: 'flex', gap: '0.3rem' }}>
                        <span style={{ fontWeight: 700, color: '#f97316', minWidth: '35px' }}>{s.code}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{s.meaning}</span>
                    </div>
                ))}
            </div>
        </div>
        <div style={{ ...CARD, padding: '1rem' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '0.5rem' }}>TAF Codes</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem', fontSize: '0.78rem' }}>
                {TAF_CODES.map(t => (
                    <div key={t.code} style={{ display: 'flex', gap: '0.3rem' }}>
                        <span style={{ fontWeight: 700, color: '#8b5cf6', minWidth: '45px' }}>{t.code}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{t.meaning}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/* ───── Standard Brief ───── */
const STANDARD_BRIEF = [
    'Adverse Conditions — Potential hazards',
    'VFR Flight NOT Recommended — When VFR not safe',
    'Synopsis — General weather picture',
    'Current Conditions — At departure, destination, and alternate',
    'En Route — Along planned route',
    'Destination — Forecast at arrival',
    'NOTAMs — Relevant to planned flight',
    'ATC Delays — Expected delays',
    'Pilot Weather Report (PIREP) — Recent pilot reports',
    'Winds Aloft — Along route at planned altitude',
];

/* ───── AIRMET/SIGMET Comparison ───── */
const SIGMET_COMPARISON = [
    {
        type: 'AIRMET',
        color: '#3b82f6',
        icon: <Cloud size={18} />,
        forWho: 'All aircraft',
        criteria: 'Moderate turbulence, icing, or IFR conditions',
        area: 'Large geographic area',
        impact: 'General aviation, lighter aircraft',
    },
    {
        type: 'SIGMET',
        color: '#f97316',
        icon: <AlertTriangle size={18} />,
        forWho: 'All aircraft',
        criteria: 'Severe turbulence, icing, dust storms, volcanic ash, tornadoes',
        area: 'Large geographic area',
        impact: 'All aircraft, significant weather',
    },
    {
        type: 'Convective SIGMET',
        color: '#ef4444',
        icon: <Zap size={18} />,
        forWho: 'All aircraft',
        criteria: 'Thunderstorms (line/area), tornadoes, hail ≥¾"',
        area: 'Smaller, more defined area',
        impact: 'Severe convection, dangerous to all',
    },
];

/* ───── Atmosphere ───── */
const FRONTS = [
    { type: 'Cold Front', symbol: '▼▼▼', color: '#3b82f6', weather: 'Narrow band of heavy showers/thunderstorms', tempChange: 'Sharp drop in temperature', windShift: 'Abrupt shift, gusty' },
    { type: 'Warm Front', symbol: '▲▲▲', color: '#ef4444', weather: 'Wide area of steady rain/drizzle, fog', tempChange: 'Gradual rise', windShift: 'Gradual shift' },
    { type: 'Stationary Front', symbol: '▲▼▲▼', color: '#a78bfa', weather: 'Prolonged cloudy/rainy weather', tempChange: 'Little change', windShift: 'Light, variable' },
    { type: 'Occluded Front', symbol: '▲●▲●', color: '#22c55e', weather: 'Mix of warm/cold front weather', tempChange: 'Variable', windShift: 'Variable' },
];

/* ───── Cloud Types ───── */
const CLOUD_TYPES = {
    low: [
        { name: 'Stratus', base: 'SFC-6,500', color: '#94a3b8' },
        { name: 'Cumulus', base: 'SFC-6,500', color: '#f97316' },
        { name: 'Stratocumulus', base: 'SFC-6,500', color: '#94a3b8' },
    ],
    middle: [
        { name: 'Altostratus', base: '6,500-20,000', color: '#64748b' },
        { name: 'Altocumulus', base: '6,500-20,000', color: '#64748b' },
    ],
    high: [
        { name: 'Cirrus', base: '20,000-40,000', color: '#e2e8f0' },
        { name: 'Cirrostratus', base: '20,000-40,000', color: '#e2e8f0' },
        { name: 'Cirrocumulus', base: '20,000-40,000', color: '#e2e8f0' },
    ],
};

/* ───── Weather Hazards ───── */
const ICING_TYPES = [
    { type: 'Clear Ice', color: '#38bdf8', desc: 'Forms at temps near freezing (0 to -10°C). Transparent, heavy. Hard to remove.' },
    { type: 'Rime Ice', color: '#94a3b8', desc: 'Forms at colder temps (-10 to -20°C). Milky, rough. Builds forward.' },
    { type: 'Mixed Ice', color: '#a78bfa', desc: 'Combination of clear and rime. Forms at -10 to -15°C.' },
];

const ICING_INTENSITY = [
    { intensity: 'Light', rate: '< 1 inch per hour', color: '#22c55e' },
    { intensity: 'Moderate', rate: '1 inch per hour', color: '#eab308' },
    { intensity: 'Severe', rate: '> 2 inches per hour', color: '#ef4444' },
];

const TS_STAGES = [
    { name: 'Cumulus', color: '#22c55e', desc: 'Growing stage. Updrafts dominant. Light rain possible.', visual: '▲▲▲' },
    { name: 'Mature', color: '#eab308', desc: 'Downdrafts begin. Heavy rain, hail, lightning, wind shear.', visual: '▲▼▲▼' },
    { name: 'Dissipating', color: '#ef4444', desc: 'Downdrafts dominate. Light to moderate rain, gusty winds.', visual: '▼▼▼' },
];

const FOG_TYPES = [
    { type: 'Advection', desc: 'Warm, moist air moves over cold surface', color: '#3b82f6' },
    { type: 'Radiation', desc: 'Ground cools, cools air above to dew point', color: '#8b5cf6' },
    { type: 'Upslope', desc: 'Moist air forced up terrain slope, cools to dew point', color: '#06b6d4' },
    { type: 'Steam', desc: 'Cold air over warm water creates condensation', color: '#22c55e' },
    { type: 'Frontal', desc: 'Warm air rises over cold air mass', color: '#f97316' },
];

const MAIN_TABS = ['METAR', 'TAF', 'PIREP', 'Abbreviations', 'Brief', 'Hazards', 'Atmosphere', 'Clouds'] as const;

export const WeatherInfo: React.FC = () => {
    const [tab, setTab] = useState<typeof MAIN_TABS[number]>('METAR');
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#06b6d4', marginBottom: '0.3rem' }}>
                    Weather Information
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Aviation Weather Services — METAR, TAF, Hazards & More</p>
            </header>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex', gap: '0.25rem', padding: '3px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                flexWrap: 'wrap',
            }}>
                {MAIN_TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => { sfx.playSelect(); setTab(t); }}
                        onMouseEnter={() => sfx.playHover()}
                        style={{
                            padding: '0.4rem 0.8rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: tab === t ? 700 : 500,
                            background: tab === t ? '#06b6d4' : 'transparent',
                            color: tab === t ? '#fff' : 'var(--text-secondary)',
                            transition: 'var(--transition)', flexShrink: 0,
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {tab === 'METAR' && <METAR_DECODER />}
                {tab === 'TAF' && <TAF_DECODER />}
                {tab === 'PIREP' && (
                    <div style={CARD}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            PIREP Format
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                            Pilot Weather Reports use standardized field labels. All times are Zulu.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                            {PIREP_FIELDS.map(f => (
                                <div key={f.field} style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)' }}>
                                    <div style={{ fontWeight: 700, color: '#06b6d4', fontSize: '0.88rem', fontFamily: 'monospace' }}>{f.field}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{f.desc}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#06b6d4', marginTop: '0.2rem', fontFamily: 'monospace' }}>{f.example}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {tab === 'Abbreviations' && ABBREVIATION_TABLES}
                {tab === 'Brief' && (
                    <div style={CARD}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                            Standard Brief Elements
                        </h3>
                        <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                            {STANDARD_BRIEF.map((item, i) => (
                                <li key={i} style={{ marginBottom: '0.4rem' }}>{item}</li>
                            ))}
                        </ol>
                    </div>
                )}
                {tab === 'Hazards' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* AIRMET / SIGMET */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                            {SIGMET_COMPARISON.map(s => (
                                <div key={s.type} style={{ ...CARD, border: `1px solid ${s.color}40` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: s.color, fontWeight: 700, fontSize: '0.95rem' }}>
                                        {s.icon} {s.type}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.82rem' }}>
                                        <div><strong>For:</strong> <span style={{ color: 'var(--text-secondary)' }}>{s.forWho}</span></div>
                                        <div><strong>Criteria:</strong> <span style={{ color: 'var(--text-secondary)' }}>{s.criteria}</span></div>
                                        <div><strong>Area:</strong> <span style={{ color: 'var(--text-secondary)' }}>{s.area}</span></div>
                                        <div><strong>Impact:</strong> <span style={{ color: 'var(--text-secondary)' }}>{s.impact}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Icing */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                <Ice size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                                Icing
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                {ICING_TYPES.map(i => (
                                    <div key={i.type} style={{ padding: '0.5rem', borderRadius: '8px', background: `${i.color}15`, border: `1px solid ${i.color}40` }}>
                                        <div style={{ fontWeight: 700, color: i.color, marginBottom: '0.2rem' }}>{i.type}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{i.desc}</div>
                                    </div>
                                ))}
                            </div>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Intensity</h4>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {ICING_INTENSITY.map(i => (
                                    <div key={i.intensity} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: `${i.color}15`, border: `1px solid ${i.color}40`, textAlign: 'center' }}>
                                        <div style={{ fontWeight: 700, color: i.color }}>{i.intensity}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{i.rate}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Thunderstorms */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                <Zap size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem' }} />
                                Thunderstorm Stages
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {TS_STAGES.map(ts => (
                                    <div key={ts.name} style={{ padding: '0.75rem', borderRadius: '8px', background: `${ts.color}15`, border: `1px solid ${ts.color}40`, textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem', letterSpacing: '2px' }}>{ts.visual}</div>
                                        <div style={{ fontWeight: 700, color: ts.color, marginBottom: '0.3rem' }}>{ts.name}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{ts.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fog */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                Fog Types
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                                {FOG_TYPES.map(f => (
                                    <div key={f.type} style={{ padding: '0.5rem', borderRadius: '8px', background: `${f.color}15`, border: `1px solid ${f.color}40` }}>
                                        <div style={{ fontWeight: 700, color: f.color, marginBottom: '0.2rem' }}>{f.type} Fog</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{f.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Wind Shear */}
                        <EXPANDABLE title={<><Wind size={18} /> Wind Shear</>} color="#ef4444">
                            <p style={{ marginTop: '0.5rem' }}>
                                Wind shear is a sudden change in wind speed and/or direction over a short distance. Most dangerous at low altitudes during takeoff and landing.
                            </p>
                            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                <li><strong>Low-level wind shear</strong> — Most dangerous to aircraft near the ground</li>
                                <li><strong>Microbursts</strong> — Small, intense downdrafts with strong outflow. Can cause rapid loss of airspeed.</li>
                                <li><strong>Wind shear indicators</strong> — ATIS, ATC reports, pilot reports, LLWAS</li>
                            </ul>
                        </EXPANDABLE>
                    </div>
                )}
                {tab === 'Atmosphere' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Pressure Systems */}
                        <EXPANDABLE title="🌡️ Pressure Systems" color="#06b6d4">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                    <div style={{ fontWeight: 700, color: '#ef4444' }}>High Pressure (H)</div>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0' }}>Air sinks, diverges at surface. Generally clear, light winds. Flows clockwise (Northern Hemisphere).</p>
                                </div>
                                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
                                    <div style={{ fontWeight: 700, color: '#3b82f6' }}>Low Pressure (L)</div>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0' }}>Air rises, converges at surface. Cloudy, precipitation. Flows counterclockwise (Northern Hemisphere).</p>
                                </div>
                            </div>
                        </EXPANDABLE>

                        {/* Fronts Table */}
                        <div style={CARD}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                Fronts
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                                {FRONTS.map(f => (
                                    <div key={f.type} style={{ padding: '0.75rem', borderRadius: '8px', background: `${f.color}15`, border: `1px solid ${f.color}40` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                                            <span style={{ fontSize: '1.1rem', color: f.color }}>{f.symbol}</span>
                                            <strong style={{ color: f.color }}>{f.type}</strong>
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                            <div><strong>Weather:</strong> {f.weather}</div>
                                            <div><strong>Temp:</strong> {f.tempChange}</div>
                                            <div><strong>Wind:</strong> {f.windShift}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dew Point & Stability */}
                        <EXPANDABLE title="💧 Dew Point & Stability" color="#8b5cf6">
                            <div style={{ marginTop: '0.5rem' }}>
                                <p><strong>Dew Point:</strong> Temperature at which air becomes saturated and condensation begins. Closer temp/dew point spread = higher humidity and fog/low cloud potential.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>Lapse Rate:</strong> Temperature decreases ~2°C per 1,000 ft (standard). Dry adiabatic: 3°C/1,000 ft. Moist adiabatic: 1.5°C/1,000 ft.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>Stable Air:</strong> Resists vertical movement. Gentle winds, stratiform clouds, steady precipitation.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong>Unstable Air:</strong> Encourages vertical movement. Gusts, cumulus clouds, showery precipitation, turbulence.</p>
                            </div>
                        </EXPANDABLE>
                    </div>
                )}
                {tab === 'Clouds' && (
                    <div style={CARD}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Cloud Types by Level
                        </h3>
                        {/* Visual diagram */}
                        <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: '12px', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                            {/* Altitude labels */}
                            <div style={{ position: 'absolute', left: '8px', top: '10px', fontSize: '0.7rem', color: '#94a3b8' }}>40,000 ft</div>
                            <div style={{ position: 'absolute', left: '8px', top: '40%', fontSize: '0.7rem', color: '#94a3b8' }}>20,000 ft</div>
                            <div style={{ position: 'absolute', left: '8px', top: '72%', fontSize: '0.7rem', color: '#94a3b8' }}>6,500 ft</div>
                            <div style={{ position: 'absolute', left: '8px', bottom: '10px', fontSize: '0.7rem', color: '#94a3b8' }}>SFC</div>

                            {/* Level dividers */}
                            <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, height: '1px', background: 'rgba(148,163,184,0.2)' }} />
                            <div style={{ position: 'absolute', top: '72%', left: 0, right: 0, height: '1px', background: 'rgba(148,163,184,0.2)' }} />

                            {/* High clouds */}
                            <div style={{ position: 'absolute', top: '12%', left: '15%', right: '15%', display: 'flex', justifyContent: 'space-around' }}>
                                {CLOUD_TYPES.high.map(c => (
                                    <div key={c.name} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '2rem', color: c.color, lineHeight: 1, marginBottom: '2px' }}>☁</div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: c.color }}>{c.name}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Middle clouds */}
                            <div style={{ position: 'absolute', top: '52%', left: '15%', right: '15%', display: 'flex', justifyContent: 'space-around' }}>
                                {CLOUD_TYPES.middle.map(c => (
                                    <div key={c.name} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '2.5rem', color: c.color, lineHeight: 1, marginBottom: '2px' }}>☁</div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: c.color }}>{c.name}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Low clouds */}
                            <div style={{ position: 'absolute', top: '78%', left: '10%', right: '10%', display: 'flex', justifyContent: 'space-around' }}>
                                {CLOUD_TYPES.low.map(c => (
                                    <div key={c.name} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '3rem', color: c.color, lineHeight: 1, marginBottom: '2px' }}>☁</div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: c.color }}>{c.name}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Labels */}
                            <div style={{ position: 'absolute', right: '8px', top: '15%', fontSize: '0.7rem', color: '#e2e8f0', fontWeight: 700 }}>HIGH</div>
                            <div style={{ position: 'absolute', right: '8px', top: '55%', fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>MIDDLE</div>
                            <div style={{ position: 'absolute', right: '8px', top: '80%', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>LOW</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Ice = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /><line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
    </svg>
);
