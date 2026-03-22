import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Baby, Edit3, Save, Ruler, Weight, Plus, Syringe,
  AlertTriangle, CheckCircle, Calendar, X, Heart, Shield,
} from 'lucide-react';

const ALL_MEDICAL_CONDITIONS = [
  'Diabetes', 'Heart Condition', 'Premature Birth', 'Jaundice',
  'Respiratory Issues', 'Allergies', 'Reflux / GERD', 'Tongue Tie',
  'Down Syndrome', 'Other',
];

const FAMILY_HISTORY_OPTIONS = [
  'Heart Disease', 'Diabetes (Type 1)', 'Diabetes (Type 2)', 'Cancer',
  'Asthma', 'Allergies', 'Mental Health Conditions', 'Autoimmune Disorders',
  'High Blood Pressure', 'Sickle Cell Disease', 'Cystic Fibrosis', 'Other',
];

const FLU_REQUIRED_STATES = ['Connecticut', 'New Jersey', 'New York', 'Ohio', 'Rhode Island'];

function getVaccineSchedule(state, conditions) {
  const isImmunocompromised = conditions.some(c =>
    c.toLowerCase().includes('immune') || c.toLowerCase().includes('hiv')
  );
  const hasEggAllergy = conditions.some(c => c.toLowerCase().includes('allerg'));
  const isPremature = conditions.includes('Premature Birth');
  const hasHeartCondition = conditions.includes('Heart Condition');
  const hasRespiratory = conditions.includes('Respiratory Issues');
  const hasDiabetes = conditions.includes('Diabetes');
  const hasDownSyndrome = conditions.includes('Down Syndrome');
  const fluRequired = FLU_REQUIRED_STATES.includes(state);

  const schedule = [];
  let id = 0;

  // Birth
  schedule.push({
    id: id++, age: 'Birth', vaccine: 'Hepatitis B (1st dose)',
    required: true, stateRequired: true,
    notes: isPremature ? 'Premature: if birth weight < 2000g, this dose may not count — discuss with pediatrician' : '',
  });

  // 2 months
  schedule.push({ id: id++, age: '2 months', vaccine: 'DTaP (1st dose)', required: true, stateRequired: true, notes: '' });
  schedule.push({ id: id++, age: '2 months', vaccine: 'IPV / Polio (1st dose)', required: true, stateRequired: true, notes: '' });
  schedule.push({ id: id++, age: '2 months', vaccine: 'Hib (1st dose)', required: true, stateRequired: true, notes: '' });
  schedule.push({ id: id++, age: '2 months', vaccine: 'PCV13 / Pneumococcal (1st dose)', required: true, stateRequired: true,
    notes: hasRespiratory || hasDownSyndrome ? 'Especially important due to respiratory/immune considerations' : '' });
  if (!isImmunocompromised) {
    schedule.push({ id: id++, age: '2 months', vaccine: 'Rotavirus (1st dose)', required: false, stateRequired: false,
      notes: 'Live vaccine — recommended but not state-required' });
  } else {
    schedule.push({ id: id++, age: '2 months', vaccine: 'Rotavirus (1st dose)', required: false, stateRequired: false,
      notes: '⚠️ CONTRAINDICATED — live vaccine not safe for immunocompromised babies', contraindicated: true });
  }
  schedule.push({ id: id++, age: '2 months', vaccine: 'Hepatitis B (2nd dose)', required: true, stateRequired: true, notes: '' });

  // 4 months
  schedule.push({ id: id++, age: '4 months', vaccine: 'DTaP (2nd dose)', required: true, stateRequired: true, notes: '' });
  schedule.push({ id: id++, age: '4 months', vaccine: 'IPV / Polio (2nd dose)', required: true, stateRequired: true, notes: '' });
  schedule.push({ id: id++, age: '4 months', vaccine: 'Hib (2nd dose)', required: true, stateRequired: true, notes: '' });
  schedule.push({ id: id++, age: '4 months', vaccine: 'PCV13 / Pneumococcal (2nd dose)', required: true, stateRequired: true, notes: '' });
  if (!isImmunocompromised) {
    schedule.push({ id: id++, age: '4 months', vaccine: 'Rotavirus (2nd dose)', required: false, stateRequired: false, notes: '' });
  }

  // 6 months
  schedule.push({ id: id++, age: '6 months', vaccine: 'DTaP (3rd dose)', required: true, stateRequired: true, notes: '' });
  schedule.push({ id: id++, age: '6 months', vaccine: 'PCV13 / Pneumococcal (3rd dose)', required: true, stateRequired: true, notes: '' });
  if (!isImmunocompromised) {
    schedule.push({ id: id++, age: '6 months', vaccine: 'Rotavirus (3rd dose)', required: false, stateRequired: false,
      notes: '3rd dose only needed for RotaTeq brand' });
  }
  schedule.push({ id: id++, age: '6 months', vaccine: 'Hepatitis B (3rd dose)', required: true, stateRequired: true, notes: '' });

  // 6 months - Flu
  const fluNote = hasEggAllergy
    ? '⚠️ Egg allergy: request cell-based (Flucelvax) or recombinant (Flublok) formulation'
    : hasHeartCondition || hasRespiratory || hasDiabetes
      ? 'Especially important due to medical conditions — higher risk for complications'
      : '';
  schedule.push({
    id: id++, age: '6 months', vaccine: 'Influenza (annual, 1st dose)',
    required: fluRequired, stateRequired: fluRequired,
    notes: fluRequired
      ? `Required in ${state} for childcare. ${fluNote}`
      : `Recommended (not required in ${state || 'your state'}). ${fluNote}`,
  });

  // 12-15 months
  if (!isImmunocompromised) {
    schedule.push({ id: id++, age: '12 months', vaccine: 'MMR (1st dose)', required: true, stateRequired: true,
      notes: hasEggAllergy ? 'Safe for egg-allergic children — not grown in eggs' : '' });
    schedule.push({ id: id++, age: '12 months', vaccine: 'Varicella (1st dose)', required: true, stateRequired: true, notes: '' });
  } else {
    schedule.push({ id: id++, age: '12 months', vaccine: 'MMR (1st dose)', required: true, stateRequired: true,
      notes: '⚠️ CONTRAINDICATED — live vaccine. Discuss alternatives with immunologist.', contraindicated: true });
    schedule.push({ id: id++, age: '12 months', vaccine: 'Varicella (1st dose)', required: true, stateRequired: true,
      notes: '⚠️ CONTRAINDICATED — live vaccine. Discuss with immunologist.', contraindicated: true });
  }
  schedule.push({ id: id++, age: '12 months', vaccine: 'Hepatitis A (1st dose)', required: true, stateRequired: true,
    notes: 'Required in most states for childcare entry' });
  schedule.push({ id: id++, age: '12 months', vaccine: 'PCV13 / Pneumococcal (4th dose / booster)', required: true, stateRequired: true, notes: '' });
  schedule.push({ id: id++, age: '12 months', vaccine: 'Hib (booster)', required: true, stateRequired: true, notes: '' });

  // 15-18 months
  schedule.push({ id: id++, age: '15-18 months', vaccine: 'DTaP (4th dose)', required: true, stateRequired: true, notes: '' });

  // 18 months
  schedule.push({ id: id++, age: '18 months', vaccine: 'Hepatitis A (2nd dose)', required: true, stateRequired: true, notes: '' });

  // 4-6 years
  schedule.push({ id: id++, age: '4-6 years', vaccine: 'DTaP (5th dose)', required: true, stateRequired: true, notes: '' });
  schedule.push({ id: id++, age: '4-6 years', vaccine: 'IPV / Polio (4th dose)', required: true, stateRequired: true, notes: '' });
  if (!isImmunocompromised) {
    schedule.push({ id: id++, age: '4-6 years', vaccine: 'MMR (2nd dose)', required: true, stateRequired: true, notes: '' });
    schedule.push({ id: id++, age: '4-6 years', vaccine: 'Varicella (2nd dose)', required: true, stateRequired: true, notes: '' });
  }

  // RSV for high-risk babies
  if (isPremature || hasHeartCondition || hasRespiratory) {
    schedule.push({
      id: id++, age: 'As directed', vaccine: 'RSV Immunization (Nirsevimab/Palivizumab)',
      required: false, stateRequired: false,
      notes: 'Recommended for high-risk infants — discuss timing with pediatrician',
    });
  }

  return schedule;
}

