import { useLocation, useNavigate } from 'react-router-dom';
import { Users, MessageCircle, Home, ClipboardPlus, Settings } from 'lucide-react';

const tabs = [
  { path: '/family', icon: Users, label: 'Family' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/home', icon: Home, label: 'Home', isCenter: true },
  { path: '/medical', icon: ClipboardPlus, label: 'Medical' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            className={`nav-tab ${isActive ? 'active' : ''} ${tab.isCenter ? 'center-tab' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <div className={tab.isCenter ? 'center-icon-wrap' : ''}>
              <Icon size={tab.isCenter ? 28 : 22} />
            </div>
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
