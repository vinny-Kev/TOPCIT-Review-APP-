import { useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import ChatAssistant from './components/ChatAssistant';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import DashboardPage, { Section } from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

const DashboardShell = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  return (
    <>
      <DashboardPage activeSection={activeSection} onChangeSection={setActiveSection} onOpenAdmin={() => navigate('/admin')} />
      <ChatAssistant />
    </>
  );
};

const App = () => {
  const { user } = useAuth();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/*" element={<DashboardShell />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
