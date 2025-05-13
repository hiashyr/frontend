import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import QuestionCard from '../../components/tests/QuestionCard';
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
  const [timeLeft, setTimeLeft] = useState(20 * 60);

  useEffect(() => {
    const loadTest = async () => {
      try {
        if (!topicId || !attemptId || isNaN(Number(topicId))) {
          throw new Error('Неверный ID темы или попытки');
        }

        const response = await api.get(`/topics/${topicId}/attempt/${attemptId}`);
        
        // Добавляем проверку структуры ответа
        if (!response.data || !response.data.questions || !Array.isArray(response.data.questions)) {
          throw new Error('Неверный формат данных теста');
        }

        setTestData({
          ...response.data,
          questions: response.data.questions || [] // Гарантируем массив
        });
        setTimeLeft(20 * 60);
      } catch (err) {
        console.error('Ошибка загрузки теста:', err);
        setError(err.response?.data?.error || err.message || 'Ошибка загрузки теста');
        navigate(`/tests/topics/${topicId}`);
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
    try {
      const currentQuestion = testData.questions[currentQuestionIndex];
      await api.post(`/topics/${topicId}/attempt/${attemptId}/answer`, {
        questionId: currentQuestion.id,
        answerId: selectedAnswer
      });

      if (currentQuestionIndex < testData.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
          try {
              await api.post(`/topics/${topicId}/attempt/${attemptId}/finish`);
              navigate(`/tests/topics/${topicId}/attempt/${attemptId}/results`);
          } catch (err) {
              setError(err.response?.data?.error || err.message || 'Ошибка завершения теста');
          }
      }

      setSelectedAnswer(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Ошибка при отправке ответа');
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

  // Добавляем проверку на наличие вопросов
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

  // Добавляем проверку на существование currentQuestion
  if (!currentQuestion) {
    return (
      <div className="page-container">
        <Header />
        <main className="main-content">
          <div className="error-container">
            <div>Ошибка загрузки вопроса</div>
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
            <QuestionCard 
              question={currentQuestion}
              answers={currentQuestion.answers}
              onAnswerSelect={handleAnswerSelect}
            />
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