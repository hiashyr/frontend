import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import './ExamResultsPage.css';

export default function ExamResultsPage() {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/exam/${attemptId}/results`);
        setResults(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && attemptId) {
      fetchResults();
    } else {
      navigate('/login');
    }
  }, [attemptId, user, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;
  if (!results) return <div>Не удалось загрузить результаты</div>;

  const isPassed = results.status === 'passed';
  const correctPercentage = Math.round((results.correctAnswers / results.results.length) * 100);

  return (
    <div className="exam-results-container">
      <div className={`exam-status ${isPassed ? 'passed' : 'failed'}`}>
        <h2>{isPassed ? 'Экзамен сдан!' : 'Экзамен не сдан'}</h2>
        <div className="status-icon">
          {isPassed ? '✓' : '✗'}
        </div>
      </div>

      <div className="results-summary">
        <div className="summary-card">
          <h3>Общий результат</h3>
          <div className="progress-circle" style={{ '--percentage': correctPercentage }}>
            <span>{correctPercentage}%</span>
          </div>
          <div className="stats">
            <p>Правильных: <strong>{results.correctAnswers}</strong></p>
            <p>Неправильных: <strong>{results.incorrectAnswers}</strong></p>
            <p>Время: <strong>{Math.floor(results.timeSpent / 60)} мин {results.timeSpent % 60} сек</strong></p>
          </div>
        </div>
      </div>

      <div className="detailed-results">
        <h3>Детализация ответов</h3>
        <div className="questions-list">
          {results.results.map((result, index) => (
            <div key={index} className={`question-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="question-header">
                <span>Вопрос {index + 1}</span>
                <span>{result.isCorrect ? '✓ Верно' : '✗ Ошибка'}</span>
              </div>
              <p className="question-text">{result.questionText}</p>
              <div className="user-answer">
                Ваш ответ: {result.userAnswerText}
              </div>
              {!result.isCorrect && (
                <div className="correct-answer">
                  Правильный ответ: {result.correctAnswerText}
                </div>
              )}
              {result.timeSpent && (
                <div className="time-spent">
                  Время: {result.timeSpent} сек
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="results-actions">
        <button 
          onClick={() => navigate('/tests/exam')}
          className="retry-button"
        >
          Попробовать снова
        </button>
        <button 
          onClick={() => navigate('/profile/results')}
          className="profile-button"
        >
          В профиль
        </button>
      </div>
    </div>
  );
}