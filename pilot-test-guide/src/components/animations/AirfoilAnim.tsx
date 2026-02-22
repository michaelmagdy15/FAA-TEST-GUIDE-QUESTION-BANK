import React from 'react';

export const AirfoilAnim: React.FC = () => (
    <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%', maxWidth: '300px' }}>
        {/* Airflow Lines */}
        <g stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" opacity="0.6" className="airflow-lines">
            <path d="M-50,30 Q50,10 100,5 T250,20" className="flow-top-1" fill="none" />
            <path d="M-50,40 Q50,25 100,20 T250,30" className="flow-top-2" fill="none" />
            <path d="M-50,60 Q50,65 100,60 T250,65" className="flow-bottom-1" fill="none" />
        </g>

        {/* Airfoil Shape */}
        <path d="M20,50 Q40,20 80,25 T160,50 Q120,60 80,60 T20,50 Z" fill="var(--glass-bg)" stroke="var(--text-secondary)" strokeWidth="2" />

        {/* Lift Vector */}
        <g className="lift-vector" stroke="var(--success-color)" strokeWidth="3" fill="none">
            <line x1="90" y1="40" x2="90" y2="10" />
            <polygon points="85,15 90,5 95,15" fill="var(--success-color)" />
        </g>
    </svg>
);
