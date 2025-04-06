import { useEffect, useState } from 'react';
import API from '../../services/api';
import AdminStatsCard from '../../components/admin/AdminStatsCard';
import './admin.css'; // Создадим этот файл позже

export default function DashboardPage() {
  const [stats, setStats] = useState({
    usersCount: 0,
    questionsCount: 0,
    testsCompleted: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error('Ошибка загрузки статистики:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

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