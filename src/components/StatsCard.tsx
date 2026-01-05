import { targetGoalLines, leagueNames } from '../api/client';
import type { Stats } from '../api/client';

interface StatsCardProps {
  stats: Stats | null;
  isLoading: boolean;
}

export function StatsCard({ stats, isLoading }: StatsCardProps) {
  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>Loading stats...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>No stats available</div>
      </div>
    );
  }

  // Calculate overall ratio (from finished matches only)
  const overallRatioValue = stats.finishedMatches > 0
    ? (stats.touchedTargetTotal / stats.finishedMatches) * 100
    : 0;
  const overallRatio = overallRatioValue.toFixed(1);

  return (
    <div style={containerStyle}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Statistics</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <StatBox label="Total Matches" value={stats.totalMatches} color="#3b82f6" />
        <StatBox label="Live" value={stats.liveMatches} color="#22c55e" />
        <StatBox label="Finished" value={stats.finishedMatches} color="#6b7280" />
        <StatBox
          label="Target Hit Rate"
          value={`${overallRatio}%`}
          color="#ef4444"
          subtitle={`${stats.touchedTargetTotal || 0} / ${stats.finishedMatches}`}
        />
      </div>

      {/* Target Hit Ratio by League */}
      {stats.touchedTargetByLeague && Object.keys(stats.touchedTargetByLeague).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>
            Target Hit Ratio by League
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(stats.touchedTargetByLeague).map(([leagueId, data]) => {
              const id = parseInt(leagueId, 10);
              const name = leagueNames[id] || `League ${id}`;
              const target = targetGoalLines[id] ?? 1.5;
              // Backend returns ratio as percentage value (e.g., 50.0 for 50%)
              const ratioPercent = data.ratio;
              const ratioDisplay = ratioPercent.toFixed(1);
              // Color thresholds based on percentage
              const getColor = (pct: number) => pct >= 50 ? '#22c55e' : pct >= 30 ? '#f59e0b' : '#ef4444';
              const barColor = getColor(ratioPercent);

              return (
                <div
                  key={leagueId}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${barColor}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                      {name} <span style={{ color: '#6b7280', fontWeight: 'normal' }}>(Target: {target})</span>
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: barColor }}>
                      {ratioDisplay}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', marginRight: '12px' }}>
                      <div
                        style={{
                          width: `${Math.min(ratioPercent, 100)}%`,
                          height: '100%',
                          backgroundColor: barColor,
                          borderRadius: '3px',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {data.touched} / {data.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
  subtitle,
}: {
  label: string;
  value: number | string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        textAlign: 'center',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{label}</div>
      {subtitle && (
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{subtitle}</div>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  padding: '20px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

export default StatsCard;
