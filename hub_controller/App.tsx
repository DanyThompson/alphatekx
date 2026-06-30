import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import GoogleCallbackPage from './auth/GoogleCallbackPage';
import LandingPage from './pages/landing/LandingPage';
import OverviewPage from './pages/dashboard/OverviewPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<OverviewPage />} />
        <Route path="/dashboard/overview" element={<OverviewPage />} />
      </Route>

      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
