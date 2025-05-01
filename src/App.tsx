import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import VerifyEmailPage from './pages/VerifyEmailPage'
import ResendVerificationPage from './pages/ResendVerificationPage'
import { NotificationProvider } from './contexts/NotificationContext';
import ProfilePage from './pages/profile/ProfilePage'
import TestResults from './pages/profile/TestResults';
import Settings from './pages/profile/Settings';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/resend-verification" element={<ResendVerificationPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="/profile" element={<ProfilePage />}>
          <Route path="results" element={<TestResults />} />
          <Route path="settings" element={<Settings />} />
          <Route index element={<Navigate to="results" replace />} />
        </Route>
        <Route element={<PrivateRoute />}>
        <Route path="/profile" element={<ProfilePage />}>
          <Route path="results" element={<TestResults />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      </Routes>
    </NotificationProvider>
  );
}