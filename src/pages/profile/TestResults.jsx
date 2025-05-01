import { useAuth } from '../../contexts/AuthContext';
import '../profile-page.css'

export default function TestResults() {
  const { user } = useAuth();

  return (
    <div className="test-results">
      <h2>Результаты тестов</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Всего пройдено тестов</h3>
          <p>{user.testStats?.totalTests || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Средний результат</h3>
          <p>{user.testStats?.averageScore || 0}%</p>
        </div>
      </div>
      
      <div className="recent-tests">
        <h3>Последние попытки</h3>
        {/* Здесь будет список тестов */}
      </div>
    </div>
  );
}