export default function Medical() {
  const { babyProfile, setBabyProfile, growthEntries, addGrowthEntry, vaccineStatus, toggleVaccine } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...babyProfile });
  const [showGrowth, setShowGrowth] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCirc, setHeadCirc] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [editingConditions, setEditingConditions] = useState(false);
  const [editConditions, setEditConditions] = useState(babyProfile.medicalConditions || []);
  const [editOtherCondition, setEditOtherCondition] = useState('');
  const [editingFamilyHistory, setEditingFamilyHistory] = useState(false);
  const [editFamilyHistory, setEditFamilyHistory] = useState(babyProfile.familyHistory || []);
  const [editFamilyHistoryOther, setEditFamilyHistoryOther] = useState(babyProfile.familyHistoryOther || '');

  const handleSave = () => {
    setBabyProfile({ ...form, onboardingComplete: true });
    setEditing(false);
  };

  const handleAddGrowth = () => {
    if (!weight && !height) return;
    addGrowthEntry({ weight, height, headCircumference: headCirc });
    setWeight(''); setHeight(''); setHeadCirc('');
    setShowGrowth(false);
  };

  const toggleEditCondition = (c) => {
    setEditConditions((prev) => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const saveConditions = () => {
    const final = [...editConditions];
    if (editConditions.includes('Other') && editOtherCondition.trim()) {
      const idx = final.indexOf('Other');
      final[idx] = `Other: ${editOtherCondition.trim()}`;
    }
    setBabyProfile({
      ...babyProfile,
      hasMedicalConditions: final.length > 0,
      medicalConditions: final,
    });
    setEditingConditions(false);
  };

  const toggleEditFH = (c) => {
    setEditFamilyHistory((prev) => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const saveFamilyHistory = () => {
    const final = [...editFamilyHistory];
    if (editFamilyHistory.includes('Other') && editFamilyHistoryOther.trim()) {
      const idx = final.indexOf('Other');
      final[idx] = `Other: ${editFamilyHistoryOther.trim()}`;
    }
    setBabyProfile({
      ...babyProfile,
      familyHistory: final,
      familyHistoryOther: editFamilyHistory.includes('Other') ? editFamilyHistoryOther.trim() : '',
    });
    setEditingFamilyHistory(false);
  };

  const vaccineSchedule = getVaccineSchedule(
    babyProfile.state || '',
    babyProfile.medicalConditions || []
  );

  return (
    <div className="medical-page">
      <h1 className="page-title">Medical Info</h1>

      <div className="tab-row">
        {['info', 'growth', 'vaccines'].map((t) => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'info' && 'Baby Info'}
            {t === 'growth' && 'Growth'}
            {t === 'vaccines' && 'Vaccines'}
          </button>
        ))}
      </div>

      {/* Baby Info Tab */}
      {activeTab === 'info' && (
        <>
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
                {editing ? <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /> : <span className="info-value">{babyProfile.firstName || '—'}</span>}
              </div>
              <div className="info-field">
                <label>Last Name</label>
                {editing ? <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /> : <span className="info-value">{babyProfile.lastName || '—'}</span>}
              </div>
              <div className="info-field">
                <label>Date of Birth</label>
                {editing ? <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /> : <span className="info-value">{babyProfile.dateOfBirth ? new Date(babyProfile.dateOfBirth).toLocaleDateString() : '—'}</span>}
              </div>
              <div className="info-field">
                <label>Sex</label>
                {editing ? (
                  <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : <span className="info-value">{babyProfile.sex || '—'}</span>}
              </div>
              <div className="info-field">
                <label>State</label>
                {editing ? <input type="text" value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} /> : <span className="info-value">{babyProfile.state || '—'}</span>}
              </div>
            </div>
          </section>

          {/* Medical Conditions */}
          <section className="card">
            <div className="card-header">
              <h2><Shield size={18} /> Medical Conditions</h2>
              <button className="icon-btn" onClick={() => {
                if (editingConditions) { saveConditions(); } else {
                  setEditConditions(babyProfile.medicalConditions?.map(c => c.startsWith('Other:') ? 'Other' : c) || []);
                  setEditOtherCondition(babyProfile.medicalConditions?.find(c => c.startsWith('Other:'))?.replace('Other: ', '') || '');
                  setEditingConditions(true);
                }
              }}>
                {editingConditions ? <Save size={18} /> : <Edit3 size={18} />}
              </button>
            </div>
            {editingConditions ? (
              <div>
                <div className="condition-grid">
                  {ALL_MEDICAL_CONDITIONS.map((c) => (
                    <button key={c} className={`condition-chip ${editConditions.includes(c) ? 'selected' : ''}`} onClick={() => toggleEditCondition(c)}>{c}</button>
                  ))}
                </div>
                {editConditions.includes('Other') && (
                  <div className="other-condition-input" style={{ marginTop: 8 }}>
                    <input type="text" placeholder="Please specify..." value={editOtherCondition} onChange={(e) => setEditOtherCondition(e.target.value)} />
                  </div>
                )}
              </div>
            ) : (
              <span className="info-value">
                {babyProfile.hasMedicalConditions && babyProfile.medicalConditions?.length > 0
                  ? babyProfile.medicalConditions.join(', ')
                  : 'None'}
              </span>
            )}
          </section>

          {/* Family History */}
          <section className="card">
            <div className="card-header">
              <h2><Heart size={18} /> Family History</h2>
              <button className="icon-btn" onClick={() => {
                if (editingFamilyHistory) { saveFamilyHistory(); } else {
                  setEditFamilyHistory(babyProfile.familyHistory?.map(c => c.startsWith('Other:') ? 'Other' : c) || []);
                  setEditFamilyHistoryOther(babyProfile.familyHistoryOther || '');
                  setEditingFamilyHistory(true);
                }
              }}>
                {editingFamilyHistory ? <Save size={18} /> : <Edit3 size={18} />}
              </button>
            </div>
            {editingFamilyHistory ? (
              <div>
                <div className="condition-grid">
                  {FAMILY_HISTORY_OPTIONS.map((c) => (
                    <button key={c} className={`condition-chip ${editFamilyHistory.includes(c) ? 'selected' : ''}`} onClick={() => toggleEditFH(c)}>{c}</button>
                  ))}
                </div>
                {editFamilyHistory.includes('Other') && (
                  <div className="other-condition-input" style={{ marginTop: 8 }}>
                    <input type="text" placeholder="Please specify..." value={editFamilyHistoryOther} onChange={(e) => setEditFamilyHistoryOther(e.target.value)} />
                  </div>
                )}
              </div>
            ) : (
              <span className="info-value">
                {babyProfile.familyHistory?.length > 0
                  ? babyProfile.familyHistory.join(', ')
                  : 'None reported'}
              </span>
            )}
          </section>
        </>
      )}

      {/* Growth Tab */}
      {activeTab === 'growth' && (
        <section className="card">
          <div className="card-header">
            <h2><Ruler size={18} /> Growth Tracker</h2>
            <button className="icon-btn" onClick={() => setShowGrowth(true)}><Plus size={18} /></button>
          </div>
          {growthEntries.length === 0 ? (
            <p className="empty-state">No growth entries yet. Tap + to add one.</p>
          ) : (
            <div className="growth-list">
              {growthEntries.map((e) => (
                <div key={e.id} className="growth-item">
                  <Calendar size={14} />
                  <span className="growth-date">{new Date(e.date).toLocaleDateString()}</span>
                  {e.weight && <span className="growth-badge"><Weight size={12} /> {e.weight}</span>}
                  {e.height && <span className="growth-badge"><Ruler size={12} /> {e.height}</span>}
                  {e.headCircumference && <span className="growth-badge">Head: {e.headCircumference}</span>}
                </div>
              ))}
            </div>
          )}
          {showGrowth && (
            <div className="modal-overlay" onClick={() => setShowGrowth(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header"><h2>Add Growth Entry</h2><button className="modal-close" onClick={() => setShowGrowth(false)}><X size={20} /></button></div>
                <div className="modal-body">
                  <label>Weight (lbs or kg)</label>
                  <input type="text" placeholder="e.g. 8.5 lbs" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  <label>Height / Length (in or cm)</label>
                  <input type="text" placeholder="e.g. 21 in" value={height} onChange={(e) => setHeight(e.target.value)} />
                  <label>Head Circumference (optional)</label>
                  <input type="text" placeholder="e.g. 14 in" value={headCirc} onChange={(e) => setHeadCirc(e.target.value)} />
                </div>
                <button className="btn-primary full-width" onClick={handleAddGrowth}><Plus size={18} /> Save</button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Vaccines Tab */}
      {activeTab === 'vaccines' && (
        <section className="card">
          <div className="card-header">
            <h2><Syringe size={18} /> Vaccine Schedule</h2>
          </div>
          {babyProfile.state && (
            <p className="card-desc">
              Schedule for <strong>{babyProfile.state}</strong>
              {babyProfile.medicalConditions?.length > 0 && (
                <> — adjusted for: <strong>{babyProfile.medicalConditions.join(', ')}</strong></>
              )}
            </p>
          )}
          <div className="vaccine-list">
            {vaccineSchedule.map((v) => (
              <div
                key={v.id}
                className={`vaccine-item ${vaccineStatus[v.id] ? 'done' : ''} ${v.contraindicated ? 'contraindicated' : ''}`}
                onClick={() => !v.contraindicated && toggleVaccine(v.id)}
              >
                <div className="vaccine-check">
                  {v.contraindicated ? (
                    <AlertTriangle size={20} />
                  ) : vaccineStatus[v.id] ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertTriangle size={20} />
                  )}
                </div>
                <div className="vaccine-details">
                  <span className="vaccine-age">{v.age}</span>
                  <span className="vaccine-name">{v.vaccine}</span>
                  <div className="vaccine-tags">
                    {v.stateRequired && <span className="vaccine-tag required">Required</span>}
                    {!v.stateRequired && !v.contraindicated && <span className="vaccine-tag recommended">Recommended</span>}
                    {v.contraindicated && <span className="vaccine-tag danger">Contraindicated</span>}
                  </div>
                  {v.notes && <p className="vaccine-note">{v.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
