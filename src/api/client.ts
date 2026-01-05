import axios from 'axios';

// Use relative URL for proxy in development, or full URL if VITE_API_URL is set
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth types
export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

// Auth storage keys
const AUTH_TOKEN_KEY = 'bet_tracker_token';
const AUTH_USER_KEY = 'bet_tracker_user';

// Auth helper functions
export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  setToken: (token: string): void => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  removeToken: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
  getUser: (): User | null => {
    const user = localStorage.getItem(AUTH_USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: User): void => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },
  removeUser: (): void => {
    localStorage.removeItem(AUTH_USER_KEY);
  },
  clear: (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },
};

// Add auth header to requests if token exists
apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Match {
  id: number;
  match_id: string;
  bet365_id?: string;
  league_id: number;
  home_team: string;
  away_team: string;
  detection_time: string;
  detected_odds?: number;       // Initial/first detected goal line (stays at 1.5 if match touched 1.5)
  current_goal_line?: number;   // Current/latest goal line value
  current_score?: string;
  status: 'live' | 'finished';
  final_score_home?: number;
  final_score_away?: number;
  match_end_time?: string;
  alert_sent?: number;
  result_alert_sent?: number;
  touched_15?: number;  // 1 if match ever reached goal line 1.5
  created_at?: string;
  updated_at?: string;
}

export interface OddsHistory {
  id: number;
  match_id: string;
  odds_value?: number;
  handicap?: number;
  add_time?: string;
  recorded_at?: string;
}

export interface League {
  id: number;
  name: string;
}

export interface Stats {
  totalMatches: number;
  liveMatches: number;
  finishedMatches: number;
  touchedTargetTotal: number;
  byLeague: Record<number, number>;
  touchedTargetByLeague: Record<number, { total: number; touched: number; ratio: number }>;
  leagueStats: Array<{
    leagueId: number;
    leagueName: string;
    count: number;
  }>;
}

export interface GoalLineStat {
  goalLine: number;
  timesAvailable: number;
  overHits: number;
  hitRate: number;
  roi: number;
}

export interface LeagueGoalLineStats {
  success: boolean;
  leagueId: number;
  leagueName: string;
  targetLine: number;
  totalMatches: number;
  goalLineStats: GoalLineStat[];
}

// Target goal lines per league
export const targetGoalLines: Record<number, number> = {
  23114: 2.5,   // GT League - 2.5 line
  37298: 1.5,   // H2H GG League - 1.5 line
  38439: 3.5,   // Battle Volta - 3.5 line
  22614: 3.5,   // Battle 8min - 3.5 line
};

// League names mapping
export const leagueNames: Record<number, string> = {
  23114: 'GT League',
  37298: 'H2H GG League',
  38439: 'Battle Volta',
  22614: 'Battle 8min',
};

// API functions
export const api = {
  // Auth - Sign up
  signUp: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/signup', { email, password });
    return response.data;
  },

  // Auth - Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', { email, password });
    if (response.data.success && response.data.token && response.data.user) {
      authStorage.setToken(response.data.token);
      authStorage.setUser(response.data.user);
    }
    return response.data;
  },

  // Auth - Logout
  logout: (): void => {
    authStorage.clear();
  },

  // Health check
  getHealth: async () => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },

  // Get tracked (live) matches
  getTrackedMatches: async () => {
    const response = await apiClient.get<{ success: boolean; count: number; matches: Match[] }>(
      '/api/tracked'
    );
    return response.data;
  },

  // Get history
  getHistory: async (params?: {
    status?: 'live' | 'finished';
    league_id?: number;
    limit?: number;
    offset?: number;
  }) => {
    const response = await apiClient.get<{ success: boolean; count: number; total: number; matches: Match[] }>(
      '/api/history',
      { params }
    );
    return response.data;
  },

  // Get stats
  getStats: async () => {
    const response = await apiClient.get<{ success: boolean; stats: Stats }>('/api/stats');
    return response.data;
  },

  // Get odds history for a match
  getOddsHistory: async (matchId: string) => {
    const response = await apiClient.get<{
      success: boolean;
      match: Match;
      oddsHistory: OddsHistory[];
    }>(`/api/odds-history/${matchId}`);
    return response.data;
  },

  // Get leagues
  getLeagues: async () => {
    const response = await apiClient.get<{ success: boolean; leagues: League[] }>('/api/leagues');
    return response.data;
  },

  // Start tracker
  startTracker: async () => {
    const response = await apiClient.post('/api/tracker/start');
    return response.data;
  },

  // Stop tracker
  stopTracker: async () => {
    const response = await apiClient.post('/api/tracker/stop');
    return response.data;
  },

  // Test telegram
  testTelegram: async () => {
    const response = await apiClient.post('/api/telegram/test');
    return response.data;
  },

  // Get league goal line stats
  getLeagueStats: async (leagueId: number) => {
    const response = await apiClient.get<LeagueGoalLineStats>(`/api/league-stats/${leagueId}`);
    return response.data;
  },
};

export default api;
