import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Baby, Heart, ArrowRight, ArrowLeft, Stethoscope, Star, Shield, BookOpen, Mail, Lock, User, AlertCircle, Users } from 'lucide-react';

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
  const { setBabyProfile, setParentName, parentName, setAccount, setIsLoggedIn, hasAuth0, auth0User, joinFamily } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Role selection
  const [role, setRole] = useState(''); // 'parent' or 'coparent'
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

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

  const isCoParent = role === 'coparent';

  /*
    Steps (local, parent):  0=Welcome, 1=Role, 2=Account, 3=Parent, 4=Baby, 5=DOB, 6=Sex, 7=State, 8=Medical?, 9=Conditions, 10=FamilyHistory
    Steps (local, coparent): 0=Welcome, 1=Role (join code), 2=Account, 3=Parent, done
    Steps (auth0, parent):  0=Welcome, 1=Role, 2=Parent, 3=Baby, 4=DOB, 5=Sex, 6=State, 7=Medical?, 8=Conditions, 9=FamilyHistory
    Steps (auth0, coparent): 0=Welcome, 1=Role (join code), 2=Parent, done
  */
  const STEP_ROLE = 1;
  const STEP_ACCOUNT = skipAccountStep ? -1 : 2;
  const baseOffset = skipAccountStep ? 1 : 0;
  const STEP_PARENT = 3 - baseOffset;
  const STEP_BABY = 4 - baseOffset;
  const STEP_DOB = 5 - baseOffset;
  const STEP_SEX = 6 - baseOffset;
  const STEP_STATE = 7 - baseOffset;
  const STEP_MEDICAL = 8 - baseOffset;
  const STEP_CONDITIONS = 9 - baseOffset;
  const STEP_FAMILY_HISTORY = 10 - baseOffset;

  const getAccountErrors = () => {
    const errs = [];
    if (email.trim() && !email.includes('@')) errs.push('Enter a valid email address');
    if (username.trim() && username.trim().length < 3) errs.push('Username must be at least 3 characters');
    if (password && password.length < 6) errs.push('Password must be at least 6 characters');
    if (confirmPassword && password !== confirmPassword) errs.push('Passwords do not match');
    return errs;
  };

  const getTotalSteps = () => {
    if (isCoParent) return STEP_PARENT + 1; // ends after parent name
    return hasMedical ? STEP_FAMILY_HISTORY + 1 : STEP_FAMILY_HISTORY;
  };

  const totalSteps = getTotalSteps();

  const canNext = () => {
    switch (step) {
      case 0: return true;
      case STEP_ROLE: {
        if (!role) return false;
        if (isCoParent && joinCode.length < 6) return false;
        return true;
      }
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

  const handleNext = () => {
    // Validate account step
    if (step === STEP_ACCOUNT && !skipAccountStep) {
      const errs = getAccountErrors();
      if (errs.length > 0) { setAccountError(errs[0]); return; }
      setAccountError('');
    }

    // Co-parent: after parent name, finish
    if (isCoParent && step === STEP_PARENT) {
      finishCoParent();
      return;
    }

    // Skip baby steps for co-parent
    if (step === STEP_ROLE && isCoParent) {
      // Jump to account step (or parent step if auth0)
      setStep(skipAccountStep ? STEP_PARENT : STEP_ACCOUNT);
      return;
    }

    // Skip conditions if no medical
    if (step === STEP_MEDICAL && hasMedical === false) {
      setStep(STEP_FAMILY_HISTORY);
      return;
    }

    // Last step
    if (step === totalSteps - 1 || (step === STEP_FAMILY_HISTORY && !hasMedical)) {
      finish();
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    // Co-parent going back from parent step
    if (isCoParent && step === STEP_PARENT) {
      setStep(skipAccountStep ? STEP_ROLE : STEP_ACCOUNT);
      return;
    }
    if (isCoParent && step === STEP_ACCOUNT) {
      setStep(STEP_ROLE);
      return;
    }
    if (step === STEP_FAMILY_HISTORY && hasMedical === false) {
      setStep(STEP_MEDICAL);
      return;
    }
    setStep(step - 1);
  };

  const finishCoParent = () => {
    // Save the join code to localStorage so Family page can use it
    const existingFamilies = JSON.parse(localStorage.getItem('joinedFamilies') || '[]');
    if (!existingFamilies.includes(joinCode)) {
      existingFamilies.push(joinCode);
      localStorage.setItem('joinedFamilies', JSON.stringify(existingFamilies));
    }

    if (!skipAccountStep) {
      setAccount({ email: email.trim(), username: username.trim(), password });
    }
    setIsLoggedIn(true);
    setParentName(parent.trim());
    setBabyProfile({
      firstName: '', lastName: '', dateOfBirth: '', sex: '',
      hasMedicalConditions: false, medicalConditions: [],
      familyHistory: [], familyHistoryOther: '',
      state: '', onboardingComplete: true,
    });
    navigate('/home');
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

    if (!skipAccountStep) {
      setAccount({ email: email.trim(), username: username.trim(), password });
    }
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

  // For co-parent, progress is simpler
  const progressSteps = isCoParent ? (STEP_PARENT + 1) : totalSteps;

  return (
    <div className="onboarding">
      <div className="onboarding-header">
        <div className="logo-mark"><Baby size={40} /></div>
        <h1>BabyBoo</h1>
        <p className="tagline">Your calm companion for the first 1000 days</p>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((step + 1) / progressSteps) * 100}%` }} />
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

        {/* Step 1: Role Selection */}
        {step === STEP_ROLE && (
          <div className="step">
            <Users size={32} className="step-icon lavender" />
            <h2>What's your role?</h2>
            <p>Are you setting up a new baby profile or joining an existing family?</p>
            <div className="option-group" style={{ flexDirection: 'column' }}>
              <button className={`option-btn ${role === 'parent' ? 'selected' : ''}`} onClick={() => { setRole('parent'); setJoinError(''); }}>
                <strong>Parent</strong>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>Set up a new baby profile</span>
              </button>
              <button className={`option-btn ${role === 'coparent' ? 'selected' : ''}`} onClick={() => { setRole('coparent'); setJoinError(''); }}>
                <strong>Co-Parent / Caregiver</strong>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>Join an existing family with a code</span>
              </button>
            </div>
            {role === 'coparent' && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Enter the 6-character family code shared with you:</p>
                {joinError && <div className="login-error"><AlertCircle size={16} />{joinError}</div>}
                <div className="join-row">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={joinCode}
                    onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                    maxLength={6}
                    autoFocus
                  />
                </div>
              </div>
            )}
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

        {/* Baby steps - only for parent role */}
        {!isCoParent && (
          <>
            {step === STEP_BABY && (
              <div className="step">
                <Baby size={32} className="step-icon lavender" />
                <h2>Tell us about your little one</h2>
                <p>Baby's name</p>
                <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
                <input type="text" placeholder="Last name (optional)" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            )}

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
          </>
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
            : (isCoParent && step === STEP_PARENT) ? "Let's Go!"
            : step === totalSteps - 1 || (step === STEP_FAMILY_HISTORY && !hasMedical) ? "Let's Go!"
            : 'Next'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
