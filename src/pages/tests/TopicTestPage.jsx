import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './TopicTestPage.css';

export default function TopicTestPage() {
  const { topicId, attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const loadTest = async () => {
      try {
        if (!topicId || !attemptId || isNaN(Number(topicId))) {
          throw new Error('Неверный ID темы или попытки');
        }

        const response = await api.get(`/topics/${topicId}/attempt/${attemptId}`);
        
        // Проверяем структуру ответа
        if (!response.data?.success || !response.data?.data) {
          throw new Error('Неверный формат ответа от сервера');
        }

        const { data } = response.data;

        // Проверяем наличие всех необходимых полей
        if (!data.questions || !Array.isArray(data.questions) || !data.topicName || !data.attemptId) {
          throw new Error('Отсутствуют необходимые данные теста');
        }

        // Проверяем структуру каждого вопроса
        const invalidQuestion = data.questions.find(q => !q.id || !q.text || !Array.isArray(q.answers));
        if (invalidQuestion) {
          throw new Error('Некорректная структура вопросов');
        }

        setTestData({
          topicName: data.topicName,
          questions: data.questions,
          attemptId: data.attemptId,
          progress: data.progress || { answered: 0, total: data.questions.length }
        });
        
        // Устанавливаем время в зависимости от количества вопросов (1 минута на вопрос)
        setTimeLeft(data.questions.length * 60); // 60 секунд * количество вопросов
      } catch (err) {
        console.error('Ошибка загрузки теста:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Ошибка загрузки теста';
        setError(errorMessage);
        // Добавляем небольшую задержку перед редиректом
        setTimeout(() => {
          navigate('/tests/topics');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadTest();
  }, [topicId, attemptId, user, navigate]);

    useEffect(() => {
    if (!testData || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testData, timeLeft]);

  const handleTimeExpired = async () => {
    try {
      await api.post(`/topics/${topicId}/attempt/${attemptId}/finish`);
      navigate(`/tests/topics/${topicId}/attempt/${attemptId}/results`);
    } catch (err) {
      setError('Время вышло! Не удалось завершить тестирование');
    }
  };

  const handleAnswerSelect = (answerId) => {
    setSelectedAnswer(answerId);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;

    try {
      const currentQuestion = testData.questions[currentQuestionIndex];
      
      // Отправляем ответ
      const response = await api.post(`/topics/${topicId}/attempt/${attemptId}/answer`, {
        questionId: currentQuestion.id,
        answerId: selectedAnswer
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Ошибка при отправке ответа');
      }

      // Если это последний вопрос
      if (currentQuestionIndex === testData.questions.length - 1) {
        const finishResponse = await api.post(`/topics/${topicId}/attempt/${attemptId}/finish`);
        
        if (!finishResponse.data?.success) {
          throw new Error('Не удалось завершить тест');
        }

        navigate(`/tests/topics/${topicId}/attempt/${attemptId}/results`);
      } else {
        // Переходим к следующему вопросу
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
      }
    } catch (err) {
      console.error('Ошибка при обработке ответа:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Ошибка при отправке ответа';
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <main className="main-content">
          <LoadingSpinner />
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
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button 
              onClick={() => navigate(`/tests/topics/${topicId}`)}
              className="retry-button"
            >
              Попробовать снова
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!testData || !testData.questions || testData.questions.length === 0) {
    return (
      <div className="page-container">
        <Header />
        <main className="main-content">
          <div className="error-container">
            <div>В этой теме пока нет вопросов</div>
            <button 
              onClick={() => navigate(`/tests/topics/${topicId}`)}
              className="retry-button"
            >
              Вернуться к темам
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <div className="topic-test-container">
          <div className="test-header">
            <h2>Тестирование по теме: {testData.topicName}</h2>
            
            <div className="test-progress-wrapper">
              <div className="test-progress-item">
                <span className="test-progress-label">Вопрос</span>
                <span className="test-progress-count">
                  {currentQuestionIndex + 1}<span className="test-progress-divider">/</span>{testData.questions.length}
                </span>
              </div>
              
              <div className="test-progress-item">
                <span className="test-progress-label">Осталось</span>
                <span className="test-progress-time">
                  {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </span>
              </div>
            </div>
          </div>

          <div className="question-container">
            <div className="question-text">
              <p>{currentQuestion.text}</p>
              {currentQuestion.imageUrl && (
                <img 
                  src={`${process.env.REACT_APP_API_URL}${currentQuestion.imageUrl}`}
                  alt="Иллюстрация к вопросу" 
                  className="question-image"
                  onError={(e) => {
                    console.error('Failed to load question image:', currentQuestion.imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>

            <div className="answers-list">
              {currentQuestion.answers.map(answer => (
                <div 
                  key={answer.id}
                  className={`answer-option ${selectedAnswer === answer.id ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(answer.id)}
                >
                  {answer.text}
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="test-controls">
            <button 
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`submit-button ${selectedAnswer === null ? 'disabled' : ''}`}
            >
              {currentQuestionIndex < testData.questions.length - 1 ? 
                'Следующий вопрос' : 'Завершить тестирование'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}