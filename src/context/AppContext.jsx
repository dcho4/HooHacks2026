import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const AppContext = createContext();

// Try to use Auth0 if available
let useAuth0Hook = () => ({ isAuthenticated: false, user: null, getAccessTokenSilently: null, loginWithRedirect: () => {}, logout: () => {} });
try {
  const auth0 = await import('@auth0/auth0-react');
  if (import.meta.env.VITE_AUTH0_DOMAIN) {
    useAuth0Hook = auth0.useAuth0;
  }
} catch {}

const defaultBabyProfile = {
  firstName: '', lastName: '', dateOfBirth: '', sex: '', state: '',
  hasMedicalConditions: null, medicalConditions: [], familyHistory: [],
  familyHistoryOther: '', onboardingComplete: false,
};

export function AppProvider({ children }) {
  let auth0 = { isAuthenticated: false, user: null, getAccessTokenSilently: null, loginWithRedirect: () => {}, logout: () => {}, isLoading: false };
  try { auth0 = useAuth0Hook(); } catch {}

  const hasAuth0 = !!import.meta.env.VITE_AUTH0_DOMAIN;
  const isAuth0Authenticated = hasAuth0 && auth0.isAuthenticated;

  // Local fallback state
  const [localAccount, setLocalAccount] = useState(() => {
    const s = localStorage.getItem('account');
    return s ? JSON.parse(s) : { email: '', username: '', password: '' };
  });
  const [localLoggedIn, setLocalLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');

  const isLoggedIn = hasAuth0 ? isAuth0Authenticated : localLoggedIn;
  const isLoading = hasAuth0 ? auth0.isLoading : false;

  const [babyProfile, setBabyProfile] = useState(() => {
    const s = localStorage.getItem('babyProfile');
    return s ? JSON.parse(s) : defaultBabyProfile;
  });
  const [feedLogs, setFeedLogs] = useState(() => { const s = localStorage.getItem('feedLogs'); return s ? JSON.parse(s) : []; });
  const [sleepLogs, setSleepLogs] = useState(() => { const s = localStorage.getItem('sleepLogs'); return s ? JSON.parse(s) : []; });
  const [familyMembers, setFamilyMembers] = useState(() => { const s = localStorage.getItem('familyMembers'); return s ? JSON.parse(s) : []; });
  const [growthEntries, setGrowthEntries] = useState(() => { const s = localStorage.getItem('growthEntries'); return s ? JSON.parse(s) : []; });
  const [journalEntries, setJournalEntries] = useState(() => { const s = localStorage.getItem('journalEntries'); return s ? JSON.parse(s) : []; });
  const [parentName, setParentName] = useState(() => localStorage.getItem('parentName') || '');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'lavender');
  const [developerMode, setDeveloperMode] = useState(() => localStorage.getItem('developerMode') === 'true');
  const [routineChecks, setRoutineChecks] = useState(() => {
    const s = localStorage.getItem('routineChecks');
    if (s) { const p = JSON.parse(s); const t = new Date().toISOString().split('T')[0]; if (p.date === t) return p; }
    return { date: new Date().toISOString().split('T')[0], tasks: {} };
  });
  const [vaccineStatus, setVaccineStatus] = useState(() => { const s = localStorage.getItem('vaccineStatus'); return s ? JSON.parse(s) : {}; });
  const [snapshots, setSnapshots] = useState(() => { const s = localStorage.getItem('snapshots'); return s ? JSON.parse(s) : []; });
  const [familyCode, setFamilyCode] = useState(() => localStorage.getItem('familyCode') || '');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('account', JSON.stringify(localAccount)); }, [localAccount]);
  useEffect(() => { localStorage.setItem('isLoggedIn', localLoggedIn); }, [localLoggedIn]);
  useEffect(() => { localStorage.setItem('babyProfile', JSON.stringify(babyProfile)); }, [babyProfile]);
  useEffect(() => { localStorage.setItem('feedLogs', JSON.stringify(feedLogs)); }, [feedLogs]);
  useEffect(() => { localStorage.setItem('sleepLogs', JSON.stringify(sleepLogs)); }, [sleepLogs]);
  useEffect(() => { localStorage.setItem('familyMembers', JSON.stringify(familyMembers)); }, [familyMembers]);
  useEffect(() => { localStorage.setItem('growthEntries', JSON.stringify(growthEntries)); }, [growthEntries]);
  useEffect(() => { localStorage.setItem('journalEntries', JSON.stringify(journalEntries)); }, [journalEntries]);
  useEffect(() => { localStorage.setItem('parentName', parentName); }, [parentName]);
  useEffect(() => { localStorage.setItem('darkMode', darkMode); }, [darkMode]);
  useEffect(() => { localStorage.setItem('appTheme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('developerMode', developerMode); }, [developerMode]);
  useEffect(() => { localStorage.setItem('routineChecks', JSON.stringify(routineChecks)); }, [routineChecks]);
  useEffect(() => { localStorage.setItem('vaccineStatus', JSON.stringify(vaccineStatus)); }, [vaccineStatus]);
  useEffect(() => { localStorage.setItem('snapshots', JSON.stringify(snapshots)); }, [snapshots]);
  useEffect(() => { localStorage.setItem('familyCode', familyCode); }, [familyCode]);

  useEffect(() => { document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light'); }, [darkMode]);
  useEffect(() => { document.documentElement.setAttribute('data-color', theme); }, [theme]);

  // ===== Family Sync =====
  const SYNC_URL = '';
  const myFamilyCode = localStorage.getItem('familyInviteCode') || '';
  const joinedFamilyCode = (() => { try { const j = JSON.parse(localStorage.getItem('joinedFamilies') || '[]'); return j[0] || ''; } catch { return ''; } })();
  const activeFamilyCode = myFamilyCode || joinedFamilyCode;
  const isParentRole = !!myFamilyCode && !joinedFamilyCode;
  const isCoParentRole = !!joinedFamilyCode;

  // Parent: push shared data to sync server whenever it changes
  useEffect(() => {
    if (!isParentRole || !activeFamilyCode || !babyProfile.onboardingComplete) return;
    const timeout = setTimeout(() => {
      fetch(`${SYNC_URL}/api/family-sync/${activeFamilyCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          babyProfile, feedLogs, sleepLogs, growthEntries, vaccineStatus,
          parentName: parentName,
        }),
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(timeout);
  }, [isParentRole, activeFamilyCode, babyProfile, feedLogs, sleepLogs, growthEntries, vaccineStatus]);

  // Co-parent: pull family data on load and periodically
  useEffect(() => {
    if (!isCoParentRole || !joinedFamilyCode) return;
    const pull = () => {
      fetch(`${SYNC_URL}/api/family-sync/${joinedFamilyCode}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          if (data.babyProfile) setBabyProfile(prev => ({ ...prev, ...data.babyProfile, onboardingComplete: true }));
          if (data.feedLogs) setFeedLogs(data.feedLogs);
          if (data.sleepLogs) setSleepLogs(data.sleepLogs);
          if (data.growthEntries) setGrowthEntries(data.growthEntries);
          if (data.vaccineStatus) setVaccineStatus(data.vaccineStatus);
        })
        .catch(() => {});
    };
    pull();
    const interval = setInterval(pull, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [isCoParentRole, joinedFamilyCode]);

  // Load data from backend when Auth0 authenticates
  const getToken = useCallback(async () => {
    if (hasAuth0 && auth0.getAccessTokenSilently) {
      return auth0.getAccessTokenSilently();
    }
    return null;
  }, [hasAuth0, auth0.getAccessTokenSilently]);

  useEffect(() => {
    if (isAuth0Authenticated && !dataLoaded) {
      (async () => {
        try {
          const token = await getToken();
          const data = await api('/api/all-data', {}, token);
          if (data.user) {
            setParentName(data.user.parentName || '');
            setDarkMode(data.user.darkMode || false);
            setTheme(data.user.theme || 'lavender');
            setDeveloperMode(data.user.developerMode || false);
            setFamilyCode(data.user.familyCode || '');
          }
          if (data.babyProfile) setBabyProfile(data.babyProfile);
          if (data.feedLogs) setFeedLogs(data.feedLogs);
          if (data.sleepLogs) setSleepLogs(data.sleepLogs);
          if (data.journalEntries) setJournalEntries(data.journalEntries);
          if (data.growthEntries) setGrowthEntries(data.growthEntries);
          if (data.familyMembers) setFamilyMembers(data.familyMembers);
          if (data.snapshots) setSnapshots(data.snapshots);
          if (data.vaccineStatus) setVaccineStatus(data.vaccineStatus);
          if (data.routineChecks) setRoutineChecks(data.routineChecks);
          setDataLoaded(true);
        } catch {
          setDataLoaded(true);
        }
      })();
    }
  }, [isAuth0Authenticated, dataLoaded, getToken]);

  // Backend sync helper
  const syncToBackend = useCallback(async (path, options) => {
    try {
      const token = await getToken();
      if (token) await api(path, options, token);
    } catch {}
  }, [getToken]);

  const addFeedLog = (log) => {
    const entry = { ...log, id: Date.now(), timestamp: new Date().toISOString() };
    setFeedLogs((prev) => [entry, ...prev]);
    syncToBackend('/api/feed-logs', { method: 'POST', body: JSON.stringify(entry) });
  };

  const addSleepLog = (log) => {
    const entry = { ...log, id: Date.now(), timestamp: new Date().toISOString() };
    setSleepLogs((prev) => [entry, ...prev]);
    syncToBackend('/api/sleep-logs', { method: 'POST', body: JSON.stringify(entry) });
  };

  const addFamilyMember = (member) => {
    const entry = { ...member, id: Date.now() };
    setFamilyMembers((prev) => [...prev, entry]);
    syncToBackend('/api/family', { method: 'POST', body: JSON.stringify(entry) });
  };

  const removeFamilyMember = (id) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
    syncToBackend(`/api/family/${id}`, { method: 'DELETE' });
  };

  const addGrowthEntry = (entry) => {
    const e = { ...entry, id: Date.now(), date: new Date().toISOString() };
    setGrowthEntries((prev) => [e, ...prev]);
    syncToBackend('/api/growth', { method: 'POST', body: JSON.stringify(e) });
  };

  const addJournalEntry = (entry) => {
    const e = { ...entry, id: Date.now(), date: new Date().toISOString() };
    setJournalEntries((prev) => [e, ...prev]);
    syncToBackend('/api/journal', { method: 'POST', body: JSON.stringify(e) });
  };

  const getBabyAgeDays = () => {
    if (!babyProfile.dateOfBirth) return null;
    const birth = new Date(babyProfile.dateOfBirth);
    const now = new Date();
    return Math.floor((now - birth) / (1000 * 60 * 60 * 24));
  };

  const toggleRoutineTask = (taskId) => {
    const today = new Date().toISOString().split('T')[0];
    setRoutineChecks((prev) => {
      const current = prev.date === today ? prev : { date: today, tasks: {} };
      const updated = { ...current, tasks: { ...current.tasks, [taskId]: !current.tasks[taskId] } };
      syncToBackend(`/api/routine/${today}`, { method: 'PUT', body: JSON.stringify({ tasks: updated.tasks }) });
      return updated;
    });
  };

  const getRoutineTasksForToday = () => {
    const today = new Date().toISOString().split('T')[0];
    if (routineChecks.date !== today) return {};
    return routineChecks.tasks;
  };

  const toggleVaccine = (vaccineId) => {
    setVaccineStatus((prev) => ({ ...prev, [vaccineId]: !prev[vaccineId] }));
    syncToBackend(`/api/vaccines/${vaccineId}`, { method: 'PUT' });
  };

  const addSnapshot = (dataUrl) => {
    const entry = { id: Date.now(), dataUrl, date: new Date().toISOString() };
    setSnapshots((prev) => [entry, ...prev]);
    syncToBackend('/api/snapshots', { method: 'POST', body: JSON.stringify(entry) });
  };

  // Formats a date for local date comparison
  const toLocalDateStr = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getLogsForDate = (dateStr) => {
    const feeds = feedLogs.filter((l) => l.timestamp && toLocalDateStr(l.timestamp) === dateStr);
    const sleeps = sleepLogs.filter((l) => l.timestamp && toLocalDateStr(l.timestamp) === dateStr);
    return { feeds, sleeps };
  };

  // Auth methods
  const login = (email, password) => {
    if (hasAuth0) {
      auth0.loginWithRedirect();
      return true;
    }
    if (localAccount.email === email && localAccount.password === password) {
      setLocalLoggedIn(true);
      return true;
    }
    return false;
  };

  const loginWithAuth0 = (options) => {
    if (hasAuth0) auth0.loginWithRedirect(options);
  };

  const logout = () => {
    if (hasAuth0) {
      auth0.logout({ logoutParams: { returnTo: window.location.origin } });
    } else {
      setLocalLoggedIn(false);
    }
  };

  // Clears all data and starts fresh onboarding (keeps user logged in)
  const startNewAccount = () => {
    setBabyProfile(defaultBabyProfile);
    setFeedLogs([]); setSleepLogs([]); setFamilyMembers([]);
    setGrowthEntries([]); setJournalEntries([]);
    setParentName(''); setDarkMode(false); setTheme('lavender');
    setDeveloperMode(false); setVaccineStatus({});
    setRoutineChecks({ date: new Date().toISOString().split('T')[0], tasks: {} });
    setSnapshots([]);
    setLocalAccount({ email: '', username: '', password: '' });
    setLocalLoggedIn(true); // stay logged in so routing goes to Onboarding
    localStorage.clear();
    localStorage.setItem('isLoggedIn', 'true'); // persist so it survives the clear
  };

  const resetApp = async () => {
    setBabyProfile(defaultBabyProfile);
    setFeedLogs([]); setSleepLogs([]); setFamilyMembers([]);
    setGrowthEntries([]); setJournalEntries([]);
    setParentName(''); setDarkMode(false); setTheme('lavender');
    setDeveloperMode(false); setVaccineStatus({});
    setRoutineChecks({ date: new Date().toISOString().split('T')[0], tasks: {} });
    setSnapshots([]);
    if (!hasAuth0) {
      setLocalAccount({ email: '', username: '', password: '' });
      setLocalLoggedIn(false);
    }
    localStorage.clear();
    try {
      const token = await getToken();
      if (token) await api('/api/reset', { method: 'DELETE' }, token);
    } catch {}
  };

  const updateBabyProfile = (profile) => {
    setBabyProfile(profile);
    syncToBackend('/api/baby-profile', { method: 'PUT', body: JSON.stringify(profile) });
  };

  const updateSettings = (settings) => {
    if (settings.darkMode !== undefined) setDarkMode(settings.darkMode);
    if (settings.theme !== undefined) setTheme(settings.theme);
    if (settings.developerMode !== undefined) setDeveloperMode(settings.developerMode);
    syncToBackend('/api/settings', { method: 'PUT', body: JSON.stringify(settings) });
  };

  const updateUser = (data) => {
    if (data.parentName !== undefined) setParentName(data.parentName);
    syncToBackend('/api/user', {
      method: 'PUT',
      body: JSON.stringify({
        parentName: data.parentName ?? parentName,
        darkMode, theme, developerMode,
        onboardingComplete: babyProfile.onboardingComplete,
      }),
    });
  };

  return (
    <AppContext.Provider
      value={{
        // Auth
        isLoggedIn, isLoading, login, logout, loginWithAuth0,
        hasAuth0, auth0User: auth0.user,
        account: localAccount, setAccount: setLocalAccount, setIsLoggedIn: setLocalLoggedIn,
        // Baby
        babyProfile, setBabyProfile: updateBabyProfile,
        // Logs
        feedLogs, addFeedLog, sleepLogs, addSleepLog,
        journalEntries, addJournalEntry,
        growthEntries, addGrowthEntry,
        // Family
        familyMembers, addFamilyMember, removeFamilyMember, familyCode,
        // Settings
        parentName, setParentName: (n) => { setParentName(n); updateUser({ parentName: n }); },
        darkMode, setDarkMode: (v) => { setDarkMode(v); updateSettings({ darkMode: v, theme, developerMode }); },
        theme, setTheme: (v) => { setTheme(v); updateSettings({ darkMode, theme: v, developerMode }); },
        developerMode, setDeveloperMode: (v) => { setDeveloperMode(v); updateSettings({ darkMode, theme, developerMode: v }); },
        // Features
        routineChecks, toggleRoutineTask, getRoutineTasksForToday,
        vaccineStatus, toggleVaccine,
        snapshots, addSnapshot,
        getBabyAgeDays, getLogsForDate, toLocalDateStr,
        resetApp, startNewAccount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
