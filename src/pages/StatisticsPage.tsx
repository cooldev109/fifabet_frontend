import { useNavigate } from 'react-router-dom';
import { targetGoalLines, leagueNames } from '../api/client';
import type { Stats } from '../api/client';

interface StatisticsPageProps {
  stats: Stats | null;
  isLoading: boolean;
}

export function StatisticsPage({ stats, isLoading }: StatisticsPageProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        Loading statistics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        No statistics available
      </div>
    );
  }

  // Calculate overall ratio (from finished matches only)
  const overallRatioValue = stats.finishedMatches > 0
    ? (stats.touchedTargetTotal / stats.finishedMatches) * 100
    : 0;
  const overallRatio = overallRatioValue.toFixed(1);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
          Statistics
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
          Overview of match tracking and target hit ratios
        </p>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <SummaryCard
          title="Total Matches"
          value={stats.totalMatches}
          color="#3b82f6"
          icon="📋"
        />
        <SummaryCard
          title="Live Matches"
          value={stats.liveMatches}
          color="#22c55e"
          icon="🔴"
        />
        <SummaryCard
          title="Finished Matches"
          value={stats.finishedMatches}
          color="#6b7280"
          icon="✅"
        />
        <SummaryCard
          title="Target Hit Rate"
          value={`${overallRatio}%`}
          subtitle={`${stats.touchedTargetTotal || 0} / ${stats.finishedMatches}`}
          color="#ef4444"
          icon="🎯"
        />
      </div>

      {/* Target Hit Ratio by League */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px',
        }}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
          Target Hit Ratio by League
        </h2>

        {stats.touchedTargetByLeague && Object.keys(stats.touchedTargetByLeague).length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {Object.entries(stats.touchedTargetByLeague).map(([leagueId, data]) => {
              const id = parseInt(leagueId, 10);
              const name = leagueNames[id] || `League ${id}`;
              const target = targetGoalLines[id] ?? 1.5;
              const ratioPercent = data.ratio;
              const ratioDisplay = ratioPercent.toFixed(1);
              const getColor = (pct: number) => pct >= 50 ? '#22c55e' : pct >= 30 ? '#f59e0b' : '#ef4444';
              const barColor = getColor(ratioPercent);

              return (
                <div
                  key={leagueId}
                  onClick={() => navigate(`/league/${leagueId}`)}
                  style={{
                    padding: '20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
                        {name}
                      </h3>
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          padding: '2px 8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      >
                        Target: {target}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: barColor }}>
                        {ratioDisplay}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {data.touched} / {data.total} matches
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(ratioPercent, 100)}%`,
                        height: '100%',
                        backgroundColor: barColor,
                        borderRadius: '4px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>

                  {/* Click hint */}
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#3b82f6', textAlign: 'right' }}>
                    Click for detailed analysis &rarr;
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No league data available yet
          </div>
        )}
      </div>

      {/* League Overview Table */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px',
          marginTop: '24px',
        }}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
          League Overview
        </h2>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={thStyle}>League</th>
              <th style={thStyle}>Target Line</th>
              <th style={thStyle}>Total Matches</th>
              <th style={thStyle}>Target Hits</th>
              <th style={thStyle}>Hit Rate</th>
            </tr>
          </thead>
          <tbody>
            {stats.touchedTargetByLeague && Object.entries(stats.touchedTargetByLeague).map(([leagueId, data]) => {
              const id = parseInt(leagueId, 10);
              const name = leagueNames[id] || `League ${id}`;
              const target = targetGoalLines[id] ?? 1.5;
              const ratioPercent = data.ratio;
              const getColor = (pct: number) => pct >= 50 ? '#22c55e' : pct >= 30 ? '#f59e0b' : '#ef4444';

              return (
                <tr key={leagueId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: '600' }}>{name}</span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {target}
                    </span>
                  </td>
                  <td style={tdStyle}>{data.total}</td>
                  <td style={tdStyle}>{data.touched}</td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 'bold', color: getColor(ratioPercent) }}>
                      {ratioPercent.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  color,
  icon,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  color: string;
  icon: string;
}) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</div>
          {subtitle && (
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{subtitle}</div>
          )}
        </div>
        <div style={{ fontSize: '32px' }}>{icon}</div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: 'bold',
  fontSize: '13px',
  color: '#374151',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
};

export default StatisticsPage;
