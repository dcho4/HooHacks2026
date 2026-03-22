import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Share2,
  Bell,
  Copy,
  Check,
  X,
  Baby,
  Star,
  ShieldCheck,
  Heart,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

function generateAndSaveCode() {
  const saved = localStorage.getItem('familyInviteCode');
  if (saved) return saved;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  localStorage.setItem('familyInviteCode', code);
  return code;
}

const REMINDER_TYPES = [
  { icon: Baby, label: 'Feed time', color: 'pink' },
  { icon: Users, label: 'Diaper check', color: 'blue' },
  { icon: Star, label: 'Tummy time', color: 'amber' },
  { icon: ShieldCheck, label: 'Medicine', color: 'green' },
];

export default function Family() {
  const { familyMembers, addFamilyMember, removeFamilyMember, parentName } = useApp();
  const [inviteCode] = useState(generateAndSaveCode);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [sentReminder, setSentReminder] = useState(null);
  const [joinStatus, setJoinStatus] = useState(null); // 'success' | 'error' | null

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReminder = (label) => {
    setSentReminder(label);
    setTimeout(() => setSentReminder(null), 2000);
  };

  const handleJoin = () => {
    if (joinCode.length < 6) return;

    // Check if this code matches any known family code in localStorage
    // In a real app this would be a backend lookup
    const knownCodes = JSON.parse(localStorage.getItem('knownFamilyCodes') || '[]');

    // Add the code to joined families
    const joined = JSON.parse(localStorage.getItem('joinedFamilies') || '[]');
    if (joined.includes(joinCode)) {
      setJoinStatus('already');
      setTimeout(() => setJoinStatus(null), 3000);
      return;
    }

    // Save the joined family
    joined.push(joinCode);
    localStorage.setItem('joinedFamilies', JSON.stringify(joined));

    // Add a family member entry to represent the connection
    addFamilyMember({
      name: `Family ${joinCode}`,
      role: 'Linked Family',
      initials: joinCode.slice(0, 2),
    });

    setJoinStatus('success');
    setJoinCode('');
    setTimeout(() => setJoinStatus(null), 3000);
  };

  return (
    <div className="family-page">
      <h1 className="page-title">Family</h1>

      {/* Members */}
      <section className="card">
        <div className="card-header">
          <h2><Users size={18} /> Members</h2>
        </div>

        <div className="member-list">
          <div className="member-item">
            <div className="avatar primary">{(parentName || 'ME').slice(0, 2).toUpperCase()}</div>
            <div>
              <span className="member-name">{parentName || 'You'}</span>
              <span className="member-role">Primary</span>
            </div>
          </div>
          {familyMembers.map((m) => (
            <div key={m.id} className="member-item">
              <div className="avatar">{m.initials}</div>
              <div>
                <span className="member-name">{m.name}</span>
                <span className="member-role">{m.role}</span>
              </div>
              <button className="icon-btn small" onClick={() => removeFamilyMember(m.id)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Send Reminders */}
      <section className="card">
        <h2><Bell size={18} /> Send Reminders</h2>
        <div className="reminder-grid">
          {REMINDER_TYPES.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.label}
                className={`reminder-btn ${r.color}`}
                onClick={() => handleReminder(r.label)}
              >
                <Icon size={22} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
        {sentReminder && (
          <p className="reminder-sent"><Check size={14} /> "{sentReminder}" reminder sent!</p>
        )}
      </section>

      {/* Invite */}
      <section className="card">
        <h2><Share2 size={18} /> Invite Caregiver</h2>
        <p className="card-desc">Share this code so others can join your family circle.</p>
        <div className="invite-code-box" onClick={handleCopy}>
          <span className="invite-code">{inviteCode}</span>
          <button className="icon-btn">
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </section>

      {/* Join Family */}
      <section className="card">
        <h2><Heart size={18} /> Join a Family</h2>
        <p className="card-desc">Enter a family code to join an existing circle.</p>
        <div className="join-row">
          <input
            type="text"
            placeholder="Enter code"
            value={joinCode}
            onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinStatus(null); }}
            maxLength={6}
          />
          <button className="btn-primary" disabled={joinCode.length < 6} onClick={handleJoin}>
            Join
          </button>
        </div>
        {joinStatus === 'success' && (
          <p className="reminder-sent"><CheckCircle size={14} /> Successfully joined the family!</p>
        )}
        {joinStatus === 'already' && (
          <p style={{ fontSize: 13, color: 'var(--amber-dark)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle size={14} /> You've already joined this family.
          </p>
        )}
      </section>
    </div>
  );
}
