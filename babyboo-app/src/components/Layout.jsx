import { Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BottomNav from './BottomNav';

export default function Layout() {
  const { darkMode, theme } = useApp();

  return (
    <div className={`app-shell ${darkMode ? 'dark' : ''} theme-${theme}`}>
      <div className="page-content">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
