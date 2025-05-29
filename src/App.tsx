import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResendVerificationPage from './pages/ResendVerificationPage';
import { NotificationProvider } from './contexts/NotificationContext';
import ProfilePage from './pages/profile/ProfilePage';
import TestResults from './pages/profile/TestResults';
import Settings from './pages/profile/Settings';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ExamPage from './pages/tests/ExamPage';
import TopicResultsPage from './components/tests/TopicResultsPage';
import TopicsPage from './pages/tests/TopicsPage';
import TopicTestPage from './pages/tests/TopicTestPage';
import ExamResultsPage from './components/tests/ExamResultsPage';
import HardModePage from './pages/tests/HardModePage';
import HardModeTestPage from './pages/tests/HardModeTestPage';
import HardModeResultsPage from './pages/tests/HardModeResultsPage';

export default function App() {
  return (
      <AuthProvider>
        <NotificationProvider>
          <ErrorBoundary>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/resend-verification" element={<ResendVerificationPage />} />

              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/profile/*" element={<ProfilePage />} />

                {/* Экзамен и тесты */}
                <Route path="/tests/topics" element={<TopicsPage />} />
                <Route path="/tests/topics/:topicId" element={<TopicTestPage />} />
                <Route path="/tests/topics/:topicId/attempt/:attemptId" element={<TopicTestPage />} />
                <Route path="/tests/exam" element={<ExamPage />} />
                <Route path="/exam/:attemptId/results" element={<ExamResultsPage />} />
                <Route path="/tests/topics/:topicId/attempt/:attemptId/results" element={<TopicResultsPage />} />

                {/* Режим сложных вопросов */}
                <Route path="/tests/hard-mode" element={<HardModePage />} />
                <Route path="/tests/hard-mode/attempt/:attemptId" element={<HardModeTestPage />} />
                <Route path="/tests/hard-mode/results/:attemptId" element={<HardModeResultsPage />} />

                {/* Admin routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                </Route>
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </NotificationProvider>
      </AuthProvider>
  );
}