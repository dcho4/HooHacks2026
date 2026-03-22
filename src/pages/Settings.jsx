import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  User, Bell, Palette, HelpCircle, Info, LogOut,
  ChevronRight, Moon, Search, Check, X, Eye, EyeOff,
  Mail, Lock, Save,
} from 'lucide-react';

const THEMES = [
  { id: 'lavender', label: 'Lavender', color: '#b8a9d4' },
  { id: 'rose', label: 'Rose', color: '#e8a0bf' },
  { id: 'ocean', label: 'Ocean', color: '#a0c4e8' },
  { id: 'mint', label: 'Mint', color: '#a0d4a0' },
];

export default function SettingsPage() {
  const { parentName, resetApp, darkMode, setDarkMode, theme, setTheme, account, setAccount, logout } = useApp();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Profile edit state
  const [editUsername, setEditUsername] = useState(account.username);
  const [editEmail, setEditEmail] = useState(account.email);
  const [editPassword, setEditPassword] = useState(account.password);
  const [showPassword, setShowPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = () => {
    resetApp();
    navigate('/');
  };

  const handleSaveProfile = () => {
    setAccount({
      email: editEmail.trim(),
      username: editUsername.trim(),
      password: editPassword,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const selectedTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  const sections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          detail: account.username || parentName || 'Set up profile',
          action: () => {
            setEditUsername(account.username);
            setEditEmail(account.email);
            setEditPassword(account.password);
            setShowProfile(true);
          },
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', toggle: true, value: notifications, action: () => setNotifications(!notifications) },
        { icon: Moon, label: 'Dark Mode', toggle: true, value: darkMode, action: () => setDarkMode(!darkMode) },
        { icon: Palette, label: 'App Theme', detail: selectedTheme.label, action: () => setShowThemePicker(true) },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Contact Us', action: () => {} },
        { icon: Info, label: 'About BabyBoo', detail: 'v1.0.0', action: () => {} },
      ],
    },
  ];

  const filteredSections = searchQuery
    ? sections.map((s) => ({ ...s, items: s.items.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter((s) => s.items.length > 0)
    : sections;

  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>

      <div className="settings-search">
        <Search size={16} />
        <input type="text" placeholder="Search settings..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {filteredSections.map((section) => (
        <section key={section.title} className="settings-section">
          <h2 className="settings-section-title">{section.title}</h2>
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="settings-row" onClick={item.action}>
                <Icon size={20} className="settings-icon" />
                <span className="settings-label">{item.label}</span>
                {item.toggle ? (
                  <div className={`toggle ${item.value ? 'on' : ''}`}><div className="toggle-knob" /></div>
                ) : (
                  <span className="settings-detail">{item.detail}<ChevronRight size={16} /></span>
                )}
              </button>
            );
          })}
        </section>
      ))}

      <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
        <LogOut size={18} /> Log Out
      </button>

      {/* Logout Confirm */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Log Out?</h2>
            <p>You can log back in with your email and password.</p>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleLogout} style={{ flex: 'none' }}>Log Out</button>
            </div>
            <button className="btn-danger full-width" onClick={handleDeleteAccount} style={{ marginTop: 12 }}>
              Delete Account & All Data
            </button>
          </div>
        </div>
      )}

      {/* Theme Picker */}
      {showThemePicker && (
        <div className="modal-overlay" onClick={() => setShowThemePicker(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Choose Theme</h2>
              <button className="modal-close" onClick={() => setShowThemePicker(false)}><X size={20} /></button>
            </div>
            <div className="theme-grid">
              {THEMES.map((t) => (
                <button key={t.id} className={`theme-option ${theme === t.id ? 'selected' : ''}`} onClick={() => { setTheme(t.id); setShowThemePicker(false); }}>
                  <div className="theme-swatch" style={{ background: t.color }}>{theme === t.id && <Check size={20} color="white" />}</div>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Your Profile</h2>
              <button className="modal-close" onClick={() => setShowProfile(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <label>Username</label>
              <div className="input-with-icon">
                <User size={18} />
                <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
              </div>

              <label>Email</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>

              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input type={showPassword ? 'text' : 'password'} value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
                <button className="icon-btn small" onClick={() => setShowPassword(!showPassword)} type="button" style={{ marginLeft: 4 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {profileSaved && <p className="save-success">Profile saved!</p>}
            </div>
            <button className="btn-primary full-width" onClick={handleSaveProfile}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
