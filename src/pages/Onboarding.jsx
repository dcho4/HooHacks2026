import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Baby, Heart, ArrowRight, ArrowLeft, Stethoscope, Star, Shield, BookOpen, Mail, Lock, User, AlertCircle } from 'lucide-react';

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
  const { setBabyProfile, setParentName, parentName, setAccount, setIsLoggedIn, hasAuth0, auth0User } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Account (local mode only)
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountError, setAccountError] = useState('');
  const skipAccountStep = hasAuth0;

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
    Steps (local mode):    0=Welcome, 1=Account, 2=Parent, 3=Baby, 4=DOB, 5=Sex, 6=State, 7=Medical?, 8=Conditions, 9=FamilyHistory
    Steps (Auth0 mode):    0=Welcome, 1=Parent, 2=Baby, 3=DOB, 4=Sex, 5=State, 6=Medical?, 7=Conditions, 8=FamilyHistory
  */
  const STEP_ACCOUNT = skipAccountStep ? -1 : 1;
  const offset = skipAccountStep ? 1 : 0;
  const STEP_PARENT = 2 - offset;
  const STEP_BABY = 3 - offset;
  const STEP_DOB = 4 - offset;
  const STEP_SEX = 5 - offset;
  const STEP_STATE = 6 - offset;
  const STEP_MEDICAL = 7 - offset;
  const STEP_CONDITIONS = 8 - offset;
  const STEP_FAMILY_HISTORY = 9 - offset;

  // Live validation errors for account step
  const getAccountErrors = () => {
    const errs = [];
    if (email.trim() && !email.includes('@')) errs.push('Enter a valid email address');
    if (username.trim() && username.trim().length < 3) errs.push('Username must be at least 3 characters');
    if (password && password.length < 6) errs.push('Password must be at least 6 characters');
    if (confirmPassword && password !== confirmPassword) errs.push('Passwords do not match');
    return errs;
  };

  const canNext = () => {
    switch (step) {
      case 0: return true;
      case STEP_ACCOUNT: {
        if (!email.trim() || !username.trim() || !password || !confirmPassword) return false;
        if (getAccountErrors().length > 0) return false;
        return true;
      }
      case STEP_PARENT: return parent.trim().length > 0;
      case STEP_BABY: return firstName.trim().length > 0;
      case STEP_DOB: return true;
      case STEP_SEX: return sex.length > 0;
      case STEP_STATE: return true;
      case STEP_MEDICAL: return hasMedical !== null;
      case STEP_CONDITIONS: return conditions.length > 0;
      case STEP_FAMILY_HISTORY: return true;
      default: return true;
    }
  };

  const totalSteps = hasMedical ? STEP_FAMILY_HISTORY + 1 : STEP_FAMILY_HISTORY;

  const handleNext = () => {
    if (step === STEP_ACCOUNT && !skipAccountStep) {
      const errs = getAccountErrors();
      if (errs.length > 0) { setAccountError(errs[0]); return; }
      setAccountError('');
    }
    if (step === STEP_MEDICAL && hasMedical === false) {
      setStep(STEP_FAMILY_HISTORY);
      return;
    }
    if (step === totalSteps - 1 || (step === STEP_FAMILY_HISTORY && !hasMedical)) {
      finish();
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === STEP_FAMILY_HISTORY && hasMedical === false) {
      setStep(STEP_MEDICAL);
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

        {/* Step: Create Account (local mode only) */}
        {step === STEP_ACCOUNT && !skipAccountStep && (
          <div className="step">
            <User size={32} className="step-icon lavender" />
            <h2>Create Your Account</h2>
            <p>Set up your login credentials</p>
            {accountError && <div className="login-error"><AlertCircle size={16} /><span>{accountError}</span></div>}
            <div className="input-with-icon">
              <Mail size={18} />
              <input type="email" placeholder="Email address" value={email} onChange={(e) => { setEmail(e.target.value); setAccountError(''); }} autoFocus />
            </div>
            {email.trim() && !email.includes('@') && <p className="field-error">Please enter a valid email</p>}
            <div className="input-with-icon">
              <User size={18} />
              <input type="text" placeholder="Username (min 3 chars)" value={username} onChange={(e) => { setUsername(e.target.value); setAccountError(''); }} />
            </div>
            {username.trim() && username.trim().length < 3 && <p className="field-error">Username must be at least 3 characters</p>}
            <div className="input-with-icon">
              <Lock size={18} />
              <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => { setPassword(e.target.value); setAccountError(''); }} />
            </div>
            {password && password.length < 6 && <p className="field-error">Password must be at least 6 characters</p>}
            <div className="input-with-icon">
              <Lock size={18} />
              <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setAccountError(''); }} />
            </div>
            {confirmPassword && password !== confirmPassword && <p className="field-error">Passwords do not match</p>}
          </div>
        )}

        {/* Step: Parent Name */}
        {step === STEP_PARENT && (
          <div className="step">
            <Heart size={32} className="step-icon pink" />
            <h2>Let's get to know you!</h2>
            <p>What should we call you?</p>
            <input type="text" placeholder="e.g. Mom, Dad, Alex..." value={parent} onChange={(e) => setParent(e.target.value)} autoFocus />
          </div>
        )}

        {/* Step 3: Baby Name */}
        {step === STEP_BABY && (
          <div className="step">
            <Baby size={32} className="step-icon lavender" />
            <h2>Tell us about your little one</h2>
            <p>Baby's name</p>
            <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
            <input type="text" placeholder="Last name (optional)" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        )}

        {/* Step 4: DOB */}
        {step === STEP_DOB && (
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
        {step === STEP_SEX && (
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
        {step === STEP_STATE && (
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
        {step === STEP_MEDICAL && (
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
        {step === STEP_CONDITIONS && hasMedical && (
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
        {step === STEP_FAMILY_HISTORY && (
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
