import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  UserPlus,
  Share2,
  Bell,
  Copy,
  Check,
  X,
  Baby,
  Heart,
  Star,
  ShieldCheck,
} from 'lucide-react';

function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
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
  const [inviteCode] = useState(generateInviteCode);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Co-parent');
  const [sentReminder, setSentReminder] = useState(null);

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    addFamilyMember({ name: newName.trim(), role: newRole, initials: newName.trim().slice(0, 2).toUpperCase() });
    setNewName('');
    setShowAdd(false);
  };

  const handleReminder = (label) => {
    setSentReminder(label);
    setTimeout(() => setSentReminder(null), 2000);
  };

  return (
    <div className="family-page">
      <h1 className="page-title">Family</h1>

      {/* Members */}
      <section className="card">
        <div className="card-header">
          <h2><Users size={18} /> Members</h2>
          <button className="icon-btn" onClick={() => setShowAdd(true)}>
            <UserPlus size={18} />
          </button>
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

        {showAdd && (
          <div className="add-member-form">
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option>Co-parent</option>
              <option>Grandparent</option>
              <option>Caregiver</option>
              <option>Other</option>
            </select>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAdd}>Add</button>
            </div>
          </div>
        )}
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
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button className="btn-primary" disabled={joinCode.length < 6}>
            Join
          </button>
        </div>
      </section>
    </div>
  );
}
