import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';
import {
  ListChecks, BookOpen, UtensilsCrossed, Moon, Camera, Dumbbell,
  TrendingUp, Plus, Droplets, X, ChevronLeft, ChevronRight,
  Check, Circle, Image, RotateCcw, Save, FileDown,
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

function getRoutineTasks(ageDays, sex, conditions, latestWeight) {
  const tasks = [
    { id: 'feed', label: 'Feed baby', desc: 'Log a feeding session' },
    { id: 'diaper', label: 'Diaper change', desc: 'Check and change diaper' },
    { id: 'sleep', label: 'Log sleep', desc: 'Record a nap or bedtime' },
    { id: 'tummy', label: 'Tummy time', desc: ageDays !== null && ageDays < 90 ? '2-3 minutes on tummy' : '10-15 minutes on tummy' },
    { id: 'skin', label: 'Skin-to-skin', desc: 'Bonding time with baby' },
    { id: 'bath', label: 'Bath time', desc: 'Gentle bath or sponge bath' },
  ];

  // Condition-specific tasks
  if (conditions?.includes('Reflux / GERD')) {
    tasks.push({ id: 'upright', label: 'Upright after feeding', desc: 'Keep baby upright 20-30 min after feed to reduce reflux' });
    tasks.push({ id: 'small-feeds', label: 'Smaller, frequent feeds', desc: 'Feed smaller amounts more often to manage reflux' });
  }
  if (conditions?.includes('Jaundice')) {
    tasks.push({ id: 'sunlight', label: 'Sunlight exposure', desc: '10-15 min indirect sunlight to help break down bilirubin' });
    tasks.push({ id: 'jaundice-feed', label: 'Frequent feeding', desc: 'Feed every 2 hours to help flush bilirubin' });
  }
  if (conditions?.includes('Premature Birth')) {
    tasks.push({ id: 'kangaroo', label: 'Kangaroo care', desc: 'Skin-to-skin 1-2 hours — critical for preemie development' });
    tasks.push({ id: 'preemie-monitor', label: 'Monitor breathing', desc: 'Watch for apnea episodes or irregular breathing' });
  }
  if (conditions?.includes('Respiratory Issues')) {
    tasks.push({ id: 'resp-monitor', label: 'Monitor breathing', desc: 'Check breathing rate and look for signs of distress' });
    tasks.push({ id: 'humid', label: 'Humidifier check', desc: 'Ensure humidifier is running in baby\'s room' });
  }
  if (conditions?.includes('Allergies')) {
    tasks.push({ id: 'allergy-log', label: 'Allergy monitoring', desc: 'Check for any allergic reactions — skin, breathing, digestion' });
  }
  if (conditions?.includes('Heart Condition')) {
    tasks.push({ id: 'heart-monitor', label: 'Monitor heart rate', desc: 'Check for unusual heart rate or blue coloring' });
    tasks.push({ id: 'low-exertion', label: 'Calm feeding environment', desc: 'Keep feeding calm — heart conditions can cause feeding fatigue' });
  }
  if (conditions?.includes('Diabetes')) {
    tasks.push({ id: 'glucose', label: 'Blood sugar check', desc: 'Monitor blood glucose levels as directed by pediatrician' });
  }
  if (conditions?.includes('Down Syndrome')) {
    tasks.push({ id: 'therapy', label: 'Therapy exercises', desc: 'Perform PT/OT exercises as recommended by therapist' });
  }
  if (conditions?.includes('Tongue Tie')) {
    tasks.push({ id: 'latch-check', label: 'Latch check', desc: 'Monitor feeding latch — tongue tie can affect feeding' });
  }

  // Weight-based tasks
  if (latestWeight) {
    const weightNum = parseFloat(latestWeight);
    if (weightNum > 0 && weightNum < 6) {
      tasks.push({ id: 'extra-feed', label: 'Extra feeding session', desc: 'Baby may be underweight — consider adding a feeding' });
    }
  }

  // Sex-specific
  if (sex === 'Male') {
    tasks.push({ id: 'circ-care', label: 'Hygiene care', desc: ageDays !== null && ageDays < 30 ? 'Check diaper area — keep clean and dry' : 'Daily hygiene routine' });
  }
  if (sex === 'Female') {
    tasks.push({ id: 'hygiene', label: 'Hygiene care', desc: 'Wipe front-to-back during diaper changes' });
  }

  // Age-based
  if (ageDays !== null && ageDays > 90) {
    tasks.push({ id: 'read', label: 'Read to baby', desc: 'Read a story or sing — builds language skills' });
    tasks.push({ id: 'play', label: 'Play time', desc: 'Interactive play with age-appropriate toys' });
  }
  if (ageDays !== null && ageDays > 180) {
    tasks.push({ id: 'solids', label: 'Solid food', desc: 'Introduce age-appropriate solid foods' });
  }

  return tasks;
}

function getActivities(ageDays) {
  if (ageDays === null || ageDays < 0) {
    return [
      { title: 'Prepare nursery', desc: 'Set up a calm, safe sleeping space', duration: '30 min' },
      { title: 'Practice swaddling', desc: 'Use a doll or blanket to practice', duration: '10 min' },
    ];
  }
  if (ageDays < 90) {
    return [
      { title: 'High-contrast cards', desc: 'Hold black & white images 8-12 inches from face', duration: '2-3 min' },
      { title: 'Gentle massage', desc: 'Use gentle strokes on legs, arms, and back', duration: '5 min' },
      { title: 'Tummy time on chest', desc: 'Lay baby on your chest for bonding + strength', duration: '3-5 min' },
      { title: 'Finger grasping', desc: 'Let baby grip your finger to build hand strength', duration: '2 min' },
      { title: 'Slow tracking', desc: 'Move a colorful toy slowly for baby to follow with eyes', duration: '2-3 min' },
      { title: 'Bicycle legs', desc: "Gently move baby's legs in cycling motion to aid digestion", duration: '2 min' },
    ];
  }
  if (ageDays < 180) {
    return [
      { title: 'Reach & grab toys', desc: 'Dangle toys for baby to reach and grasp', duration: '5 min' },
      { title: 'Supported sitting', desc: 'Help baby practice sitting with support', duration: '5 min' },
      { title: 'Roll practice', desc: 'Encourage rolling from tummy to back', duration: '5 min' },
      { title: 'Mirror play', desc: 'Let baby explore their reflection', duration: '3 min' },
      { title: 'Bouncing on lap', desc: 'Support baby bouncing for leg strength', duration: '3 min' },
    ];
  }
  return [
    { title: 'Crawling course', desc: 'Use pillows to create a soft obstacle course', duration: '10 min' },
    { title: 'Pull to stand', desc: 'Let baby pull up on furniture with supervision', duration: '5 min' },
    { title: 'Stacking cups', desc: 'Build towers together — fine motor skills', duration: '5 min' },
    { title: 'Ball rolling', desc: 'Sit facing baby and roll a ball back and forth', duration: '5 min' },
    { title: 'Dance party', desc: 'Hold baby and sway to music — builds balance', duration: '5 min' },
    { title: 'Walking practice', desc: "Hold baby's hands and practice steps", duration: '5 min' },
  ];
}

function getMonthCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_HEADERS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Home() {
  const {
    babyProfile, parentName, feedLogs, sleepLogs,
    addFeedLog, addSleepLog, journalEntries, addJournalEntry,
    getBabyAgeDays, toggleRoutineTask, getRoutineTasksForToday,
    growthEntries, addSnapshot, snapshots, toLocalDateStr, getLogsForDate,
  } = useApp();

  const [activeModal, setActiveModal] = useState(null);
  const [feedType, setFeedType] = useState('Breast');
  const [feedAmount, setFeedAmount] = useState('');
  const [feedNote, setFeedNote] = useState('');
  const [sleepStart, setSleepStart] = useState('');
  const [sleepEnd, setSleepEnd] = useState('');
  const [sleepNote, setSleepNote] = useState('');
  const [journalText, setJournalText] = useState('');

  // Calendar
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [calView, setCalView] = useState('week');

  // Camera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showAlbum, setShowAlbum] = useState(false);

  const ageDays = getBabyAgeDays();
  const ageWeeks = ageDays !== null ? Math.floor(ageDays / 7) : null;
  const displayName = parentName || 'Parent';
  const routineChecks = getRoutineTasksForToday();

  // Selected date string for filtering (local time)
  const selectedDateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
  const todayLocalStr = toLocalDateStr(new Date().toISOString());
  const isSelectedToday = selectedDateStr === todayLocalStr;

  // Filter logs by selected date using local time comparison
  const { feeds: selectedFeeds, sleeps: selectedSleeps } = getLogsForDate(selectedDateStr);

  const latestWeight = growthEntries[0]?.weight || null;
  const routineTasks = getRoutineTasks(ageDays, babyProfile.sex, babyProfile.medicalConditions, latestWeight);
  const activities = getActivities(ageDays);

  const handleAddFeed = () => {
    addFeedLog({ type: feedType, amount: feedAmount, note: feedNote });
    setFeedType('Breast'); setFeedAmount(''); setFeedNote('');
    setActiveModal(null);
  };
  const handleAddSleep = () => {
    addSleepLog({ start: sleepStart, end: sleepEnd, note: sleepNote });
    setSleepStart(''); setSleepEnd(''); setSleepNote('');
    setActiveModal(null);
  };
  const handleAddJournal = () => {
    addJournalEntry({ text: journalText });
    setJournalText('');
    setActiveModal(null);
  };

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); };

  const getWeekDays = () => {
    const ref = new Date(calYear, calMonth, selectedDate);
    const dow = ref.getDay();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ref);
      d.setDate(ref.getDate() + (i - dow));
      return {
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(), month: d.getMonth(), year: d.getFullYear(),
        isToday: d.toISOString().split('T')[0] === todayStr,
        isSelected: d.getDate() === selectedDate && d.getMonth() === calMonth && d.getFullYear() === calYear,
        date: d,
      };
    });
  };

  // Camera functions
  const startCamera = async () => {
    setActiveModal('camera');
    setCapturedPhoto(null);
    setCameraActive(true);
  };

  useEffect(() => {
    if (activeModal === 'camera' && cameraActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }).catch(() => {
        setCameraActive(false);
        alert('Camera access denied or not available.');
        setActiveModal(null);
      });
    }
  }, [activeModal, cameraActive]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const maxW = 800;
    const scale = Math.min(maxW / video.videoWidth, 1);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    setCapturedPhoto(dataUrl);
    video.srcObject?.getTracks().forEach(t => t.stop());
    setCameraActive(false);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setCameraActive(true);
  };

  const savePhoto = () => {
    if (capturedPhoto) {
      addSnapshot(capturedPhoto);
      setCapturedPhoto(null);
      setActiveModal(null);
    }
  };

  const closeCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setCameraActive(false);
    setCapturedPhoto(null);
    setActiveModal(null);
  };

  const monthDays = getMonthCalendar(calYear, calMonth);
  const weekDays = getWeekDays();
  const completedRoutine = Object.values(routineChecks).filter(Boolean).length;

  // Group snapshots by date
  const snapshotsByDate = {};
  snapshots.forEach((s) => {
    const dateLabel = new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    if (!snapshotsByDate[dateLabel]) snapshotsByDate[dateLabel] = [];
    snapshotsByDate[dateLabel].push(s);
  });

  return (
    <div className="home-page">
      {/* Greeting Banner */}
      <div className="greeting-banner">
        <div>
          <h1>Hi {displayName}!</h1>
          <p className="affirmation">{getAffirmation()}</p>
          {babyProfile.firstName && ageDays !== null && ageDays >= 0 && (
            <span className="baby-age-badge">{babyProfile.firstName} — Day {Math.min(ageDays, 1000)} of 1000</span>
          )}
          {babyProfile.firstName && ageDays !== null && ageDays < 0 && (
            <span className="baby-age-badge">{babyProfile.firstName} — {Math.abs(ageDays)} days until due date</span>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-section">
        <div className="calendar-header">
          <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
          <span className="cal-month-label">{MONTH_NAMES[calMonth]} {calYear}</span>
          <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
          <div className="cal-view-toggle">
            <button className={`cal-view-btn ${calView === 'week' ? 'active' : ''}`} onClick={() => setCalView('week')}>Week</button>
            <button className={`cal-view-btn ${calView === 'month' ? 'active' : ''}`} onClick={() => setCalView('month')}>Month</button>
          </div>
        </div>
        {calView === 'week' ? (
          <div className="calendar-strip">
            {weekDays.map((d, i) => (
              <div key={i} className={`cal-day ${d.isToday ? 'today' : ''} ${d.isSelected ? 'selected' : ''}`}
                onClick={() => { setSelectedDate(d.dayNum); setCalMonth(d.month); setCalYear(d.year); }}>
                <span className="day-name">{d.dayName}</span>
                <span className="day-num">{d.dayNum}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="month-calendar">
            <div className="month-header-row">
              {DAY_HEADERS.map((d) => <span key={d} className="month-day-header">{d}</span>)}
            </div>
            <div className="month-grid">
              {monthDays.map((d, i) => (
                <button key={i}
                  className={`month-day ${d === null ? 'empty' : ''} ${d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear() ? 'today' : ''} ${d === selectedDate ? 'selected' : ''}`}
                  onClick={() => d && setSelectedDate(d)} disabled={d === null}>
                  {d || ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats (for selected date) */}
      <div className="quick-stats">
        <div className="stat-card feed-stat" onClick={() => setActiveModal('feed')}>
          <Droplets size={20} />
          <div>
            <span className="stat-num">{selectedFeeds.length}</span>
            <span className="stat-label">Feeds {isSelectedToday ? 'today' : selectedDateStr}</span>
          </div>
          <Plus size={18} className="stat-add" />
        </div>
        <div className="stat-card sleep-stat" onClick={() => setActiveModal('sleep')}>
          <Moon size={20} />
          <div>
            <span className="stat-num">{selectedSleeps.length}</span>
            <span className="stat-label">Sleeps {isSelectedToday ? 'today' : selectedDateStr}</span>
          </div>
          <Plus size={18} className="stat-add" />
        </div>
      </div>

      {/* Daily Tasks */}
      <h2 className="section-title">Daily Tasks</h2>
      <div className="task-grid">
        <div className="task-card routine" onClick={() => setActiveModal('feed')}>
          <UtensilsCrossed size={24} /><span>Log Feed</span>
        </div>
        <div className="task-card journal" onClick={() => setActiveModal('journal')}>
          <BookOpen size={24} /><span>Journal</span>
        </div>
        <div className="task-card food" onClick={() => setActiveModal('routine')}>
          <ListChecks size={24} /><span>Routine</span>
          {completedRoutine > 0 && <span className="task-badge">{completedRoutine}/{routineTasks.length}</span>}
        </div>
        <div className="task-card sleep" onClick={() => setActiveModal('sleep')}>
          <Moon size={24} /><span>Log Sleep</span>
        </div>
        <div className="task-card snapshot" onClick={startCamera}>
          <Camera size={24} /><span>Snapshot</span>
        </div>
        <div className="task-card training" onClick={() => setActiveModal('activities')}>
          <Dumbbell size={24} /><span>Activities</span>
        </div>
      </div>

      {/* Album shortcut */}
      {snapshots.length > 0 && (
        <div className="weekly-summary" onClick={() => setShowAlbum(true)} style={{ cursor: 'pointer' }}>
          <Image size={20} />
          <div>
            <h3>Photo Album</h3>
            <p>{snapshots.length} snapshot{snapshots.length > 1 ? 's' : ''} saved — tap to view</p>
          </div>
        </div>
      )}

      {/* Weekly Summary */}
      <div className="weekly-summary">
        <TrendingUp size={20} />
        <div>
          <h3>Total Summary</h3>
          <p>{feedLogs.length} feeds &middot; {sleepLogs.length} sleep sessions{journalEntries.length > 0 && ` · ${journalEntries.length} journal entries`}</p>
        </div>
      </div>

      {/* Log for Selected Date */}
      {(selectedFeeds.length > 0 || selectedSleeps.length > 0) && (
        <div className="recent-section">
          <h2 className="section-title">{isSelectedToday ? "Today's Log" : `Log for ${new Date(calYear, calMonth, selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}</h2>
          {selectedFeeds.map((f) => (
            <div key={f.id} className="log-item feed-log">
              <Droplets size={16} />
              <span>{f.type}{f.amount ? ` — ${f.amount}` : ''}</span>
              <span className="log-time">{new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
          {selectedSleeps.map((s) => (
            <div key={s.id} className="log-item sleep-log">
              <Moon size={16} />
              <span>{s.start} — {s.end || 'ongoing'}</span>
              <span className="log-time">{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      )}
      {!isSelectedToday && selectedFeeds.length === 0 && selectedSleeps.length === 0 && (
        <div className="recent-section">
          <h2 className="section-title">Log for {new Date(calYear, calMonth, selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h2>
          <p style={{ padding: '8px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>No entries for this date.</p>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Feed Modal */}
      {activeModal === 'feed' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Log Feed</h2><button className="modal-close" onClick={() => setActiveModal(null)}><X size={20} /></button></div>
            <div className="modal-body">
              <label>Type</label>
              <div className="option-group">
                {['Breast','Bottle','Solid'].map((t) => (
                  <button key={t} className={`option-btn ${feedType === t ? 'selected' : ''}`} onClick={() => setFeedType(t)}>{t}</button>
                ))}
              </div>
              <label>Amount (optional)</label>
              <input type="text" placeholder="e.g. 4oz, 15min" value={feedAmount} onChange={(e) => setFeedAmount(e.target.value)} />
              <label>Note (optional)</label>
              <input type="text" placeholder="Any notes..." value={feedNote} onChange={(e) => setFeedNote(e.target.value)} />
            </div>
            <button className="btn-primary full-width" onClick={handleAddFeed}><Plus size={18} /> Save Feed</button>
          </div>
        </div>
      )}

      {/* Sleep Modal */}
      {activeModal === 'sleep' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Log Sleep</h2><button className="modal-close" onClick={() => setActiveModal(null)}><X size={20} /></button></div>
            <div className="modal-body">
              <label>Start Time</label><input type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} />
              <label>End Time</label><input type="time" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} />
              <label>Note (optional)</label><input type="text" placeholder="Any notes..." value={sleepNote} onChange={(e) => setSleepNote(e.target.value)} />
            </div>
            <button className="btn-primary full-width" onClick={handleAddSleep}><Plus size={18} /> Save Sleep</button>
          </div>
        </div>
      )}

      {/* Journal Modal */}
      {activeModal === 'journal' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Journal</h2><button className="modal-close" onClick={() => setActiveModal(null)}><X size={20} /></button></div>
            <div className="modal-body">
              <label>New Entry</label>
              <textarea rows={3} placeholder="Today's milestones, thoughts, memories..." value={journalText} onChange={(e) => setJournalText(e.target.value)} />
              <button className="btn-primary full-width" disabled={!journalText.trim()} onClick={handleAddJournal} style={{ marginTop: 8 }}><Plus size={18} /> Save Entry</button>
              {journalEntries.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                    <label style={{ margin: 0 }}>Past Entries</label>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => {
                      const doc = new jsPDF();
                      doc.setFontSize(20);
                      doc.text(`${babyProfile.firstName || 'Baby'}'s Journal`, 20, 20);
                      doc.setFontSize(10);
                      doc.text(`Exported ${new Date().toLocaleDateString()}`, 20, 28);
                      let y = 40;
                      journalEntries.forEach((entry) => {
                        if (y > 270) { doc.addPage(); y = 20; }
                        doc.setFontSize(10);
                        doc.setTextColor(120);
                        doc.text(new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }), 20, y);
                        y += 6;
                        doc.setFontSize(12);
                        doc.setTextColor(40);
                        const lines = doc.splitTextToSize(entry.text, 170);
                        doc.text(lines, 20, y);
                        y += lines.length * 6 + 8;
                      });
                      doc.save(`${babyProfile.firstName || 'baby'}-journal.pdf`);
                    }}>
                      <FileDown size={14} /> Export PDF
                    </button>
                  </div>
                  <div className="journal-entries-list">
                    {journalEntries.map((entry) => (
                      <div key={entry.id} className="journal-entry-card">
                        <span className="journal-entry-date">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <p className="journal-entry-text">{entry.text}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Routine Modal */}
      {activeModal === 'routine' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Daily Routine</h2><button className="modal-close" onClick={() => setActiveModal(null)}><X size={20} /></button></div>
            <div className="modal-body">
              <p className="routine-progress">{completedRoutine} of {routineTasks.length} tasks completed today</p>
              <div className="routine-progress-bar"><div className="routine-progress-fill" style={{ width: `${routineTasks.length > 0 ? (completedRoutine / routineTasks.length) * 100 : 0}%` }} /></div>
              <div className="routine-list">
                {routineTasks.map((task) => (
                  <button key={task.id} className={`routine-item ${routineChecks[task.id] ? 'done' : ''}`} onClick={() => toggleRoutineTask(task.id)}>
                    <div className="routine-check">{routineChecks[task.id] ? <Check size={18} /> : <Circle size={18} />}</div>
                    <div className="routine-info"><span className="routine-label">{task.label}</span><span className="routine-desc">{task.desc}</span></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activities Modal */}
      {activeModal === 'activities' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Physical Activities</h2><button className="modal-close" onClick={() => setActiveModal(null)}><X size={20} /></button></div>
            <div className="modal-body">
              <p className="activities-subtitle">
                Age-appropriate activities for {babyProfile.firstName || 'baby'}
                {ageDays !== null && ageDays >= 0 && <span> ({ageWeeks > 0 ? `${ageWeeks} weeks` : `${ageDays} days`} old)</span>}
              </p>
              <div className="activities-list">
                {activities.map((act, i) => (
                  <div key={i} className="activity-card">
                    <div className="activity-header"><Dumbbell size={16} /><strong>{act.title}</strong><span className="activity-duration">{act.duration}</span></div>
                    <p className="activity-desc">{act.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {activeModal === 'camera' && (
        <div className="modal-overlay" onClick={closeCamera}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Snapshot</h2><button className="modal-close" onClick={closeCamera}><X size={20} /></button></div>
            <div className="modal-body">
              {!capturedPhoto ? (
                <>
                  <div className="camera-view">
                    <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                  </div>
                  <button className="btn-primary full-width" onClick={capturePhoto} style={{ marginTop: 12 }}>
                    <Camera size={18} /> Take Photo
                  </button>
                </>
              ) : (
                <>
                  <div className="camera-view">
                    <img src={capturedPhoto} alt="Captured" className="camera-preview" />
                  </div>
                  <div className="camera-actions">
                    <button className="btn-secondary" onClick={retakePhoto}><RotateCcw size={18} /> Retake</button>
                    <button className="btn-primary" onClick={savePhoto}><Save size={18} /> Save</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Album Modal */}
      {showAlbum && (
        <div className="modal-overlay" onClick={() => setShowAlbum(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Photo Album</h2><button className="modal-close" onClick={() => setShowAlbum(false)}><X size={20} /></button></div>
            <div className="modal-body">
              {Object.keys(snapshotsByDate).length === 0 ? (
                <p className="empty-state">No photos yet. Use Snapshot to take one!</p>
              ) : (
                Object.entries(snapshotsByDate).map(([dateLabel, photos]) => (
                  <div key={dateLabel} className="album-date-group">
                    <h3 className="album-date-label">{dateLabel}</h3>
                    <div className="album-grid">
                      {photos.map((photo) => (
                        <img key={photo.id} src={photo.dataUrl} alt={`Snapshot ${dateLabel}`} className="album-photo" />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
