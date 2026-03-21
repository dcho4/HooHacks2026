import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Baby, Heart, ArrowRight, ArrowLeft, Stethoscope } from 'lucide-react';

const MEDICAL_CONDITIONS = [
  'Diabetes',
  'Heart Condition',
  'Premature Birth',
  'Jaundice',
  'Respiratory Issues',
  'Allergies',
  'Reflux / GERD',
  'Tongue Tie',
  'Down Syndrome',
  'Other',
];

export default function Onboarding() {
  const { setBabyProfile, setParentName, parentName } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [parent, setParent] = useState(parentName || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('');
  const [hasMedical, setHasMedical] = useState(null);
  const [conditions, setConditions] = useState([]);

  const toggleCondition = (c) => {
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const canNext = () => {
    switch (step) {
      case 0: return parent.trim().length > 0;
      case 1: return firstName.trim().length > 0;
      case 2: return dateOfBirth.length > 0;
      case 3: return sex.length > 0;
      case 4: return hasMedical !== null;
      case 5: return conditions.length > 0;
      default: return true;
    }
  };

  const totalSteps = hasMedical ? 6 : 5;

  const handleNext = () => {
    if (step === 4 && hasMedical === false) {
      finish();
      return;
    }
    if (step === totalSteps - 1) {
      finish();
      return;
    }
    setStep(step + 1);
  };

  const finish = () => {
    setParentName(parent.trim());
    setBabyProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      sex,
      hasMedicalConditions: hasMedical,
      medicalConditions: hasMedical ? conditions : [],
      onboardingComplete: true,
    });
    navigate('/home');
  };

  return (
    <div className="onboarding">
      <div className="onboarding-header">
        <div className="logo-mark">
          <Baby size={40} />
        </div>
        <h1>BabyBoo</h1>
        <p className="tagline">Your calm companion for the first 1000 days</p>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>

      <div className="onboarding-card">
        {step === 0 && (
          <div className="step">
            <Heart size={32} className="step-icon pink" />
            <h2>Welcome!</h2>
            <p>What should we call you?</p>
            <input
              type="text"
              placeholder="e.g. Mom, Dad, Alex..."
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {step === 1 && (
          <div className="step">
            <Baby size={32} className="step-icon lavender" />
            <h2>Tell us about your little one</h2>
            <p>Baby's name</p>
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoFocus
            />
            <input
              type="text"
              placeholder="Last name (optional)"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <Baby size={32} className="step-icon blue" />
            <h2>When was {firstName || 'baby'} born?</h2>
            <p>Or expected due date if not yet born</p>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
        )}

        {step === 3 && (
          <div className="step">
            <Baby size={32} className="step-icon pink" />
            <h2>What's {firstName || 'baby'}'s sex?</h2>
            <div className="option-group">
              {['Male', 'Female'].map((s) => (
                <button
                  key={s}
                  className={`option-btn ${sex === s ? 'selected' : ''}`}
                  onClick={() => setSex(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step">
            <Stethoscope size={32} className="step-icon green" />
            <h2>Any medical conditions?</h2>
            <p>Does {firstName || 'baby'} have any known medical conditions?</p>
            <div className="option-group">
              <button
                className={`option-btn ${hasMedical === true ? 'selected' : ''}`}
                onClick={() => setHasMedical(true)}
              >
                Yes
              </button>
              <button
                className={`option-btn ${hasMedical === false ? 'selected' : ''}`}
                onClick={() => setHasMedical(false)}
              >
                No
              </button>
            </div>
          </div>
        )}

        {step === 5 && hasMedical && (
          <div className="step">
            <Stethoscope size={32} className="step-icon green" />
            <h2>Select conditions</h2>
            <p>Select all that apply</p>
            <div className="condition-grid">
              {MEDICAL_CONDITIONS.map((c) => (
                <button
                  key={c}
                  className={`condition-chip ${conditions.includes(c) ? 'selected' : ''}`}
                  onClick={() => toggleCondition(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="onboarding-actions">
        {step > 0 && (
          <button className="btn-secondary" onClick={() => setStep(step - 1)}>
            <ArrowLeft size={18} /> Back
          </button>
        )}
        <button
          className="btn-primary"
          disabled={!canNext()}
          onClick={handleNext}
        >
          {step === totalSteps - 1 || (step === 4 && hasMedical === false)
            ? "Let's Go!"
            : 'Next'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
