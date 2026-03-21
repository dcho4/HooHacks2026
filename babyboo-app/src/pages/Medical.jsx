import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Baby,
  Edit3,
  Save,
  Ruler,
  Weight,
  Plus,
  Syringe,
  AlertTriangle,
  CheckCircle,
  Calendar,
  X,
} from 'lucide-react';

const VACCINE_SCHEDULE = [
  { age: 'Birth', vaccine: 'Hepatitis B (1st dose)', done: false },
  { age: '2 months', vaccine: 'DTaP, IPV, Hib, PCV13, RV, HepB (2nd)', done: false },
  { age: '4 months', vaccine: 'DTaP, IPV, Hib, PCV13, RV', done: false },
  { age: '6 months', vaccine: 'DTaP, PCV13, RV, HepB (3rd), Flu', done: false },
  { age: '12 months', vaccine: 'MMR, Varicella, HepA, PCV13 (4th)', done: false },
];

export default function Medical() {
  const { babyProfile, setBabyProfile, growthEntries, addGrowthEntry } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...babyProfile });
  const [showGrowth, setShowGrowth] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCirc, setHeadCirc] = useState('');
  const [vaccines, setVaccines] = useState(VACCINE_SCHEDULE);
  const [activeTab, setActiveTab] = useState('info');

  const handleSave = () => {
    setBabyProfile({ ...form, onboardingComplete: true });
    setEditing(false);
  };

  const handleAddGrowth = () => {
    if (!weight && !height) return;
    addGrowthEntry({ weight, height, headCircumference: headCirc });
    setWeight('');
    setHeight('');
    setHeadCirc('');
    setShowGrowth(false);
  };

  const toggleVaccine = (idx) => {
    setVaccines((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, done: !v.done } : v))
    );
  };

  return (
    <div className="medical-page">
      <h1 className="page-title">Medical Info</h1>

      {/* Tabs */}
      <div className="tab-row">
        {['info', 'growth', 'vaccines'].map((t) => (
          <button
            key={t}
            className={`tab-btn ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t === 'info' && 'Baby Info'}
            {t === 'growth' && 'Growth'}
            {t === 'vaccines' && 'Vaccines'}
          </button>
        ))}
      </div>

      {/* Baby Info Tab */}
      {activeTab === 'info' && (
        <section className="card">
          <div className="card-header">
            <h2><Baby size={18} /> Baby Info</h2>
            <button className="icon-btn" onClick={() => editing ? handleSave() : setEditing(true)}>
              {editing ? <Save size={18} /> : <Edit3 size={18} />}
            </button>
          </div>

          <div className="info-grid">
            <div className="info-field">
              <label>First Name</label>
              {editing ? (
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              ) : (
                <span className="info-value">{babyProfile.firstName || '—'}</span>
              )}
            </div>

            <div className="info-field">
              <label>Last Name</label>
              {editing ? (
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              ) : (
                <span className="info-value">{babyProfile.lastName || '—'}</span>
              )}
            </div>

            <div className="info-field">
              <label>Date of Birth</label>
              {editing ? (
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                />
              ) : (
                <span className="info-value">
                  {babyProfile.dateOfBirth
                    ? new Date(babyProfile.dateOfBirth).toLocaleDateString()
                    : '—'}
                </span>
              )}
            </div>

            <div className="info-field">
              <label>Sex</label>
              {editing ? (
                <select
                  value={form.sex}
                  onChange={(e) => setForm({ ...form, sex: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <span className="info-value">{babyProfile.sex || '—'}</span>
              )}
            </div>

            <div className="info-field full">
              <label>Medical Conditions</label>
              <span className="info-value">
                {babyProfile.hasMedicalConditions
                  ? babyProfile.medicalConditions.join(', ')
                  : 'None'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Growth Tab */}
      {activeTab === 'growth' && (
        <section className="card">
          <div className="card-header">
            <h2><Ruler size={18} /> Growth Tracker</h2>
            <button className="icon-btn" onClick={() => setShowGrowth(true)}>
              <Plus size={18} />
            </button>
          </div>

          {growthEntries.length === 0 ? (
            <p className="empty-state">No growth entries yet. Tap + to add one.</p>
          ) : (
            <div className="growth-list">
              {growthEntries.map((e) => (
                <div key={e.id} className="growth-item">
                  <Calendar size={14} />
                  <span className="growth-date">
                    {new Date(e.date).toLocaleDateString()}
                  </span>
                  {e.weight && (
                    <span className="growth-badge"><Weight size={12} /> {e.weight}</span>
                  )}
                  {e.height && (
                    <span className="growth-badge"><Ruler size={12} /> {e.height}</span>
                  )}
                  {e.headCircumference && (
                    <span className="growth-badge">Head: {e.headCircumference}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {showGrowth && (
            <div className="modal-overlay" onClick={() => setShowGrowth(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Add Growth Entry</h2>
                  <button className="modal-close" onClick={() => setShowGrowth(false)}><X size={20} /></button>
                </div>
                <div className="modal-body">
                  <label>Weight (lbs or kg)</label>
                  <input type="text" placeholder="e.g. 8.5 lbs" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  <label>Height / Length (in or cm)</label>
                  <input type="text" placeholder="e.g. 21 in" value={height} onChange={(e) => setHeight(e.target.value)} />
                  <label>Head Circumference (optional)</label>
                  <input type="text" placeholder="e.g. 14 in" value={headCirc} onChange={(e) => setHeadCirc(e.target.value)} />
                </div>
                <button className="btn-primary full-width" onClick={handleAddGrowth}>
                  <Plus size={18} /> Save
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Vaccines Tab */}
      {activeTab === 'vaccines' && (
        <section className="card">
          <h2><Syringe size={18} /> Vaccine Schedule</h2>
          <div className="vaccine-list">
            {vaccines.map((v, i) => (
              <div
                key={i}
                className={`vaccine-item ${v.done ? 'done' : ''}`}
                onClick={() => toggleVaccine(i)}
              >
                <div className="vaccine-check">
                  {v.done ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <span className="vaccine-age">{v.age}</span>
                  <span className="vaccine-name">{v.vaccine}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
