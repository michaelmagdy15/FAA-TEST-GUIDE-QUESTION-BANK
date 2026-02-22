import React from 'react';

export const GenericPlaneAnim: React.FC = () => (
    <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%', maxWidth: '250px' }}>
        <g className="plane-bank" transform-origin="100px 75px">
            {/* Plane Silhouette */}
            <path
                d="M100,20 Q105,40 105,60 140,70 180,75 L180,85 105,80 105,110 120,120 L120,130 100,125 80,130 L80,120 95,110 95,80 20,85 L20,75 60,70 95,60 Q95,40 100,20 Z"
                fill="var(--glass-bg)"
                stroke="var(--accent-color)"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            {/* Motion Lines */}
            <g stroke="var(--text-secondary)" strokeWidth="2" opacity="0.5" strokeLinecap="round" className="plane-trail">
                <line x1="20" y1="100" x2="-20" y2="120" />
                <line x1="180" y1="100" x2="220" y2="120" />
            </g>
        </g>
    </svg>
);
