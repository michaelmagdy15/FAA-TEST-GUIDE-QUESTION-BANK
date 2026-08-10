import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { getCategoryStats } from '../lib/progressTracker';

export const PerformanceCharts: React.FC = () => {
  const stats = getCategoryStats();

  if (stats.length === 0) return null;

  const maxTotal = Math.max(...stats.map(s => s.total));

  return (
    <div className="glass-card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <TrendingUp size={16} color="#a78bfa" />
        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Performance by Category</h3>
      </div>

      {/* SVG Bar Chart */}
      <div style={{ marginBottom: '0.75rem', overflowX: 'auto', width: '100%' }}>
        <svg width="100%" height={stats.length * 28 + 16} viewBox={`0 0 400 ${stats.length * 28 + 16}`} style={{ display: 'block', minWidth: 0 }}>
          {stats.map((stat, i) => {
            const y = i * 28 + 8;
            const barWidth = maxTotal > 0 ? (stat.total / maxTotal) * 180 : 0;
            const correctWidth = maxTotal > 0 ? (stat.correct / maxTotal) * 180 : 0;
            const acc = stat.accuracy;
            const barColor = acc >= 0.7 ? '#10b981' : acc >= 0.5 ? '#f59e0b' : '#ef4444';

            return (
              <g key={stat.category}>
                <text x={0} y={y + 12} fontSize="10" fill="#94a3b8" fontWeight="500">
                  {stat.category.length > 20 ? stat.category.slice(0, 20) + '...' : stat.category}
                </text>
                <rect x={180} y={y + 1} width={barWidth} height={14} rx={3} fill="rgba(255,255,255,0.06)" />
                <rect x={180} y={y + 1} width={correctWidth} height={14} rx={3} fill={barColor} opacity={0.85}>
                  <animate attributeName="width" from="0" to={correctWidth} dur="0.6s" fill="freeze" />
                </rect>
                <text x={370} y={y + 12} fontSize="10" fill={barColor} fontWeight="700" textAnchor="end">
                  {Math.round(acc * 100)}%
                </text>
                <text x={180 + barWidth + 6} y={y + 12} fontSize="9" fill="#64748b" textAnchor="start">
                  {stat.correct}/{stat.total}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Weak areas callout */}
      {stats.filter(s => s.accuracy < 0.6 && s.total >= 3).length > 0 && (
        <div style={{
          padding: '0.5rem', borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
            <TrendingDown size={12} color="#ef4444" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444' }}>Weak Areas Need Attention</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {stats.filter(s => s.accuracy < 0.6 && s.total >= 3).map(s => s.category).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};
