import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './TestHistory.css';

export default function TestHistory({ attempts }) {
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (!attempts || attempts.length === 0) {
    return (
      <div className="test-history-empty">
        <p>У вас пока нет истории тестирования</p>
      </div>
      );
  }

  // Вычисляем общее количество страниц
  const totalPages = Math.ceil(attempts.length / itemsPerPage);

  // Получаем элементы для текущей страницы
  const currentAttempts = attempts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatTestType = (type) => {
    switch(type) {
      case 'exam': return 'Экзамен ПДД';
      case 'topic': return 'Тематический тест';
      case 'hard': return 'Сложный режим';
      default: return type;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} мин ${secs.toString().padStart(2, '0')} сек`;
  };

  return (
    <div className="test-history">
      <h3>История тестирования</h3>
      
      <div className="attempts-list">
        {currentAttempts.map(attempt => (
          <div key={attempt.id} className="attempt-item">
            <div className="attempt-header">
              <span className="attempt-type">
                {formatTestType(attempt.testType)}
              </span>
              <span className="attempt-date">
                {attempt.completedAt ? 
                  format(new Date(attempt.completedAt), 'dd.MM.yyyy HH:mm', { locale: ru }) : 
                  'Дата неизвестна'}
              </span>
              <span className={`attempt-status ${attempt.status}`}>
                {attempt.status === 'passed' ? '✓ Сдано' : '✗ Не сдано'}
              </span>
            </div>
            
            <div className="progress-container">
              <div className="progress-info">
                <span>
                  {attempt.correctAnswers || 0} из {attempt.totalQuestions || 0} (
                  {Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100)}%)
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="correct-progress" 
                  style={{
                    width: `${Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100)}%`
                  }}
                />
              </div>
            </div>
            
            <div className="attempt-footer">
              <span>Время: {formatTime(attempt.timeSpentSeconds)}</span>
              {attempt.additionalQuestionsAnswered > 0 && (
                <span className="additional-questions">
                  Доп. вопросы: {attempt.additionalQuestionsAnswered}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'active' : ''}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
}