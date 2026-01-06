import { useCallback } from 'react';
import { targetGoalLines, leagueNames } from '../api/client';
import type { Match, Stats } from '../api/client';
import { MatchesTable } from '../components/MatchesTable';
import { TrackerControl } from '../components/TrackerControl';

type Tab = 'live' | 'history';

const ITEMS_PER_PAGE = 20;

interface HomePageProps {
  stats: Stats | null;
  matches: Match[];
  isLoading: boolean;
  isTrackerRunning: boolean;
  activeTab: Tab;
  selectedLeague: number | undefined;
  tablePage: number;
  totalMatches: number;
  onTabChange: (tab: Tab) => void;
  onLeagueChange: (leagueId: number | undefined) => void;
  onPageChange: (page: number) => void;
  onViewOdds: (matchId: string) => void;
  onTrackerStatusChange: () => void;
}

export function HomePage({
  stats,
  matches,
  isLoading,
  isTrackerRunning,
  activeTab,
  selectedLeague,
  tablePage,
  totalMatches,
  onTabChange,
  onLeagueChange,
  onPageChange,
  onViewOdds,
  onTrackerStatusChange,
}: HomePageProps) {
  const totalPages = Math.ceil(totalMatches / ITEMS_PER_PAGE);

  const handlePrintPDF = useCallback(() => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print as PDF');
      return;
    }

    const tabTitle = activeTab === 'live' ? 'Live Matches' : 'History';
    const leagueName = selectedLeague ? leagueNames[selectedLeague] || `League ${selectedLeague}` : 'All Leagues';
    const timestamp = new Date().toLocaleString();

    // Generate table rows
    const tableRows = matches.map((match) => {
      const league = leagueNames[match.league_id] || `League ${match.league_id}`;
      const _target = targetGoalLines[match.league_id] ?? 1.5;
      const score = match.final_score_home !== undefined && match.final_score_away !== undefined
        ? `${match.final_score_home} - ${match.final_score_away}`
        : match.current_score || '-';
      const totalGoals = match.final_score_home !== undefined && match.final_score_away !== undefined
        ? match.final_score_home + match.final_score_away
        : null;
      const detectionTime = match.detection_time
        ? new Date(match.detection_time).toLocaleString()
        : '-';
      const goalLine = match.touched_15
        ? match.detected_odds
        : (match.current_goal_line ?? match.detected_odds ?? '-');
      const touchedTarget = match.touched_15 ? 'Yes' : 'No';

      return `
        <tr>
          <td>${league}</td>
          <td>${match.home_team} vs ${match.away_team}</td>
          <td style="text-align: center;">${goalLine}</td>
          <td style="text-align: center;">${match.status.toUpperCase()}</td>
          <td style="text-align: center;">${score}${totalGoals !== null ? ` (${totalGoals})` : ''}</td>
          <td style="text-align: center;">${touchedTarget}</td>
          <td>${detectionTime}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bet Tracker - ${tabTitle}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            font-size: 12px;
          }
          h1 { font-size: 20px; margin-bottom: 8px; }
          .subtitle { color: #666; margin-bottom: 16px; font-size: 12px; }
          .meta {
            display: flex;
            gap: 24px;
            margin-bottom: 16px;
            padding: 12px;
            background: #f5f5f5;
            border-radius: 4px;
          }
          .meta-item { }
          .meta-label { font-weight: bold; color: #333; }
          .meta-value { color: #666; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
            font-size: 11px;
          }
          th {
            background: #1f2937;
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) { background: #f9fafb; }
          .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
            color: #666;
            font-size: 10px;
            text-align: center;
          }
          @media print {
            body { padding: 10px; }
            .meta { page-break-inside: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>Bet Tracker - ${tabTitle}</h1>
        <div class="subtitle">Match data export</div>

        <div class="meta">
          <div class="meta-item">
            <span class="meta-label">Generated:</span>
            <span class="meta-value">${timestamp}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">League:</span>
            <span class="meta-value">${leagueName}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Total Matches:</span>
            <span class="meta-value">${matches.length}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>League</th>
              <th>Match</th>
              <th style="text-align: center;">Goal Line</th>
              <th style="text-align: center;">Status</th>
              <th style="text-align: center;">Score</th>
              <th style="text-align: center;">Touched Target</th>
              <th>Detection Time</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          Generated by Bet Tracker | ${timestamp}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }, [activeTab, selectedLeague, matches]);

  return (
    <>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
          Dashboard
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
          Monitor live matches and track goal line movements
        </p>
      </div>

      {/* Tracker Control */}
      <div style={{ marginBottom: '24px' }}>
        <TrackerControl isRunning={isTrackerRunning} onStatusChange={onTrackerStatusChange} />
      </div>

      {/* Tabs */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e5e7eb',
            padding: '0 16px',
          }}
        >
          <button
            onClick={() => { onTabChange('live'); onPageChange(1); }}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              color: activeTab === 'live' ? '#3b82f6' : '#6b7280',
              borderBottom: activeTab === 'live' ? '2px solid #3b82f6' : '2px solid transparent',
            }}
          >
            Live Matches ({stats?.liveMatches || 0})
          </button>
          <button
            onClick={() => { onTabChange('history'); onPageChange(1); }}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              color: activeTab === 'history' ? '#3b82f6' : '#6b7280',
              borderBottom: activeTab === 'history' ? '2px solid #3b82f6' : '2px solid transparent',
            }}
          >
            History ({stats?.finishedMatches || 0})
          </button>

          {/* League Filter (for history tab) and Print PDF Button */}
          <div style={{ marginLeft: 'auto', padding: '12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activeTab === 'history' && (
              <select
                value={selectedLeague || ''}
                onChange={(e) => {
                  onLeagueChange(e.target.value ? parseInt(e.target.value, 10) : undefined);
                  onPageChange(1);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                }}
              >
                <option value="">All Leagues</option>
                <option value="23114">GT League ({targetGoalLines[23114]})</option>
                <option value="37298">H2H GG League ({targetGoalLines[37298]})</option>
                <option value="38439">Battle Volta ({targetGoalLines[38439]})</option>
                <option value="22614">Battle 8min ({targetGoalLines[22614]})</option>
              </select>
            )}
            <button
              onClick={handlePrintPDF}
              disabled={matches.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: matches.length === 0 ? '#9ca3af' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: matches.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (matches.length > 0) {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }
              }}
              onMouseLeave={(e) => {
                if (matches.length > 0) {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>&#128438;</span>
              Print as PDF
            </button>
          </div>
        </div>

        {/* Matches Table */}
        <div style={{ padding: '16px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading matches...
            </div>
          ) : (
            <MatchesTable matches={matches} onViewOdds={onViewOdds} />
          )}
        </div>

        {/* Pagination (for history tab) */}
        {activeTab === 'history' && totalMatches > ITEMS_PER_PAGE && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              padding: '16px',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <button
              onClick={() => onPageChange(1)}
              disabled={tablePage === 1}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: tablePage === 1 ? '#f3f4f6' : 'white',
                color: tablePage === 1 ? '#9ca3af' : '#374151',
                cursor: tablePage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              First
            </button>
            <button
              onClick={() => onPageChange(Math.max(1, tablePage - 1))}
              disabled={tablePage === 1}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: tablePage === 1 ? '#f3f4f6' : 'white',
                color: tablePage === 1 ? '#9ca3af' : '#374151',
                cursor: tablePage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              Previous
            </button>

            <span style={{ padding: '0 16px', color: '#374151', fontSize: '14px' }}>
              Page {tablePage} of {totalPages}
              <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                ({totalMatches} total)
              </span>
            </span>

            <button
              onClick={() => onPageChange(Math.min(totalPages, tablePage + 1))}
              disabled={tablePage >= totalPages}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: tablePage >= totalPages ? '#f3f4f6' : 'white',
                color: tablePage >= totalPages ? '#9ca3af' : '#374151',
                cursor: tablePage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              Next
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={tablePage >= totalPages}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: tablePage >= totalPages ? '#f3f4f6' : 'white',
                color: tablePage >= totalPages ? '#9ca3af' : '#374151',
                cursor: tablePage >= totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              Last
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default HomePage;
