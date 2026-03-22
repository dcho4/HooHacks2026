import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const defaultBabyProfile = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  sex: '',
  hasMedicalConditions: null,
  medicalConditions: [],
  familyHistory: [],
  familyHistoryOther: '',
  state: '',
  onboardingComplete: false,
};

const defaultAccount = {
  email: '',
  username: '',
  password: '',
};

export function AppProvider({ children }) {
  const [account, setAccount] = useState(() => {
    const saved = localStorage.getItem('account');
    return saved ? JSON.parse(saved) : defaultAccount;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [babyProfile, setBabyProfile] = useState(() => {
    const saved = localStorage.getItem('babyProfile');
    return saved ? JSON.parse(saved) : defaultBabyProfile;
  });

  const [feedLogs, setFeedLogs] = useState(() => {
    const saved = localStorage.getItem('feedLogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [sleepLogs, setSleepLogs] = useState(() => {
    const saved = localStorage.getItem('sleepLogs');
    return saved ? JSON.parse(saved) : [];
  });

  const [familyMembers, setFamilyMembers] = useState(() => {
    const saved = localStorage.getItem('familyMembers');
    return saved ? JSON.parse(saved) : [];
  });

  const [growthEntries, setGrowthEntries] = useState(() => {
    const saved = localStorage.getItem('growthEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem('journalEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [parentName, setParentName] = useState(() => {
    return localStorage.getItem('parentName') || '';
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('appTheme') || 'lavender';
  });

  const [routineChecks, setRoutineChecks] = useState(() => {
    const saved = localStorage.getItem('routineChecks');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      if (parsed.date === today) return parsed;
    }
    return { date: new Date().toISOString().split('T')[0], tasks: {} };
  });

  const [vaccineStatus, setVaccineStatus] = useState(() => {
    const saved = localStorage.getItem('vaccineStatus');
    return saved ? JSON.parse(saved) : {};
  });

  const [snapshots, setSnapshots] = useState(() => {
    const saved = localStorage.getItem('snapshots');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist
  useEffect(() => { localStorage.setItem('account', JSON.stringify(account)); }, [account]);
  useEffect(() => { localStorage.setItem('isLoggedIn', isLoggedIn); }, [isLoggedIn]);
  useEffect(() => { localStorage.setItem('babyProfile', JSON.stringify(babyProfile)); }, [babyProfile]);
  useEffect(() => { localStorage.setItem('feedLogs', JSON.stringify(feedLogs)); }, [feedLogs]);
  useEffect(() => { localStorage.setItem('sleepLogs', JSON.stringify(sleepLogs)); }, [sleepLogs]);
  useEffect(() => { localStorage.setItem('familyMembers', JSON.stringify(familyMembers)); }, [familyMembers]);
  useEffect(() => { localStorage.setItem('growthEntries', JSON.stringify(growthEntries)); }, [growthEntries]);
  useEffect(() => { localStorage.setItem('journalEntries', JSON.stringify(journalEntries)); }, [journalEntries]);
  useEffect(() => { localStorage.setItem('parentName', parentName); }, [parentName]);
  useEffect(() => { localStorage.setItem('darkMode', darkMode); }, [darkMode]);
  useEffect(() => { localStorage.setItem('appTheme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('routineChecks', JSON.stringify(routineChecks)); }, [routineChecks]);
  useEffect(() => { localStorage.setItem('vaccineStatus', JSON.stringify(vaccineStatus)); }, [vaccineStatus]);
  useEffect(() => { localStorage.setItem('snapshots', JSON.stringify(snapshots)); }, [snapshots]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color', theme);
  }, [theme]);

  const addFeedLog = (log) => {
    setFeedLogs((prev) => [{ ...log, id: Date.now(), timestamp: new Date().toISOString() }, ...prev]);
  };

  const addSleepLog = (log) => {
    setSleepLogs((prev) => [{ ...log, id: Date.now(), timestamp: new Date().toISOString() }, ...prev]);
  };

  const addFamilyMember = (member) => {
    setFamilyMembers((prev) => [...prev, { ...member, id: Date.now() }]);
  };

  const removeFamilyMember = (id) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const addGrowthEntry = (entry) => {
    setGrowthEntries((prev) => [{ ...entry, id: Date.now(), date: new Date().toISOString() }, ...prev]);
  };

  const addJournalEntry = (entry) => {
    setJournalEntries((prev) => [{ ...entry, id: Date.now(), date: new Date().toISOString() }, ...prev]);
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
      return { ...current, tasks: { ...current.tasks, [taskId]: !current.tasks[taskId] } };
    });
  };

  const getRoutineTasksForToday = () => {
    const today = new Date().toISOString().split('T')[0];
    if (routineChecks.date !== today) return {};
    return routineChecks.tasks;
  };

  const toggleVaccine = (vaccineId) => {
    setVaccineStatus((prev) => ({ ...prev, [vaccineId]: !prev[vaccineId] }));
  };

  const addSnapshot = (dataUrl) => {
    const entry = { id: Date.now(), dataUrl, date: new Date().toISOString() };
    setSnapshots((prev) => [entry, ...prev]);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const login = (email, password) => {
    if (account.email === email && account.password === password) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const resetApp = () => {
    setBabyProfile(defaultBabyProfile);
    setAccount(defaultAccount);
    setIsLoggedIn(false);
    setFeedLogs([]);
    setSleepLogs([]);
    setFamilyMembers([]);
    setGrowthEntries([]);
    setJournalEntries([]);
    setParentName('');
    setDarkMode(false);
    setTheme('lavender');
    setRoutineChecks({ date: new Date().toISOString().split('T')[0], tasks: {} });
    setVaccineStatus({});
    setSnapshots([]);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        account, setAccount,
        isLoggedIn, setIsLoggedIn, login, logout,
        babyProfile, setBabyProfile,
        feedLogs, addFeedLog,
        sleepLogs, addSleepLog,
        familyMembers, addFamilyMember, removeFamilyMember,
        growthEntries, addGrowthEntry,
        journalEntries, addJournalEntry,
        parentName, setParentName,
        darkMode, setDarkMode,
        theme, setTheme,
        routineChecks, toggleRoutineTask, getRoutineTasksForToday,
        vaccineStatus, toggleVaccine,
        snapshots, addSnapshot,
        getBabyAgeDays,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
