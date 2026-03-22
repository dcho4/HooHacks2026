import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Baby, Heart, ArrowRight, ArrowLeft, Stethoscope, Star, Shield, BookOpen, Mail, Lock, User } from 'lucide-react';

const MEDICAL_CONDITIONS = [
  'Diabetes', 'Heart Condition', 'Premature Birth', 'Jaundice',
  'Respiratory Issues', 'Allergies', 'Reflux / GERD', 'Tongue Tie',
  'Down Syndrome', 'Other',
];

const FAMILY_HISTORY_OPTIONS = [
  'Heart Disease', 'Diabetes (Type 1)', 'Diabetes (Type 2)', 'Cancer',
  'Asthma', 'Allergies', 'Mental Health Conditions', 'Autoimmune Disorders',
  'High Blood Pressure', 'Sickle Cell Disease', 'Cystic Fibrosis', 'Other',
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(month, year) {
  if (month === -1) return 31;
  return new Date(year, month + 1, 0).getDate();
}

function ScrollColumn({ items, selectedIndex, onSelect, label }) {
  const containerRef = useRef(null);
  const itemHeight = 44;

  useEffect(() => {
    if (containerRef.current && selectedIndex >= 0) {
      containerRef.current.scrollTop = selectedIndex * itemHeight;
    }
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const idx = Math.round(containerRef.current.scrollTop / itemHeight);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    if (clamped !== selectedIndex) onSelect(clamped);
  };

  return (
    <div className="scroll-col">
      <span className="scroll-col-label">{label}</span>
      <div className="scroll-col-track">
        <div className="scroll-col-highlight" />
        <div className="scroll-col-list" ref={containerRef} onScroll={handleScroll}>
          <div style={{ height: itemHeight * 2 }} />
          {items.map((item, i) => (
            <div
              key={i}
              className={`scroll-col-item ${i === selectedIndex ? 'active' : ''}`}
              style={{ height: itemHeight }}
              onClick={() => {
                onSelect(i);
                containerRef.current.scrollTo({ top: i * itemHeight, behavior: 'smooth' });
              }}
            >
              {item}
            </div>
          ))}
          <div style={{ height: itemHeight * 2 }} />
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { setBabyProfile, setParentName, parentName, setAccount, setIsLoggedIn } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Account
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountError, setAccountError] = useState('');

  // Baby
  const [parent, setParent] = useState(parentName || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState('');
  const [hasMedical, setHasMedical] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [otherCondition, setOtherCondition] = useState('');
  const [familyHistory, setFamilyHistory] = useState([]);
  const [familyHistoryOther, setFamilyHistoryOther] = useState('');

  // DOB
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate() - 1);
  const [selectedYear, setSelectedYear] = useState(0);

  // State
  const [selectedStateIdx, setSelectedStateIdx] = useState(0);

  const daysInMonth = getDaysInMonth(selectedMonth, years[selectedYear]);
  const dayItems = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    if (selectedDay >= daysInMonth) setSelectedDay(daysInMonth - 1);
  }, [selectedMonth, selectedYear, daysInMonth, selectedDay]);

  const getDateOfBirth = () => {
    const y = years[selectedYear];
    const m = String(selectedMonth + 1).padStart(2, '0');
    const d = String(dayItems[selectedDay] || 1).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const toggleCondition = (c) => {
    setConditions((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const toggleFamilyHistory = (c) => {
    setFamilyHistory((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  /*
    Steps:
    0 = Welcome splash
    1 = Create account
    2 = Parent name
    3 = Baby name
    4 = DOB scroll
    5 = Sex
    6 = State selection
    7 = Medical conditions yes/no
    8 = Medical conditions selection (if yes)
    9 = Family history
  */

  const canNext = () => {
    switch (step) {
      case 0: return true;
      case 1: {
        if (!email.trim() || !username.trim() || !password || !confirmPassword) return false;
        if (password !== confirmPassword) return false;
        if (password.length < 6) return false;
        if (!email.includes('@')) return false;
        return true;
      }
      case 2: return parent.trim().length > 0;
      case 3: return firstName.trim().length > 0;
      case 4: return true;
      case 5: return sex.length > 0;
      case 6: return true;
      case 7: return hasMedical !== null;
      case 8: return conditions.length > 0;
      case 9: return true; // family history is optional
      default: return true;
    }
  };

  const totalSteps = hasMedical ? 10 : 9;

  const handleNext = () => {
    if (step === 1) {
      if (password !== confirmPassword) {
        setAccountError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setAccountError('Password must be at least 6 characters.');
        return;
      }
      if (!email.includes('@')) {
        setAccountError('Please enter a valid email.');
        return;
      }
      setAccountError('');
    }
    if (step === 7 && hasMedical === false) {
      setStep(9); // skip to family history
      return;
    }
    if (step === totalSteps - 1) {
      finish();
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 9 && hasMedical === false) {
      setStep(7);
      return;
    }
    setStep(step - 1);
  };

  const finish = () => {
    const finalConditions = hasMedical ? [...conditions] : [];
    if (hasMedical && conditions.includes('Other') && otherCondition.trim()) {
      const idx = finalConditions.indexOf('Other');
      finalConditions[idx] = `Other: ${otherCondition.trim()}`;
    }
    const finalFamilyHistory = [...familyHistory];
    if (familyHistory.includes('Other') && familyHistoryOther.trim()) {
      const idx = finalFamilyHistory.indexOf('Other');
      finalFamilyHistory[idx] = `Other: ${familyHistoryOther.trim()}`;
    }

    setAccount({ email: email.trim(), username: username.trim(), password });
    setIsLoggedIn(true);
    setParentName(parent.trim());
    setBabyProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: getDateOfBirth(),
      sex,
      hasMedicalConditions: hasMedical,
      medicalConditions: finalConditions,
      familyHistory: finalFamilyHistory,
      familyHistoryOther: familyHistory.includes('Other') ? familyHistoryOther.trim() : '',
      state: US_STATES[selectedStateIdx],
      onboardingComplete: true,
    });
    navigate('/home');
  };

  return (
    <div className="onboarding">
      <div className="onboarding-header">
        <div className="logo-mark"><Baby size={40} /></div>
        <h1>BabyBoo</h1>
        <p className="tagline">Your calm companion for the first 1000 days</p>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
      </div>

      <div className="onboarding-card">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="step">
            <h2>Welcome to BabyBoo</h2>
            <p>Everything you need for your parenting journey, all in one place.</p>
            <div className="welcome-features">
              <div className="welcome-feature">
                <div className="welcome-feature-icon pink-bg"><Heart size={20} /></div>
                <div><strong>Track & Log</strong><span>Feeds, sleep, diapers, and growth milestones</span></div>
              </div>
              <div className="welcome-feature">
                <div className="welcome-feature-icon blue-bg"><Star size={20} /></div>
                <div><strong>AI Guidance</strong><span>Personalized advice tailored to your baby</span></div>
              </div>
              <div className="welcome-feature">
                <div className="welcome-feature-icon green-bg"><Shield size={20} /></div>
                <div><strong>Health & Medical</strong><span>Vaccines, growth charts, and condition tracking</span></div>
              </div>
              <div className="welcome-feature">
                <div className="welcome-feature-icon amber-bg"><BookOpen size={20} /></div>
                <div><strong>Journal & Memories</strong><span>Capture precious moments and reflections</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Create Account */}
        {step === 1 && (
          <div className="step">
            <User size={32} className="step-icon lavender" />
            <h2>Create Your Account</h2>
            <p>Set up your login credentials</p>
            {accountError && <div className="login-error"><span>{accountError}</span></div>}
            <div className="input-with-icon">
              <Mail size={18} />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="input-with-icon">
              <User size={18} />
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="input-with-icon">
              <Lock size={18} />
              <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="input-with-icon">
              <Lock size={18} />
              <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 2: Parent Name */}
        {step === 2 && (
          <div className="step">
            <Heart size={32} className="step-icon pink" />
            <h2>Let's get to know you!</h2>
            <p>What should we call you?</p>
            <input type="text" placeholder="e.g. Mom, Dad, Alex..." value={parent} onChange={(e) => setParent(e.target.value)} autoFocus />
          </div>
        )}

        {/* Step 3: Baby Name */}
        {step === 3 && (
          <div className="step">
            <Baby size={32} className="step-icon lavender" />
            <h2>Tell us about your little one</h2>
            <p>Baby's name</p>
            <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
            <input type="text" placeholder="Last name (optional)" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        )}

        {/* Step 4: DOB */}
        {step === 4 && (
          <div className="step">
            <Baby size={32} className="step-icon blue" />
            <h2>When was {firstName || 'baby'} born?</h2>
            <p>Scroll to select the date (or expected due date)</p>
            <div className="dob-picker">
              <ScrollColumn items={MONTHS} selectedIndex={selectedMonth} onSelect={setSelectedMonth} label="Month" />
              <ScrollColumn items={dayItems.map(String)} selectedIndex={selectedDay} onSelect={setSelectedDay} label="Day" />
              <ScrollColumn items={years.map(String)} selectedIndex={selectedYear} onSelect={setSelectedYear} label="Year" />
            </div>
            <div className="dob-preview">{MONTHS[selectedMonth]} {dayItems[selectedDay] || 1}, {years[selectedYear]}</div>
          </div>
        )}

        {/* Step 5: Sex */}
        {step === 5 && (
          <div className="step">
            <Baby size={32} className="step-icon pink" />
            <h2>What's {firstName || 'baby'}'s sex?</h2>
            <div className="option-group">
              {['Male', 'Female'].map((s) => (
                <button key={s} className={`option-btn ${sex === s ? 'selected' : ''}`} onClick={() => setSex(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: State */}
        {step === 6 && (
          <div className="step">
            <Shield size={32} className="step-icon blue" />
            <h2>Where are you located?</h2>
            <p>Select your state for localized vaccine schedules</p>
            <div className="state-picker">
              <ScrollColumn items={US_STATES} selectedIndex={selectedStateIdx} onSelect={setSelectedStateIdx} label="State" />
            </div>
            <div className="dob-preview">{US_STATES[selectedStateIdx]}</div>
          </div>
        )}

        {/* Step 7: Has Medical? */}
        {step === 7 && (
          <div className="step">
            <Stethoscope size={32} className="step-icon green" />
            <h2>Any medical conditions?</h2>
            <p>Does {firstName || 'baby'} have any known medical conditions?</p>
            <div className="option-group">
              <button className={`option-btn ${hasMedical === true ? 'selected' : ''}`} onClick={() => setHasMedical(true)}>Yes</button>
              <button className={`option-btn ${hasMedical === false ? 'selected' : ''}`} onClick={() => setHasMedical(false)}>No</button>
            </div>
          </div>
        )}

        {/* Step 8: Conditions */}
        {step === 8 && hasMedical && (
          <div className="step">
            <Stethoscope size={32} className="step-icon green" />
            <h2>Select conditions</h2>
            <p>Select all that apply</p>
            <div className="condition-grid">
              {MEDICAL_CONDITIONS.map((c) => (
                <button key={c} className={`condition-chip ${conditions.includes(c) ? 'selected' : ''}`} onClick={() => toggleCondition(c)}>{c}</button>
              ))}
            </div>
            {conditions.includes('Other') && (
              <div className="other-condition-input">
                <input type="text" placeholder="Please specify the condition..." value={otherCondition} onChange={(e) => setOtherCondition(e.target.value)} autoFocus />
              </div>
            )}
          </div>
        )}

        {/* Step 9: Family History */}
        {step === 9 && (
          <div className="step">
            <Heart size={32} className="step-icon pink" />
            <h2>Family Medical History</h2>
            <p>Select any conditions that run in the family (optional — helps personalize AI advice)</p>
            <div className="condition-grid">
              {FAMILY_HISTORY_OPTIONS.map((c) => (
                <button key={c} className={`condition-chip ${familyHistory.includes(c) ? 'selected' : ''}`} onClick={() => toggleFamilyHistory(c)}>{c}</button>
              ))}
            </div>
            {familyHistory.includes('Other') && (
              <div className="other-condition-input">
                <input type="text" placeholder="Please specify..." value={familyHistoryOther} onChange={(e) => setFamilyHistoryOther(e.target.value)} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="onboarding-actions">
        {step > 0 && (
          <button className="btn-secondary" onClick={handleBack}>
            <ArrowLeft size={18} /> Back
          </button>
        )}
        <button className="btn-primary" disabled={!canNext()} onClick={handleNext}>
          {step === 0 ? 'Get Started'
            : step === totalSteps - 1 ? "Let's Go!"
            : 'Next'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
