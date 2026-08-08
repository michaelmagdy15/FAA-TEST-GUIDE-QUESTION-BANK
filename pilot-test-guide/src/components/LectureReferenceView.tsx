import React from 'react';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { LectureReference as LectureRef, formatTimestamp } from '../lib/transcriptSearch';
import { findExternalVideos } from '../data/externalVideos';

interface Props {
  references: LectureRef[];
  questionText: string;
  explanation?: string;
  loading: boolean;
}

export const LectureReferenceView: React.FC<Props> = ({ references, questionText, explanation, loading }) => {
  const [expanded, setExpanded] = React.useState(true);
  const externalVideos = React.useMemo(
    () => findExternalVideos(questionText, explanation, 2),
    [questionText, explanation]
  );

  if (loading) {
    return (
      <div className="glass-card animate-in" style={{ marginTop: '1rem', padding: '1rem 1.25rem', borderLeft: '3px solid #8b5cf6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <BookOpen size={16} style={{ color: '#8b5cf6', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: '0.9rem' }}>Finding relevant lectures...</span>
        </div>
      </div>
    );
  }

  if (references.length === 0 && externalVideos.length === 0) return null;

  const totalCount = references.length + externalVideos.length;

  return (
    <div className="glass-card animate-in" style={{ marginTop: '1rem', padding: '1.25rem', borderLeft: '3px solid #8b5cf6' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
          background: 'none', border: 'none', color: 'var(--text-primary)',
          cursor: 'pointer', padding: 0, fontSize: '1rem', fontWeight: 600,
        }}
      >
        <BookOpen size={18} style={{ color: '#8b5cf6', flexShrink: 0 }} />
        <span>Video References</span>
        <span className="chip" style={{ fontSize: '0.75rem', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.3)', marginLeft: '0.4rem' }}>
          {totalCount} {totalCount === 1 ? 'resource' : 'resources'}
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {expanded && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* MIT Ground School lectures */}
          {references.map((ref) => {
            const ytUrl = `https://www.youtube.com/watch?v=${ref.lecture.videoId}&t=${Math.floor(ref.timestamp)}s`;
            const ts = formatTimestamp(ref.timestamp);
            return (
              <div
                key={`mit-${ref.lecture.num}`}
                className="glass-card"
                style={{
                  padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem',
                  borderColor: ref.relevance === 'high' ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.2)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ref.relevance === 'high' ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.2)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.3)' }}>
                    Lecture {ref.lecture.num}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ref.lecture.title}</span>
                  {ref.relevance === 'high' && (
                    <span className="chip" style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                      Best match
                    </span>
                  )}
                </div>

                {ref.context && (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    &ldquo;{ref.context}&rdquo;
                  </p>
                )}

                <a
                  href={ytUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    color: '#8b5cf6', textDecoration: 'none', fontWeight: 600,
                    fontSize: '0.85rem', padding: '0.3rem 0.6rem', borderRadius: '6px',
                    background: 'rgba(139,92,246,0.1)', transition: 'all 0.15s ease',
                    width: 'fit-content',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}
                >
                  <ExternalLink size={13} />
                  Watch at {ts}
                </a>
              </div>
            );
          })}

          {/* External curated videos */}
          {externalVideos.map((vid) => {
            const ytUrl = vid.startTime
              ? `https://www.youtube.com/watch?v=${vid.videoId}&t=${vid.startTime}s`
              : `https://www.youtube.com/watch?v=${vid.videoId}`;
            return (
              <div
                key={`ext-${vid.videoId}`}
                className="glass-card"
                style={{
                  padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem',
                  borderColor: 'rgba(59,130,246,0.25)', transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.3)' }}>
                    <Play size={10} style={{ marginRight: '2px' }} />
                    External
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{vid.title}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{vid.channel}</span>

                <a
                  href={ytUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    color: '#3b82f6', textDecoration: 'none', fontWeight: 600,
                    fontSize: '0.85rem', padding: '0.3rem 0.6rem', borderRadius: '6px',
                    background: 'rgba(59,130,246,0.1)', transition: 'all 0.15s ease',
                    width: 'fit-content',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                >
                  <ExternalLink size={13} />
                  Watch on YouTube
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
