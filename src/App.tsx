import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { authService } from './services/authService';
import { Journal } from './pages/Journal';
import { AddDream } from './pages/AddDream';
import { Learn } from './pages/Learn';
import { Profile } from './pages/Profile';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { useAuth } from './hooks/useAuth';
import { SoninhoMascot } from './components/ui/SoninhoMascot';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <SoninhoMascot size="lg" />
      <p className="mt-4 text-slate-400 animate-pulse font-medium">Carregando sonhos...</p>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { hasCompletedOnboarding } = useApp();
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  // 1. Check Auth First
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 2. Then Check Onboarding
  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// Helper for routes that need Auth but NOT Onboarding check (prevent loops)
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  // Sync Onboarding Logic
  const { user, loading } = useAuth(); // Destructure loading here too
  const { hasCompletedOnboarding, completeOnboarding } = useApp();
  const [minLoadFinished, setMinLoadFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadFinished(true), 2500); // 2.5s minimum splash
    return () => clearTimeout(timer);
  }, []);

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

  const showSplash = loading || !minLoadFinished;

  if (showSplash) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/auth" element={<Login />} />

      {/* Onboarding needs Auth but shouldn't check onboarding status itself */}
      <Route path="/onboarding" element={
        <RequireAuth>
          <Onboarding />
        </RequireAuth>
      } />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
      <Route path="/add" element={<ProtectedRoute><AddDream /></ProtectedRoute>} />
      <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

import { SoundProvider } from './context/SoundContext';
import { GlobalBinauralPlayer } from './components/ui/GlobalBinauralPlayer';

// ...

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <SoundProvider>
          <BrowserRouter>
            <GlobalBinauralPlayer />
            <AppRoutes />
          </BrowserRouter>
        </SoundProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
