import React, { useState } from 'react';
import { GitBranch, ChevronDown, ChevronUp } from 'lucide-react';
import { CONCEPTS, Concept, getRelatedConcepts } from '../data/concepts';
import { ConceptCard } from './ConceptCard';
import { sfx } from '../utils/sfx';

export const ConceptExplorer: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  const categories = [...new Set(CONCEPTS.map(c => c.category))];

  return (
    <div className="glass-card animate-in" style={{
      padding: '1.25rem',
      marginTop: '1rem',
      borderLeft: '3px solid #06b6d4',
    }}>
      <button
        onClick={() => { setExpanded(!expanded); sfx.playSelect(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
          background: 'none', border: 'none', color: 'var(--text-primary)',
          cursor: 'pointer', padding: 0, fontSize: '1rem', fontWeight: 600,
        }}
      >
        <GitBranch size={18} color="#06b6d4" />
        <span>Concept Explorer</span>
        <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(6,182,212,0.15)', color: '#06b6d4', borderColor: 'rgba(6,182,212,0.3)' }}>
          {CONCEPTS.length} concepts
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {expanded && (
        <div style={{ marginTop: '1rem' }}>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button
              onClick={() => { setSelectedConcept(null); sfx.playHover(); }}
              style={{
                padding: '0.3rem 0.7rem', borderRadius: '6px',
                background: !selectedConcept ? 'rgba(6,182,212,0.2)' : 'transparent',
                color: !selectedConcept ? '#06b6d4' : 'var(--text-secondary)',
                border: `1px solid ${!selectedConcept ? 'rgba(6,182,212,0.3)' : 'var(--glass-border)'}`,
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                transition: 'all 0.15s ease',
              }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  const firstInCat = CONCEPTS.find(c => c.category === cat);
                  setSelectedConcept(firstInCat || null);
                  sfx.playHover();
                }}
                style={{
                  padding: '0.3rem 0.7rem', borderRadius: '6px',
                  background: selectedConcept?.category === cat ? 'rgba(6,182,212,0.2)' : 'transparent',
                  color: selectedConcept?.category === cat ? '#06b6d4' : 'var(--text-secondary)',
                  border: `1px solid ${selectedConcept?.category === cat ? 'rgba(6,182,212,0.3)' : 'var(--glass-border)'}`,
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Concept grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {(selectedConcept
              ? CONCEPTS.filter(c => c.category === selectedConcept.category)
              : CONCEPTS
            ).map(concept => (
              <ConceptCard
                key={concept.id}
                concept={concept}
              />
            ))}
          </div>

          {/* Connect the Dots - show when a concept is selected */}
          {selectedConcept && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Connect the Dots: {selectedConcept.name}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {getRelatedConcepts(selectedConcept.id).map(rel => (
                  <button
                    key={rel.id}
                    onClick={() => { setSelectedConcept(rel); sfx.playSelect(); }}
                    className="chip"
                    style={{
                      fontSize: '0.8rem', cursor: 'pointer',
                      background: 'rgba(6, 182, 212, 0.1)',
                      color: '#06b6d4',
                      borderColor: 'rgba(6, 182, 212, 0.25)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; }}
                  >
                    → {rel.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
