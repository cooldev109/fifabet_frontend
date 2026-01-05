import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import api from '../api/client';
import type { GoalLineStat } from '../api/client';

interface LeagueData {
  leagueId: number;
  leagueName: string;
  targetLine: number;
  totalMatches: number;
  goalLineStats: GoalLineStat[];
}

export function LeagueDetailPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [showOverHits, setShowOverHits] = useState(true); // true = Over, false = Under

  const id = parseInt(leagueId || '0', 10);

  const fetchLeagueData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getLeagueStats(id);
      setLeagueData({
        leagueId: data.leagueId,
        leagueName: data.leagueName,
        targetLine: data.targetLine,
        totalMatches: data.totalMatches,
        goalLineStats: data.goalLineStats,
      });
    } catch (err: any) {
      console.error('Failed to fetch league data:', err);
      setError(err.message || 'Failed to load league data');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeagueData();
  }, [fetchLeagueData]);

  const getColor = (pct: number) =>
    pct >= 52.63 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        <div style={{ marginBottom: '16px' }}>Loading league data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        <div style={{ marginBottom: '16px' }}>Error: {error}</div>
        <button
          onClick={() => navigate('/statistics')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1f2937',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Back to Statistics
        </button>
      </div>
    );
  }

  if (!leagueData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const { leagueName, targetLine, totalMatches, goalLineStats } = leagueData;
  const targetStats = goalLineStats.find((g) => g.goalLine === targetLine);

  return (
    <div>
      {/* Back Button & Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/statistics')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          &larr; Back to Statistics
        </button>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
          {leagueName}
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
          Detailed analysis for target goal line:{' '}
          <strong style={{ color: '#ef4444' }}>{targetLine}</strong>
        </p>
      </div>

      {/* Key Metrics */}
      <div
        style={{
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          color: 'white',
        }}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>
          Strategy Evaluation Metrics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <MetricCard
            label="Total Matches"
            value={totalMatches}
            subtitle="Finished matches tracked"
            color="#3b82f6"
          />
          <MetricCard
            label="Target Line Availability"
            value={targetStats ? targetStats.timesAvailable : 0}
            subtitle={`Times ${targetLine} was available`}
            color="#8b5cf6"
          />
          <MetricCard
            label="Hit Rate (Target)"
            value={targetStats ? `${targetStats.hitRate}%` : 'N/A'}
            subtitle={`When ${targetLine} was available`}
            color={targetStats ? getColor(targetStats.hitRate) : '#6b7280'}
            highlight
          />
          <MetricCard
            label="ROI (Target)"
            value={targetStats ? `${targetStats.roi >= 0 ? '+' : ''}${targetStats.roi}%` : 'N/A'}
            subtitle="At standard 1.90 odds"
            color={targetStats && targetStats.roi >= 0 ? '#22c55e' : '#ef4444'}
            highlight
          />
        </div>
      </div>

      {/* Charts Section */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}
      >
        {/* Hit Rate by Goal Line Chart */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
            Hit Rate by Goal Line
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#6b7280' }}>
            Percentage of matches where Over hit for each goal line
          </p>
          {goalLineStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={goalLineStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="goalLine" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Hit Rate']}
                  labelFormatter={(label) => `Goal Line: ${label}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <ReferenceLine
                  y={52.63}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  label={{ value: 'Break-even (52.63%)', fontSize: 10, fill: '#f59e0b' }}
                />
                <Bar dataKey="hitRate" name="Hit Rate" radius={[4, 4, 0, 0]}>
                  {goalLineStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.goalLine === targetLine
                          ? '#ef4444'
                          : entry.hitRate >= 52.63
                          ? '#22c55e'
                          : '#6b7280'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No data available
            </div>
          )}
        </div>

        {/* ROI by Goal Line Chart */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
            ROI by Goal Line
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#6b7280' }}>
            Expected return on investment at standard 1.90 odds
          </p>
          {goalLineStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={goalLineStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="goalLine" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'ROI']}
                  labelFormatter={(label) => `Goal Line: ${label}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <ReferenceLine y={0} stroke="#1f2937" strokeWidth={2} />
                <Bar dataKey="roi" name="ROI" radius={[4, 4, 0, 0]}>
                  {goalLineStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.goalLine === targetLine
                          ? '#ef4444'
                          : entry.roi >= 0
                          ? '#22c55e'
                          : '#6b7280'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Sample Size by Goal Line */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
          Sample Size by Goal Line
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#6b7280' }}>
          Number of times each goal line was available to bet (from database)
        </p>
        {goalLineStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={goalLineStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="goalLine" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [value, 'Times Available']}
                labelFormatter={(label) => `Goal Line: ${label}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="timesAvailable" name="Times Available" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {goalLineStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.goalLine === targetLine ? '#ef4444' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No data available
          </div>
        )}
      </div>

      {/* Goal Line Statistics Table */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showTable ? '16px' : '0' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
            Goal Line Statistics
          </h3>
          <button
            onClick={() => setShowTable(!showTable)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: showTable ? '#1f2937' : '#f3f4f6',
              color: showTable ? 'white' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
          >
            {showTable ? 'Hide Table' : 'Show Table'}
            <span style={{ transform: showTable ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
              ▼
            </span>
          </button>
        </div>
        {showTable && (
        <>
          {/* Over/Under Toggle */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Show:</span>
            <div
              style={{
                display: 'inline-flex',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setShowOverHits(true)}
                style={{
                  padding: '6px 16px',
                  border: 'none',
                  backgroundColor: showOverHits ? '#22c55e' : '#f3f4f6',
                  color: showOverHits ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
              >
                Over
              </button>
              <button
                onClick={() => setShowOverHits(false)}
                style={{
                  padding: '6px 16px',
                  border: 'none',
                  borderLeft: '1px solid #d1d5db',
                  backgroundColor: !showOverHits ? '#ef4444' : '#f3f4f6',
                  color: !showOverHits ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
              >
                Under
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={thStyle}>Goal Line</th>
                <th style={thStyle}>Times Available</th>
                <th style={thStyle}>{showOverHits ? 'Over Hits' : 'Under Hits'}</th>
                <th style={thStyle}>Hit Rate</th>
                <th style={thStyle}>ROI (at 1.90)</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {goalLineStats.map((row) => {
                const isTarget = row.goalLine === targetLine;
                // Calculate Under stats from Over stats
                const underHits = row.timesAvailable - row.overHits;
                const underHitRate = row.timesAvailable > 0
                  ? parseFloat(((underHits / row.timesAvailable) * 100).toFixed(1))
                  : 0;
                const underRoi = parseFloat((underHitRate * 1.9 - 100).toFixed(1));

                // Use Over or Under based on toggle
                const displayHits = showOverHits ? row.overHits : underHits;
                const displayHitRate = showOverHits ? row.hitRate : underHitRate;
                const displayRoi = showOverHits ? row.roi : underRoi;
                const isProfitable = displayRoi >= 0;

                return (
                  <tr
                    key={row.goalLine}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: isTarget ? '#fef2f2' : 'transparent',
                    }}
                  >
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontWeight: isTarget ? 'bold' : 'normal',
                          color: isTarget ? '#ef4444' : '#1f2937',
                        }}
                      >
                        {row.goalLine}
                        {isTarget && (
                          <span
                            style={{
                              marginLeft: '8px',
                              padding: '2px 6px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              borderRadius: '4px',
                              fontSize: '10px',
                            }}
                          >
                            TARGET
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={tdStyle}>{row.timesAvailable}</td>
                    <td style={tdStyle}>{displayHits}</td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 'bold', color: getColor(displayHitRate) }}>
                        {displayHitRate}%
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: isProfitable ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {displayRoi >= 0 ? '+' : ''}
                        {displayRoi}%
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: isProfitable ? '#dcfce7' : '#fee2e2',
                          color: isProfitable ? '#166534' : '#991b1b',
                        }}
                      >
                        {isProfitable ? 'Profitable' : 'Not Profitable'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  color,
  highlight,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: highlight ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        border: highlight ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</div>
      {subtitle && (
        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{subtitle}</div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: 'bold',
  fontSize: '12px',
  color: '#374151',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '13px',
};

export default LeagueDetailPage;
