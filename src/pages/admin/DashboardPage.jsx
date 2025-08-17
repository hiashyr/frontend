import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import AdminStatsCard from '../../components/admin/AdminStatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import './admin.css';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null); // null вместо начальных значений
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect non-admin users
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const { data } = await API.get('/users/admin-stats'); // Проверьте правильность эндпоинта!
        setStats(data);
      } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
        setError('Не удалось загрузить статистику');
        setStats({ usersCount: 0, questionsCount: 0, testsCompleted: 0 }); // Fallback данные
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
    <div className="dashboard-page">
      <h1>Административный дашборд</h1>

      {isLoading ? (
        <div className="loading">Загрузка данных...</div>
      ) : (
        <div className="stats-grid">
          <AdminStatsCard
            title="Пользователи"
            value={stats.usersCount}
            icon="👥"
          />
          <AdminStatsCard
            title="Вопросы"
            value={stats.questionsCount}
            icon="❓"
          />
          <AdminStatsCard
            title="Пройдено тестов"
            value={stats.testsCompleted}
            icon="✅"
          />
        </div>
      )}
    </div>
  );
}
