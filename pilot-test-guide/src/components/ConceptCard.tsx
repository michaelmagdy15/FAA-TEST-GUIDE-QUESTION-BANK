import React, { useState } from 'react';
import { Concept } from '../data/concepts';
import { ChevronDown, ChevronUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { sfx } from '../utils/sfx';

interface Props {
  concept: Concept;
  compact?: boolean;
}

export const ConceptCard: React.FC<Props> = ({ concept, compact }) => {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <span
        className="chip"
        style={{
          fontSize: '0.75rem',
          background: 'rgba(6, 182, 212, 0.1)',
          color: '#06b6d4',
          borderColor: 'rgba(6, 182, 212, 0.25)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onClick={() => { setExpanded(!expanded); sfx.playHover(); }}
        onMouseEnter={() => sfx.playHover()}
      >
        {concept.name}
        {expanded ? ' ▲' : ' ▼'}
      </span>
    );
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.25rem',
        borderColor: expanded ? '#06b6d4' : 'var(--glass-border)',
        transition: 'all 0.2s ease',
      }}
    >
      <button
        onClick={() => { setExpanded(!expanded); sfx.playSelect(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
          background: 'none', border: 'none', color: 'var(--text-primary)',
          cursor: 'pointer', padding: 0, fontSize: '1rem', fontWeight: 600,
          textAlign: 'left',
        }}
      >
        <span style={{ color: '#06b6d4', fontWeight: 700 }}>{concept.name}</span>
        <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(6,182,212,0.12)', color: '#06b6d4', borderColor: 'rgba(6,182,212,0.2)' }}>
          {concept.category}
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {concept.description}
      </p>

      {expanded && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Key Facts */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Lightbulb size={14} color="#10b981" />
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#10b981' }}>Key Facts</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {concept.keyFacts.map((fact, i) => (
                <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{fact}</li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes */}
          {concept.commonMistakes.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={14} color="#f59e0b" />
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f59e0b' }}>Common Mistakes</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {concept.commonMistakes.map((mistake, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{mistake}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
