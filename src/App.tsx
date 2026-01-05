import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import api, { authStorage } from './api/client';
import type { Match, Stats, OddsHistory, User } from './api/client';
import { Sidebar } from './components/Sidebar';
import { OddsHistoryModal } from './components/OddsHistoryModal';
import { HomePage } from './pages/HomePage';
import { StatisticsPage } from './pages/StatisticsPage';
import { LeagueDetailPage } from './pages/LeagueDetailPage';
import { LandingPage } from './pages/LandingPage';
import './App.css';

type Tab = 'live' | 'history';

const ITEMS_PER_PAGE = 20;

function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(authStorage.isAuthenticated());
  const [_user, setUser] = useState<User | null>(authStorage.getUser());

  const [activeTab, setActiveTab] = useState<Tab>('live');
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isTrackerRunning, setIsTrackerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<number | undefined>(undefined);
  const [tablePage, setTablePage] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [oddsHistory, setOddsHistory] = useState<OddsHistory[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Auth handlers
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(email, password);
      if (response.success && response.user) {
        setIsAuthenticated(true);
        setUser(response.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSignUp = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.signUp(email, password);
      return response.success;
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const fetchHealth = useCallback(async () => {
    try {
      const data = await api.getHealth();
      setIsTrackerRunning(data.trackerRunning);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    }
  }, []);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'live') {
        const data = await api.getTrackedMatches();
        setMatches(data.matches);
        setTotalMatches(data.count);
      } else {
        const offset = (tablePage - 1) * ITEMS_PER_PAGE;
        const data = await api.getHistory({
          status: 'finished',
          league_id: selectedLeague,
          limit: ITEMS_PER_PAGE,
          offset,
        });
        setMatches(data.matches);
        setTotalMatches(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedLeague, tablePage]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchHealth();
    fetchStats();
    fetchMatches();

    const interval = setInterval(() => {
      fetchHealth();
      fetchStats();
      fetchMatches();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchHealth, fetchStats, fetchMatches, isAuthenticated]);

  const handleViewOdds = async (matchId: string) => {
    setIsModalOpen(true);
    setIsModalLoading(true);
    setOddsHistory([]);
    setSelectedMatch(null);

    try {
      const data = await api.getOddsHistory(matchId);
      setSelectedMatch(data.match);
      setOddsHistory(data.oddsHistory);
    } catch (error) {
      console.error('Failed to fetch odds history:', error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
    setOddsHistory([]);
  };

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <LandingPage onLogin={handleLogin} onSignUp={handleSignUp} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        {/* Sidebar */}
        <Sidebar onLogout={handleLogout} />

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            marginLeft: '220px',
            padding: '24px',
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  stats={stats}
                  matches={matches}
                  isLoading={isLoading}
                  isTrackerRunning={isTrackerRunning}
                  activeTab={activeTab}
                  selectedLeague={selectedLeague}
                  tablePage={tablePage}
                  totalMatches={totalMatches}
                  onTabChange={setActiveTab}
                  onLeagueChange={setSelectedLeague}
                  onPageChange={setTablePage}
                  onViewOdds={handleViewOdds}
                  onTrackerStatusChange={fetchHealth}
                />
              }
            />
            <Route
              path="/statistics"
              element={<StatisticsPage stats={stats} isLoading={!stats} />}
            />
            <Route
              path="/league/:leagueId"
              element={<LeagueDetailPage />}
            />
          </Routes>
        </main>

        {/* Odds History Modal */}
        <OddsHistoryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          match={selectedMatch}
          oddsHistory={oddsHistory}
          isLoading={isModalLoading}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
