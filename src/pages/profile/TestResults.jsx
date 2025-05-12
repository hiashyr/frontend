import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import TestCharts from '../../components/profile/TestCharts';
import TestHistory from '../../components/profile/TestHistory';
import EmptyState from '../../components/profile/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import './profile-page.css';

export default function TestResults() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/exam/stats');
        
        // Проверяем, есть ли данные о тестах
        if (response.data?.overall?.totalTests === 0) {
          setStats(null); // Нет данных о тестах
        } else {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
        setError('Не удалось загрузить статистику');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="test-results-loading">
        <LoadingSpinner />
        <p>Загрузка вашей статистики...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-results-error">
        <p>{error}</p>
      </div>
    );
  }

  // Если данных нет (пользователь не проходил тесты)
  if (!stats) {
    return <EmptyState />;
  }

  return (
    <div className="test-results-container">
      <h2>Ваша статистика</h2>
      <TestCharts stats={stats} />
      <TestHistory attempts={stats.recent} />
    </div>
  );
}