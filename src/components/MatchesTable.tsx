import type { Match } from '../api/client';

interface MatchesTableProps {
  matches: Match[];
  onViewOdds?: (matchId: string) => void;
}

const leagueNames: Record<number, string> = {
  23114: 'GT League',
  37298: 'H2H GG League',
  38439: 'Battle Volta',
  22614: 'Battle 8min',
};

// Target goal lines per league
const targetGoalLines: Record<number, number> = {
  23114: 2.5,   // GT League - 2.5 line
  37298: 1.5,   // H2H GG League - 1.5 line
  38439: 3.5,   // Battle Volta - 3.5 line
  22614: 3.5,   // Battle 8min - 3.5 line
};

export function MatchesTable({ matches, onViewOdds }: MatchesTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const isLive = status === 'live';
    return (
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          backgroundColor: isLive ? '#22c55e' : '#6b7280',
          color: 'white',
        }}
      >
        {isLive ? 'LIVE' : 'FINISHED'}
      </span>
    );
  };

  const getGoalLineBadge = (match: Match) => {
    // Use current_goal_line if available, otherwise fall back to detected_odds
    const goalLine = match.current_goal_line ?? match.detected_odds;
    const touchedTarget = match.touched_15 === 1; // touched_15 now means touched_target
    const targetLine = targetGoalLines[match.league_id] ?? 1.5;

    if (goalLine === null || goalLine === undefined) {
      return <span style={{ color: '#9ca3af' }}>N/A</span>;
    }

    // Show target indicator styling if match ever touched the league's target goal line
    const showTargetIndicator = touchedTarget;

    return (
      <span
        style={{
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          backgroundColor: showTargetIndicator ? '#ef4444' : '#fef3c7',
          color: showTargetIndicator ? 'white' : '#92400e',
          animation: showTargetIndicator ? 'pulse 1s infinite' : 'none',
        }}
        title={showTargetIndicator ? `Touched target ${targetLine}` : `Target: ${targetLine}`}
      >
        {showTargetIndicator && '🎯 '}
        {goalLine}
        {showTargetIndicator && ' 🎯'}
      </span>
    );
  };

  const getScoreDisplay = (match: Match) => {
    // For live matches, use current_score
    if (match.status === 'live') {
      if (match.current_score) {
        const [home, away] = match.current_score.split('-').map(s => parseInt(s.trim(), 10) || 0);
        const total = home + away;
        return (
          <div>
            <span style={{ fontWeight: 'bold', color: '#22c55e' }}>
              {match.current_score}
            </span>
            <span style={{ marginLeft: '8px', color: '#6b7280', fontSize: '12px' }}>
              (Total: {total})
            </span>
          </div>
        );
      }
      return <span style={{ color: '#9ca3af' }}>-</span>;
    }

    // For finished matches, use final scores
    if (match.final_score_home !== null && match.final_score_home !== undefined &&
        match.final_score_away !== null && match.final_score_away !== undefined) {
      const total = match.final_score_home + match.final_score_away;
      return (
        <div>
          <span style={{ fontWeight: 'bold' }}>
            {match.final_score_home} - {match.final_score_away}
          </span>
          <span style={{ marginLeft: '8px', color: '#6b7280', fontSize: '12px' }}>
            (Total: {total})
          </span>
        </div>
      );
    }

    // Fallback to current_score if final scores not available
    if (match.current_score) {
      const [home, away] = match.current_score.split('-').map(s => parseInt(s.trim(), 10) || 0);
      const total = home + away;
      return (
        <div>
          <span style={{ fontWeight: 'bold' }}>
            {match.current_score}
          </span>
          <span style={{ marginLeft: '8px', color: '#6b7280', fontSize: '12px' }}>
            (Total: {total})
          </span>
        </div>
      );
    }

    return <span style={{ color: '#9ca3af' }}>? - ?</span>;
  };

  if (matches.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
        No matches found
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th style={thStyle}>League</th>
            <th style={thStyle}>Match</th>
            <th style={thStyle}>Asian Goal Line</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Score</th>
            <th style={thStyle}>Detection Time</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => {
            // Highlight row if match ever touched target goal line
            const highlightRow = match.touched_15 === 1;
            return (
              <tr
                key={match.id}
                style={{
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: highlightRow ? '#fef2f2' : 'transparent',
                }}
              >
                <td style={tdStyle}>
                  <div>{leagueNames[match.league_id] || `League ${match.league_id}`}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    Target: {targetGoalLines[match.league_id] ?? 1.5}
                  </div>
                </td>
                <td style={tdStyle}>
                  <strong>{match.home_team}</strong>
                  <span style={{ margin: '0 8px', color: '#6b7280' }}>vs</span>
                  <strong>{match.away_team}</strong>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {getGoalLineBadge(match)}
                </td>
                <td style={tdStyle}>{getStatusBadge(match.status)}</td>
                <td style={tdStyle}>{getScoreDisplay(match)}</td>
                <td style={tdStyle}>{formatDate(match.detection_time)}</td>
                <td style={tdStyle}>
                  {onViewOdds && (
                    <button
                      onClick={() => onViewOdds(match.match_id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      View History
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  fontWeight: 'bold',
  fontSize: '14px',
  borderBottom: '2px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
};

export default MatchesTable;
