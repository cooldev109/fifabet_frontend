import type { Match, OddsHistory } from '../api/client';
import { targetGoalLines, leagueNames } from '../api/client';

interface OddsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  oddsHistory: OddsHistory[];
  isLoading: boolean;
}

export function OddsHistoryModal({ isOpen, onClose, match, oddsHistory, isLoading }: OddsHistoryModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  const targetLine = match ? (targetGoalLines[match.league_id] ?? 1.5) : 1.5;
  const leagueName = match ? (leagueNames[match.league_id] || `League ${match.league_id}`) : '';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#1f2937',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                Odds History
              </h2>
              {match && (
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#9ca3af' }}>
                  {match.home_team} vs {match.away_team}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                lineHeight: '1',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Match Info */}
        {match && (
          <div
            style={{
              padding: '16px 24px',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                  League
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  {leagueName}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Target Line
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  >
                    {targetLine}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Status
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      backgroundColor: match.touched_15 === 1 ? '#22c55e' : '#6b7280',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  >
                    {match.touched_15 === 1 ? 'Target Hit' : 'Not Hit'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            maxHeight: 'calc(80vh - 200px)',
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading odds history...
            </div>
          ) : oddsHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <p style={{ margin: 0 }}>No odds history recorded yet.</p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
                {oddsHistory.length} record{oddsHistory.length !== 1 ? 's' : ''} found
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {oddsHistory.map((odds, index) => {
                  const isTargetLine = odds.handicap === targetLine;
                  const time = odds.add_time
                    ? formatDate(odds.add_time)
                    : formatDate(odds.recorded_at);

                  return (
                    <div
                      key={odds.id || index}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: isTargetLine ? '#fef2f2' : '#f9fafb',
                        borderRadius: '8px',
                        border: isTargetLine ? '2px solid #ef4444' : '1px solid #e5e7eb',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '18px', color: isTargetLine ? '#ef4444' : '#1f2937' }}>
                            {odds.handicap ?? 'N/A'}
                          </span>
                          {isTargetLine && (
                            <span
                              style={{
                                padding: '2px 6px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                              }}
                            >
                              TARGET
                            </span>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {time}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1f2937',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default OddsHistoryModal;
