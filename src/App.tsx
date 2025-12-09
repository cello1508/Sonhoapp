import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { authService } from './services/authService';
import { Journal } from './pages/Journal';
import { AddDream } from './pages/AddDream';
import { Learn } from './pages/Learn';
import { Profile } from './pages/Profile';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { hasCompletedOnboarding } = useApp();
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or a splash screen

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  // Sync Onboarding Logic
  const { user } = useAuth();
  const { hasCompletedOnboarding, completeOnboarding } = useApp();

  useEffect(() => {
    if (user) {
      // 1. Sync from DB to Local (if new device)
      const checkDbStatus = async () => {
        const { data } = await authService.getProfile(user.id);
        const userProfile = data as any;
        const prefs = userProfile?.preferences;

        if (prefs?.onboarding_completed && !hasCompletedOnboarding) {
          console.log("Syncing onboarding from DB: TRUE");
          completeOnboarding(userProfile?.name || 'Sonhador');
        } else if (!prefs?.onboarding_completed && hasCompletedOnboarding) {
          // 2. Sync from Local to DB (if just finished onboarding)
          console.log("Syncing onboarding to DB: TRUE");
          await authService.updateOnboardingStatus(user.id, true);
        }
      };

      checkDbStatus();
    }
  }, [user, hasCompletedOnboarding]);

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/auth" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
      <Route path="/journal" element={<Navigate to="/" replace />} />
      <Route path="/add" element={<ProtectedRoute><AddDream /></ProtectedRoute>} />
      <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
