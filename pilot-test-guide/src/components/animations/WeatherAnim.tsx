import React from 'react';

export const WeatherAnim: React.FC = () => (
    <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%', maxWidth: '250px' }}>
        {/* Sun */}
        <circle cx="140" cy="40" r="25" fill="#e3b341" className="weather-sun" />

        {/* Cloud 1 */}
        <g className="weather-cloud-1" fill="var(--glass-bg)" stroke="var(--glass-border)" strokeWidth="2">
            <path d="M40,80 Q30,60 50,50 Q65,30 90,45 Q115,35 120,60 Q135,75 110,95 L45,95 Q25,95 40,80 Z" />
        </g>

        {/* Cloud 2 (Foreground) */}
        <g className="weather-cloud-2" fill="var(--surface-color)" stroke="var(--glass-border)" strokeWidth="2">
            <path d="M70,100 Q60,80 80,70 Q95,50 120,65 Q145,55 150,80 Q165,95 140,115 L75,115 Q55,115 70,100 Z" />
        </g>

        {/* Rain Drops */}
        <g stroke="var(--accent-color)" strokeWidth="3" strokeLinecap="round" className="weather-rain">
            <line x1="75" y1="120" x2="65" y2="135" />
            <line x1="100" y1="120" x2="90" y2="135" />
            <line x1="125" y1="120" x2="115" y2="135" />
        </g>
    </svg>
);
