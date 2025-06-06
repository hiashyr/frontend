import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import Header from '../Header';
import Footer from '../Footer';
import './TopicResultsPage.css';

export default function TopicResultsPage() {
  const { topicId, attemptId } = useParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем результаты попытки
      const attemptResponse = await api.get(`/topics/${topicId}/attempt/${attemptId}/results`);
      
      // Получаем информацию о теме
      const topicResponse = await api.get(`/topics/${topicId}`);
      
      if (!attemptResponse.data || !topicResponse.data) {
        throw new Error('Некорректный формат ответа сервера');
      }

      if (!topicResponse.data.data?.name) {
        throw new Error('Не удалось получить название темы');
      }

      const requiredFields = [
        'status', 
        'correctAnswers', 
        'incorrectAnswers', 
        'timeSpent',
        'results'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in attemptResponse.data.data));
      if (missingFields.length > 0) {
        throw new Error(`Отсутствуют обязательные поля: ${missingFields.join(', ')}`);
      }

      if (!['passed', 'failed', 'in_progress'].includes(attemptResponse.data.data.status)) {
        throw new Error('Некорректный статус тестирования');
      }

      if (!Array.isArray(attemptResponse.data.data.results)) {
        throw new Error('Ответы пользователя должны быть массивом');
      }

      setResults(attemptResponse.data.data);
      setTopic(topicResponse.data.data);
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

      navigate(`/tests/topics/${topicId}`);
    } finally {
      setLoading(false);
    }
  }, [topicId, attemptId, navigate, showNotification]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { from: `/tests/topics/${topicId}/attempt/${attemptId}/results` } 
      });
      return;
    }

    if (!attemptId || isNaN(Number(attemptId)) || !topicId || isNaN(Number(topicId))) {
      setError('Некорректный ID попытки или темы');
      setLoading(false);
      return;
    }

    fetchResults();
  }, [attemptId, topicId, user, navigate, fetchResults]);

  const handleRetry = async () => {
    try {
      // Создаем новую попытку тестирования
      const startResponse = await api.post(`/topics/${topicId}/start`);
      
      if (!startResponse.data?.success || !startResponse.data?.data?.attemptId) {
        throw new Error('Не удалось создать новую попытку тестирования');
      }

      const newAttemptId = startResponse.data.data.attemptId;
      
      // Переходим к новому тесту
      navigate(`/tests/topics/${topicId}/attempt/${newAttemptId}`);
    } catch (err) {
      console.error('Ошибка при создании новой попытки:', err);
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          'Не удалось начать новое тестирование';
      
      setError(errorMessage);
      showNotification({
        message: errorMessage,
        type: 'error'
      });
    }
  };

  const handleBackToTopics = () => {
    navigate('/tests/topics');
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
              <button onClick={handleBackToTopics} className="topics-button">
                К списку тем
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!results || !topic) {
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
              <button onClick={handleBackToTopics} className="topics-button">
                К списку тем
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
          <div className="topic-header">
            <h2>Тема: {topic?.name || 'Загрузка...'}</h2>
          </div>

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
            <button onClick={handleBackToTopics} className="profile-button">
              К списку тем
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}