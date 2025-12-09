import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Journal } from './pages/Journal';
import { AddDream } from './pages/AddDream';
import { Learn } from './pages/Learn';
import { Profile } from './pages/Profile';
import { Onboarding } from './pages/Onboarding';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { hasCompletedOnboarding } = useApp();
  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />

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
