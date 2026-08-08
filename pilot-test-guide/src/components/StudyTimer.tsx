import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { sfx } from '../utils/sfx';

const SESSION_MINUTES = 25;
const BREAK_MINUTES = 5;

export const StudyTimer: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SESSION_MINUTES * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            // Timer finished
            sfx.playCorrect();
            if (isBreak) {
              setIsBreak(false);
              return SESSION_MINUTES * 60;
            } else {
              setSessionsCompleted(s => s + 1);
              setIsBreak(true);
              return BREAK_MINUTES * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, isBreak]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const totalSeconds = isBreak ? BREAK_MINUTES * 60 : SESSION_MINUTES * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(SESSION_MINUTES * 60);
  };

  return (
    <div className="glass-card" style={{
      padding: '1rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
      borderLeft: '3px solid #8b5cf6',
    }}>
      <Clock size={18} color="#8b5cf6" style={{ flexShrink: 0 }} />

      {/* Timer display */}
      <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
        <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="28" cy="28" r="24" fill="none"
            stroke={isBreak ? '#10b981' : '#8b5cf6'}
            strokeWidth="3"
            strokeDasharray={`${(progress / 100) * 150.8} 150.8`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', fontWeight: 700,
          color: isBreak ? '#10b981' : 'var(--text-primary)',
        }}>
          {minutes}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Info and controls */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isBreak ? '#10b981' : '#8b5cf6' }}>
          {isBreak ? 'Break Time' : 'Study Session'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
          <button
            onClick={() => { setIsRunning(!isRunning); sfx.playSelect(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.6rem', borderRadius: '6px',
              background: isRunning ? 'rgba(245,158,11,0.15)' : 'rgba(139,92,246,0.15)',
              color: isRunning ? '#f59e0b' : '#8b5cf6',
              border: `1px solid ${isRunning ? 'rgba(245,158,11,0.3)' : 'rgba(139,92,246,0.3)'}`,
              cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {isRunning ? <Pause size={12} /> : <Play size={12} />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={() => { handleReset(); sfx.playHover(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.6rem', borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--glass-border)',
              cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
