import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import TestStatsCharts from '../../components/admin/TestStatsCharts';
import './admin.css';
import { useAuth } from '../../contexts/AuthContext';
import { FaTimes } from 'react-icons/fa';
import AdminSidebar from '../../components/admin/AdminSidebar';
import SmallInfoBlocks from '../../components/admin/SmallInfoBlocks';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
        setError('Не удалось загрузить статистику');
        setStats({
          totalUsers: 0,
          usersRegisteredLastMonth: 0,
          totalQuestionsCount: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button onClick={() => window.location.reload()}>Повторить</button>
      </div>
    );
  }

  if (!stats) return <LoadingSpinner fullPage />;

  return (
    <div className="admin-layout">
      <div className="admin-content">
        <div className="dashboard-page">
          <button
            className="profile-close-btn"
            onClick={() => navigate('/')}
            aria-label="Закрыть страницу настроек"
          >
            <FaTimes aria-hidden="true" />
          </button>
          <h1>Общий дашборд</h1>

          {isLoading ? (
            <div className="loading">Загрузка данных...</div>
          ) : (
            <>
              <div className="test-stats-section">
                <TestStatsCharts stats={stats} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
