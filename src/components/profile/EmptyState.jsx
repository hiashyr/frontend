import { Link } from 'react-router-dom';
import './EmptyState.css';

export default function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc">
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0"></path>
          <path d="M9 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"></path>
        </svg>
      </div>
      <h3>У вас пока нет статистики</h3>
      <p>Пройдите тестирование, чтобы увидеть свои результаты и прогресс</p>
      <Link to="/tests/exam" className="start-test-button">
        Начать экзамен
      </Link>
    </div>
  );
}