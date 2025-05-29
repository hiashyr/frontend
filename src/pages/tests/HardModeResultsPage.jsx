import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../components/tests/TopicResultsPage.css'; // Используем те же стили, что и для обычных результатов

export default function HardModeResultsPage() {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/tests/hard-mode/attempt/${attemptId}/results`);
        
        if (!response.data?.success || !response.data?.data) {
          throw new Error('Некорректный формат ответа сервера');
        }

        setResults(response.data.data);
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Ошибка загрузки результатов';
        setError(errorMessage);
        showNotification({
          message: errorMessage,
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchResults();
    }
  }, [attemptId, user, showNotification]);

  const handleRetry = async () => {
    try {
      const response = await api.post('/tests/hard-mode/start');
      
      if (!response.data?.success || !response.data?.data?.attemptId) {
        throw new Error('Не удалось начать новое тестирование');
      }

      navigate(`/tests/hard-mode/attempt/${response.data.data.attemptId}`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Ошибка начала тестирования';
      showNotification({
        message: errorMessage,
        type: 'error'
      });
    }
  };

  const handleBackToMain = () => {
    navigate('/tests/hard-mode');
  };

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <main className="main-content">
          <div className="topic-results-loading">
            <LoadingSpinner />
            <p>Загрузка результатов тестирования...</p>
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
          <div className="topic-results-error">
            <div className="error-message">{error}</div>
            <div className="results-actions">
              <button onClick={handleRetry} className="retry-button">
                Попробовать снова
              </button>
              <button onClick={handleBackToMain} className="topics-button">
                К режиму сложных вопросов
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
          <div className="topic-results-error">
            <div>Не удалось загрузить результаты</div>
            <div className="results-actions">
              <button onClick={handleRetry} className="retry-button">
                Попробовать снова
              </button>
              <button onClick={handleBackToMain} className="topics-button">
                К режиму сложных вопросов
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isPassed = results.status === 'passed';
  const totalQuestions = results.correctAnswers + results.incorrectAnswers;
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
        <div className="topic-results-container">
          <div className={`exam-status ${isPassed ? 'passed' : 'failed'}`}>
            <h2>{isPassed ? 'Тест успешно пройден!' : 'Тест не пройден'}</h2>
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

          {results.results && results.results.length > 0 && (
            <div className="detailed-results">
              <h3>Детализация ответов</h3>
              <div className="questions-list">
                {results.results.map((result, index) => (
                  <div 
                    key={index}
                    className={`question-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    <div className="question-header">
                      <span>Вопрос {index + 1}</span>
                      <span className="result-indicator">
                        {result.isCorrect ? '✓ Правильно' : '✗ Неправильно'}
                      </span>
                    </div>
                    <p className="question-text">{result.questionText}</p>
                    <div className="answer-section">
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
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="results-actions">
            <button onClick={handleRetry} className="retry-button">
              Попробовать снова
            </button>
            <button onClick={handleBackToMain} className="profile-button">
              К режиму сложных вопросов
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 