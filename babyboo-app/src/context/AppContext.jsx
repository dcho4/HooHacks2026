import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const defaultBabyProfile = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  sex: '',
  hasMedicalConditions: null,
  medicalConditions: [],
  onboardingComplete: false,
};

export function AppProvider({ children }) {
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

  useEffect(() => {
    localStorage.setItem('babyProfile', JSON.stringify(babyProfile));
  }, [babyProfile]);

  useEffect(() => {
    localStorage.setItem('feedLogs', JSON.stringify(feedLogs));
  }, [feedLogs]);

  useEffect(() => {
    localStorage.setItem('sleepLogs', JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  useEffect(() => {
    localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem('growthEntries', JSON.stringify(growthEntries));
  }, [growthEntries]);

  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('parentName', parentName);
  }, [parentName]);

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

  const resetApp = () => {
    setBabyProfile(defaultBabyProfile);
    setFeedLogs([]);
    setSleepLogs([]);
    setFamilyMembers([]);
    setGrowthEntries([]);
    setJournalEntries([]);
    setParentName('');
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        babyProfile,
        setBabyProfile,
        feedLogs,
        addFeedLog,
        sleepLogs,
        addSleepLog,
        familyMembers,
        addFamilyMember,
        removeFamilyMember,
        growthEntries,
        addGrowthEntry,
        journalEntries,
        addJournalEntry,
        parentName,
        setParentName,
        getBabyAgeDays,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
