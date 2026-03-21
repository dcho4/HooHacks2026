import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarDays,
  ListChecks,
  BookOpen,
  UtensilsCrossed,
  Moon,
  Camera,
  Dumbbell,
  TrendingUp,
  Plus,
  Clock,
  Droplets,
  X,
} from 'lucide-react';

const AFFIRMATIONS = [
  "You're doing an amazing job!",
  "Every small moment matters.",
  "Trust yourself — you know your baby best.",
  "It's okay to not have all the answers.",
  "You are exactly the parent your baby needs.",
  "Take it one day at a time.",
  "Your love is the best gift you can give.",
  "Be gentle with yourself today.",
];

function getAffirmation() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];
}

function getCalendarDays() {
  const today = new Date();
  const days = [];
  for (let i = -2; i <= 4; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: i === 0,
      date: d.toISOString().split('T')[0],
    });
  }
  return days;
}

export default function Home() {
  const { babyProfile, parentName, feedLogs, sleepLogs, addFeedLog, addSleepLog, journalEntries, addJournalEntry, getBabyAgeDays } = useApp();
  const [activeModal, setActiveModal] = useState(null);
  const [feedType, setFeedType] = useState('Breast');
  const [feedAmount, setFeedAmount] = useState('');
  const [feedNote, setFeedNote] = useState('');
  const [sleepStart, setSleepStart] = useState('');
  const [sleepEnd, setSleepEnd] = useState('');
  const [sleepNote, setSleepNote] = useState('');
  const [journalText, setJournalText] = useState('');

  const calDays = getCalendarDays();
  const ageDays = getBabyAgeDays();
  const ageWeeks = ageDays !== null ? Math.floor(ageDays / 7) : null;
  const displayName = parentName || 'Parent';

  const todayFeeds = feedLogs.filter(
    (l) => l.timestamp?.startsWith(new Date().toISOString().split('T')[0])
  );
  const todaySleeps = sleepLogs.filter(
    (l) => l.timestamp?.startsWith(new Date().toISOString().split('T')[0])
  );

  const handleAddFeed = () => {
    addFeedLog({ type: feedType, amount: feedAmount, note: feedNote });
    setFeedType('Breast');
    setFeedAmount('');
    setFeedNote('');
    setActiveModal(null);
  };

  const handleAddSleep = () => {
    addSleepLog({ start: sleepStart, end: sleepEnd, note: sleepNote });
    setSleepStart('');
    setSleepEnd('');
    setSleepNote('');
    setActiveModal(null);
  };

  const handleAddJournal = () => {
    addJournalEntry({ text: journalText });
    setJournalText('');
    setActiveModal(null);
  };

  return (
    <div className="home-page">
      {/* Greeting Banner */}
      <div className="greeting-banner">
        <div>
          <h1>Hi {displayName}!</h1>
          <p className="affirmation">{getAffirmation()}</p>
          {babyProfile.firstName && ageDays !== null && ageDays >= 0 && (
            <span className="baby-age-badge">
              {babyProfile.firstName} — {ageWeeks > 0 ? `${ageWeeks} weeks` : `${ageDays} days`} old
            </span>
          )}
          {babyProfile.firstName && ageDays !== null && ageDays < 0 && (
            <span className="baby-age-badge">
              {babyProfile.firstName} — {Math.abs(ageDays)} days until due date
            </span>
          )}
        </div>
      </div>

      {/* Calendar Strip */}
      <div className="calendar-strip">
        <CalendarDays size={16} className="cal-icon" />
        {calDays.map((d) => (
          <div key={d.date} className={`cal-day ${d.isToday ? 'today' : ''}`}>
            <span className="day-name">{d.dayName}</span>
            <span className="day-num">{d.dayNum}</span>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card feed-stat" onClick={() => setActiveModal('feed')}>
          <Droplets size={20} />
          <div>
            <span className="stat-num">{todayFeeds.length}</span>
            <span className="stat-label">Feeds today</span>
          </div>
          <Plus size={18} className="stat-add" />
        </div>
        <div className="stat-card sleep-stat" onClick={() => setActiveModal('sleep')}>
          <Moon size={20} />
          <div>
            <span className="stat-num">{todaySleeps.length}</span>
            <span className="stat-label">Sleeps today</span>
          </div>
          <Plus size={18} className="stat-add" />
        </div>
      </div>

      {/* Daily Task Cards */}
      <h2 className="section-title">Daily Tasks</h2>
      <div className="task-grid">
        <div className="task-card routine" onClick={() => setActiveModal('feed')}>
          <UtensilsCrossed size={24} />
          <span>Log Feed</span>
        </div>
        <div className="task-card journal" onClick={() => setActiveModal('journal')}>
          <BookOpen size={24} />
          <span>Journal</span>
        </div>
        <div className="task-card food" onClick={() => setActiveModal('feed')}>
          <ListChecks size={24} />
          <span>Routine</span>
        </div>
        <div className="task-card sleep" onClick={() => setActiveModal('sleep')}>
          <Moon size={24} />
          <span>Log Sleep</span>
        </div>
        <div className="task-card snapshot">
          <Camera size={24} />
          <span>Snapshot</span>
        </div>
        <div className="task-card training">
          <Dumbbell size={24} />
          <span>Activities</span>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="weekly-summary">
        <TrendingUp size={20} />
        <div>
          <h3>Weekly Summary</h3>
          <p>
            {feedLogs.length} feeds &middot; {sleepLogs.length} sleep sessions logged
            {journalEntries.length > 0 && ` · ${journalEntries.length} journal entries`}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      {(todayFeeds.length > 0 || todaySleeps.length > 0) && (
        <div className="recent-section">
          <h2 className="section-title">Today's Log</h2>
          {todayFeeds.map((f) => (
            <div key={f.id} className="log-item feed-log">
              <Droplets size={16} />
              <span>{f.type}{f.amount ? ` — ${f.amount}` : ''}</span>
              <span className="log-time">
                {new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {todaySleeps.map((s) => (
            <div key={s.id} className="log-item sleep-log">
              <Moon size={16} />
              <span>{s.start} — {s.end || 'ongoing'}</span>
              <span className="log-time">
                {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Feed Modal */}
      {activeModal === 'feed' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Log Feed</h2>
              <button className="modal-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <label>Type</label>
              <div className="option-group">
                {['Breast', 'Bottle', 'Solid'].map((t) => (
                  <button
                    key={t}
                    className={`option-btn ${feedType === t ? 'selected' : ''}`}
                    onClick={() => setFeedType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <label>Amount (optional)</label>
              <input
                type="text"
                placeholder="e.g. 4oz, 15min"
                value={feedAmount}
                onChange={(e) => setFeedAmount(e.target.value)}
              />
              <label>Note (optional)</label>
              <input
                type="text"
                placeholder="Any notes..."
                value={feedNote}
                onChange={(e) => setFeedNote(e.target.value)}
              />
            </div>
            <button className="btn-primary full-width" onClick={handleAddFeed}>
              <Plus size={18} /> Save Feed
            </button>
          </div>
        </div>
      )}

      {/* Sleep Modal */}
      {activeModal === 'sleep' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Log Sleep</h2>
              <button className="modal-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <label>Start Time</label>
              <input
                type="time"
                value={sleepStart}
                onChange={(e) => setSleepStart(e.target.value)}
              />
              <label>End Time</label>
              <input
                type="time"
                value={sleepEnd}
                onChange={(e) => setSleepEnd(e.target.value)}
              />
              <label>Note (optional)</label>
              <input
                type="text"
                placeholder="Any notes..."
                value={sleepNote}
                onChange={(e) => setSleepNote(e.target.value)}
              />
            </div>
            <button className="btn-primary full-width" onClick={handleAddSleep}>
              <Plus size={18} /> Save Sleep
            </button>
          </div>
        </div>
      )}

      {/* Journal Modal */}
      {activeModal === 'journal' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Journal Entry</h2>
              <button className="modal-close" onClick={() => setActiveModal(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <label>What's on your mind?</label>
              <textarea
                rows={4}
                placeholder="Today's milestones, thoughts, memories..."
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
              />
            </div>
            <button className="btn-primary full-width" disabled={!journalText.trim()} onClick={handleAddJournal}>
              <Plus size={18} /> Save Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
