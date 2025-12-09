import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Journal } from './pages/Journal';
import { AddDream } from './pages/AddDream';
import { Learn } from './pages/Learn';
import { Profile } from './pages/Profile';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Journal />} />
          <Route path="/journal" element={<Navigate to="/" replace />} />
          <Route path="/add" element={<AddDream />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
