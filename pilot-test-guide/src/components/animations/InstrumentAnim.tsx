import React from 'react';

export const InstrumentAnim: React.FC = () => (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', maxWidth: '250px' }}>
        {/* Gauge Body */}
        <circle cx="100" cy="100" r="80" fill="var(--glass-bg)" stroke="var(--glass-border)" strokeWidth="4" />
        <circle cx="100" cy="100" r="70" fill="rgba(0,0,0,0.3)" />

        {/* Tick Marks */}
        {[...Array(8)].map((_, i) => (
            <line
                key={i}
                x1="100" y1="35" x2="100" y2="45"
                stroke="var(--text-secondary)"
                strokeWidth="3"
                transform={`rotate(${i * 45} 100 100)`}
            />
        ))}

        {/* Needle */}
        <g className="instrument-needle" transform-origin="100px 100px">
            <line x1="100" y1="110" x2="100" y2="45" stroke="var(--error-color)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="100" r="8" fill="var(--text-primary)" />
        </g>
    </svg>
);
