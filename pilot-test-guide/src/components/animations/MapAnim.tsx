import React from 'react';

export const MapAnim: React.FC = () => (
    <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%', maxWidth: '250px' }}>
        {/* Map Grid */}
        <g stroke="var(--glass-border)" strokeWidth="1">
            <line x1="0" y1="50" x2="200" y2="50" />
            <line x1="0" y1="100" x2="200" y2="100" />
            <line x1="66" y1="0" x2="66" y2="150" />
            <line x1="133" y1="0" x2="133" y2="150" />
        </g>

        {/* Route Line */}
        <path d="M40,110 Q90,130 110,70 T160,30" fill="none" stroke="var(--text-secondary)" strokeWidth="3" strokeDasharray="5,5" className="map-route" />

        {/* Waypoints */}
        <circle cx="40" cy="110" r="6" fill="var(--error-color)" />
        <circle cx="160" cy="30" r="6" fill="var(--success-color)" />

        {/* Radar Pulse */}
        <circle cx="160" cy="30" r="6" fill="none" stroke="var(--success-color)" strokeWidth="2" className="map-pulse" />
    </svg>
);
