import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  User,
  Bell,
  Palette,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Moon,
  Search,
} from 'lucide-react';

export default function SettingsPage() {
  const { parentName, babyProfile, resetApp } = useApp();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    resetApp();
    navigate('/');
  };

  const sections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          detail: parentName || 'Set up profile',
          action: () => {},
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          toggle: true,
          value: notifications,
          action: () => setNotifications(!notifications),
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          toggle: true,
          value: darkMode,
          action: () => setDarkMode(!darkMode),
        },
        {
          icon: Palette,
          label: 'App Theme',
          detail: 'Lavender',
          action: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Contact Us',
          action: () => {},
        },
        {
          icon: Info,
          label: 'About BabyBoo',
          detail: 'v1.0.0',
          action: () => {},
        },
      ],
    },
  ];

  const filteredSections = searchQuery
    ? sections
        .map((s) => ({
          ...s,
          items: s.items.filter((item) =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((s) => s.items.length > 0)
    : sections;

  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>

      {/* Search */}
      <div className="settings-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search settings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredSections.map((section) => (
        <section key={section.title} className="settings-section">
          <h2 className="settings-section-title">{section.title}</h2>
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="settings-row"
                onClick={item.action}
              >
                <Icon size={20} className="settings-icon" />
                <span className="settings-label">{item.label}</span>
                {item.toggle ? (
                  <div className={`toggle ${item.value ? 'on' : ''}`}>
                    <div className="toggle-knob" />
                  </div>
                ) : (
                  <span className="settings-detail">
                    {item.detail}
                    <ChevronRight size={16} />
                  </span>
                )}
              </button>
            );
          })}
        </section>
      ))}

      {/* Logout */}
      <button
        className="logout-btn"
        onClick={() => setShowLogoutConfirm(true)}
      >
        <LogOut size={18} /> Log Out
      </button>

      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Log Out?</h2>
            <p>This will clear all local data. Are you sure?</p>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
