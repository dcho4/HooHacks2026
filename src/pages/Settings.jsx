import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  User, Bell, Palette, HelpCircle, Info, LogOut,
  ChevronRight, Moon, Search, Check, X, Eye, EyeOff,
  Mail, Lock, Save, Code, Trash2, Key,
} from 'lucide-react';

const THEMES = [
  { id: 'lavender', label: 'Lavender', color: '#b8a9d4' },
  { id: 'rose', label: 'Rose', color: '#e8a0bf' },
  { id: 'ocean', label: 'Ocean', color: '#a0c4e8' },
  { id: 'mint', label: 'Mint', color: '#a0d4a0' },
];

const GEMINI_API_KEY = 'AIzaSyCDqsMZsQKDHFW6-R4Xphtv_SIlpWWVJEA';

export default function SettingsPage() {
  const {
    parentName, resetApp, darkMode, setDarkMode, theme, setTheme,
    account, setAccount, logout, developerMode, setDeveloperMode,
    hasAuth0, auth0User,
  } = useApp();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Profile edit state (local mode)
  const [editUsername, setEditUsername] = useState(account?.username || '');
  const [editEmail, setEditEmail] = useState(account?.email || '');
  const [editPassword, setEditPassword] = useState(account?.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleResetAll = async () => {
    await resetApp();
    setShowResetConfirm(false);
    if (!hasAuth0) navigate('/');
  };

  const handleSaveProfile = () => {
    if (setAccount) {
      setAccount({ email: editEmail.trim(), username: editUsername.trim(), password: editPassword });
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const selectedTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const displayEmail = hasAuth0 ? auth0User?.email : account?.email;
  const displayName = hasAuth0 ? auth0User?.name || auth0User?.nickname : account?.username;

  const sections = [
    {
      title: 'Account',
      items: [
        {
          icon: User, label: 'Profile',
          detail: displayName || parentName || 'View profile',
          action: () => {
            if (!hasAuth0) {
              setEditUsername(account?.username || '');
              setEditEmail(account?.email || '');
              setEditPassword(account?.password || '');
            }
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
        { icon: Code, label: 'Developer Mode', toggle: true, value: developerMode, action: () => setDeveloperMode(!developerMode) },
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
    ? sections.map((s) => ({ ...s, items: s.items.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase())) })).filter((s) => s.items.length > 0)
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

      {/* Developer Mode Section */}
      {developerMode && (
        <section className="settings-section">
          <h2 className="settings-section-title">Developer</h2>
          <div className="settings-row" style={{ cursor: 'default' }}>
            <Key size={20} className="settings-icon" />
            <span className="settings-label">Gemini API Key</span>
            <span className="settings-detail" style={{ fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {GEMINI_API_KEY}
            </span>
          </div>
          <button className="settings-row" onClick={() => setShowResetConfirm(true)} style={{ color: 'var(--red)' }}>
            <Trash2 size={20} style={{ color: 'var(--red)' }} />
            <span className="settings-label" style={{ color: 'var(--red)' }}>Reset All Stored Data</span>
            <ChevronRight size={16} />
          </button>
        </section>
      )}

      <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
        <LogOut size={18} /> Log Out
      </button>

      {/* Logout Confirm */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Log Out?</h2>
            <p>You can log back in anytime.</p>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleLogout} style={{ flex: 'none' }}>Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirm (Developer) */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Reset All Data?</h2>
            <p>This will permanently delete all stored data including baby profile, logs, journal entries, and photos. This cannot be undone.</p>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleResetAll}>Delete Everything</button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Picker */}
      {showThemePicker && (
        <div className="modal-overlay" onClick={() => setShowThemePicker(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Choose Theme</h2><button className="modal-close" onClick={() => setShowThemePicker(false)}><X size={20} /></button></div>
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
            <div className="modal-header"><h2>Your Profile</h2><button className="modal-close" onClick={() => setShowProfile(false)}><X size={20} /></button></div>
            <div className="modal-body">
              {hasAuth0 ? (
                <>
                  <label>Email</label>
                  <div className="profile-display"><Mail size={18} /><span>{auth0User?.email || 'N/A'}</span></div>
                  <label>Name</label>
                  <div className="profile-display"><User size={18} /><span>{auth0User?.name || auth0User?.nickname || 'N/A'}</span></div>
                  {auth0User?.email_verified !== undefined && (
                    <>
                      <label>Email Verified</label>
                      <div className="profile-display">
                        {auth0User.email_verified ? <Check size={18} color="var(--green-dark)" /> : <X size={18} color="var(--red)" />}
                        <span>{auth0User.email_verified ? 'Yes' : 'No — check your inbox'}</span>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
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
                  <button className="btn-primary full-width" onClick={handleSaveProfile} style={{ marginTop: 8 }}>
                    <Save size={18} /> Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
