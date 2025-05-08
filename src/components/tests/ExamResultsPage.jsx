import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import Header from '../Header';
import Footer from '../Footer';
import './ExamResultsPage.css';

export default function ExamResultsPage() {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/exam/${attemptId}/results`);
      
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Некорректный формат ответа сервера');
      }

      const requiredFields = [
        'status', 
        'correctAnswers', 
        'incorrectAnswers', 
        'timeSpent',
        'results'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in response.data));
      if (missingFields.length > 0) {
        throw new Error(`Отсутствуют обязательные поля: ${missingFields.join(', ')}`);
      }

      if (!['passed', 'failed', 'in_progress'].includes(response.data.status)) {
        throw new Error('Некорректный статус экзамена');
      }

      if (!Array.isArray(response.data.results)) {
        throw new Error('Результаты должны быть массивом');
      }

      setResults(response.data);
    } catch (err) {
      console.error('Ошибка загрузки результатов:', err);
      const errorMessage = err.response?.data?.error || 
                         err.message || 
                         'Неизвестная ошибка при загрузке результатов';
      
      setError(errorMessage);
      showNotification({
        message: errorMessage,
        type: 'error'
      });

      navigate('/profile/results');
    } finally {
      setLoading(false);
    }
  }, [attemptId, navigate, showNotification]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { from: `/exam/${attemptId}/results` } 
      });
      return;
    }

    if (!attemptId || isNaN(Number(attemptId))) {
      setError('Некорректный ID попытки');
      setLoading(false);
      return;
    }

    fetchResults();
  }, [attemptId, user, navigate, fetchResults]);

  const handleRetry = () => {
    navigate('/tests/exam');
  };

  const handleProfile = () => {
    navigate('/profile/results');
  };

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <main className="main-content">
          <div className="exam-results-loading">
            <LoadingSpinner />
            <p>Загрузка результатов экзамена...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Header />
        <main className="main-content">
          <div className="exam-results-error">
            <div className="error-message">{error}</div>
            <div className="results-actions">
              <button onClick={handleRetry} className="retry-button">
                Попробовать снова
              </button>
              <button onClick={handleProfile} className="profile-button">
                В профиль
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="page-container">
        <Header />
        <main className="main-content">
          <div className="exam-results-error">
            <div>Не удалось загрузить результаты</div>
            <div className="results-actions">
              <button onClick={handleRetry} className="retry-button">
                Попробовать снова
              </button>
              <button onClick={handleProfile} className="profile-button">
                В профиль
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isPassed = results.status === 'passed';
  const totalQuestions = results.results.length;
  const correctPercentage = totalQuestions > 0
    ? Math.round((results.correctAnswers / totalQuestions) * 100)
    : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} мин ${secs.toString().padStart(2, '0')} сек`;
  };

  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <div className="exam-results-container">
          <div className={`exam-status ${isPassed ? 'passed' : 'failed'}`}>
            <h2>{isPassed ? 'Экзамен сдан!' : 'Экзамен не сдан'}</h2>
            <div className="status-icon" aria-hidden="true">
              {isPassed ? '✓' : '✗'}
            </div>
          </div>

          <div className="results-summary">
            <div className="summary-card">
              <h3>Общий результат</h3>
              <div 
                className="progress-circle" 
                style={{ '--percentage': correctPercentage }}
                aria-label={`Правильно ответили на ${correctPercentage}% вопросов`}
              >
                <span>{correctPercentage}%</span>
              </div>
              <div className="stats">
                <p>Правильных: <strong>{results.correctAnswers}</strong></p>
                <p>Неправильных: <strong>{results.incorrectAnswers}</strong></p>
                <p>Время: <strong>{formatTime(results.timeSpent)}</strong></p>
              </div>
            </div>
          </div>

          <div className="detailed-results">
            <h3>Детализация ответов</h3>
            {results.results.length === 0 ? (
              <div className="no-results">Нет данных о результатах</div>
            ) : (
              <div className="questions-list">
                {results.results.map((result, index) => (
                  <div 
                    key={`${result.questionId}-${index}`}
                    className={`question-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    <div className="question-header">
                      <span>Вопрос {index + 1}</span>
                      <span>{result.isCorrect ? '✓ Верно' : '✗ Ошибка'}</span>
                    </div>
                    <p className="question-text">{result.questionText}</p>
                    <div className="user-answer">
                      <span className="answer-label">Ваш ответ:</span>
                      <span className="answer-text">{result.userAnswerText}</span>
                    </div>
                    {!result.isCorrect && (
                      <div className="correct-answer">
                        <span className="answer-label">Правильный ответ:</span>
                        <span className="answer-text">{result.correctAnswerText}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="results-actions">
            <button 
              onClick={handleRetry}
              className="retry-button"
              aria-label="Попробовать экзамен снова"
            >
              Попробовать снова
            </button>
            <button 
              onClick={handleProfile}
              className="profile-button"
              aria-label="Перейти в профиль"
            >
              В профиль
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}