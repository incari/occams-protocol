import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BottomNav } from './components/Navigation/BottomNav';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Calendar } from './components/Calendar/Calendar';
import { SessionForm } from './components/SessionForm/SessionForm';
import { MeasurementList } from './components/Measurements/MeasurementList';
import { MeasurementForm } from './components/Measurements/MeasurementForm';
import { Settings } from './components/Settings/Settings';
import { Onboarding } from './components/Onboarding/Onboarding';
import { History } from './components/History/History';
import { useSettings } from './hooks/useSettings';
import { isOnboardingCompleted } from './utils/storage';

function App() {
  const { settings, loading } = useSettings();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    // Apply theme immediately when settings are loaded
    if (!loading) {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings.theme, loading]);

  // Also apply theme on initial mount to prevent flash
  useEffect(() => {
    const savedSettings = localStorage.getItem('occam-protocol-data');
    if (savedSettings) {
      try {
        const data = JSON.parse(savedSettings);
        if (data.settings?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Check if onboarding is completed
  useEffect(() => {
    if (!loading) {
      setShowOnboarding(!isOnboardingCompleted());
    }
  }, [loading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show loading state while checking onboarding status
  if (loading || showOnboarding === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  // Show onboarding if not completed
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/log" element={<SessionForm />} />
          <Route path="/history" element={<History />} />
          <Route path="/measurements" element={<MeasurementList />} />
          <Route path="/measurements/new" element={<MeasurementForm />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
