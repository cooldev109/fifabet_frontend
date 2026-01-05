import { useState } from 'react';
import api from '../api/client';

interface TrackerControlProps {
  isRunning: boolean;
  onStatusChange: () => void;
}

export function TrackerControl({ isRunning, onStatusChange }: TrackerControlProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await api.startTracker();
      onStatusChange();
    } catch (error) {
      console.error('Failed to start tracker:', error);
      alert('Failed to start tracker');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    try {
      await api.stopTracker();
      onStatusChange();
    } catch (error) {
      console.error('Failed to stop tracker:', error);
      alert('Failed to stop tracker');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestTelegram = async () => {
    setIsLoading(true);
    try {
      const result = await api.testTelegram();
      alert(result.message);
    } catch (error) {
      console.error('Failed to send test message:', error);
      alert('Failed to send test message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: isRunning ? '#22c55e' : '#ef4444',
          }}
        />
        <span style={{ fontWeight: 'bold' }}>
          Tracker: {isRunning ? 'Running' : 'Stopped'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            style={{
              ...buttonStyle,
              backgroundColor: '#22c55e',
            }}
          >
            {isLoading ? 'Starting...' : 'Start Tracker'}
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={isLoading}
            style={{
              ...buttonStyle,
              backgroundColor: '#ef4444',
            }}
          >
            {isLoading ? 'Stopping...' : 'Stop Tracker'}
          </button>
        )}

        <button
          onClick={handleTestTelegram}
          disabled={isLoading}
          style={{
            ...buttonStyle,
            backgroundColor: '#3b82f6',
          }}
        >
          Test Telegram
        </button>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  padding: '16px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '14px',
};

export default TrackerControl;
