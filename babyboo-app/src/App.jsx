import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Chatbot from './pages/Chatbot';
import Family from './pages/Family';
import Medical from './pages/Medical';
import SettingsPage from './pages/Settings';

function AppRoutes() {
  const { babyProfile } = useApp();
  const onboarded = babyProfile.onboardingComplete;

  return (
    <Routes>
      <Route
        path="/"
        element={onboarded ? <Navigate to="/home" replace /> : <Onboarding />}
      />
      <Route element={onboarded ? <Layout /> : <Navigate to="/" replace />}>
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/family" element={<Family />} />
        <Route path="/medical" element={<Medical />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
