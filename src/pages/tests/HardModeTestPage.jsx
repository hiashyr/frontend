import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './TopicTestPage.css'; // Используем те же стили, что и для обычного теста

export default function HardModeTestPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const loadTest = async () => {
      try {
        if (!attemptId) {
          throw new Error('Неверный ID попытки');
        }

        const response = await api.get(`/tests/hard-mode/attempt/${attemptId}`);
        
        if (!response.data?.success || !response.data?.data) {
          throw new Error('Неверный формат ответа от сервера');
        }

        const { data } = response.data;

        if (!data.questions || !Array.isArray(data.questions)) {
          throw new Error('Отсутствуют вопросы теста');
        }

        setTestData(data);
        setTimeLeft(data.timeLimit || data.questions.length * 60); // 1 минута на вопрос по умолчанию
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Ошибка загрузки теста';
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
      loadTest();
    }
  }, [attemptId, user, showNotification]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0 && testData) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleAnswerSelect = (answerId) => {
    setSelectedAnswer(answerId);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      showNotification({
        message: 'Пожалуйста, выберите ответ',
        type: 'error'
      });
      return;
    }

    try {
      const currentQuestion = testData.questions[currentQuestionIndex];
      if (!currentQuestion || !currentQuestion.id) {
        throw new Error('Некорректные данные вопроса');
      }

      const response = await api.post(`/tests/hard-mode/attempt/${attemptId}/answer`, {
        questionId: currentQuestion.id,
        answerId: selectedAnswer
      });

      if (!response.data?.success) {
        throw new Error('Ошибка при отправке ответа');
      }

      // Если тест завершен или это был последний вопрос
      if (response.data.data?.isCompleted || currentQuestionIndex + 1 >= testData.questions.length) {
        navigate(`/tests/hard-mode/results/${attemptId}`);
        return;
      }

      // Переход к следующему вопросу
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Ошибка при отправке ответа';
      showNotification({
        message: errorMessage,
        type: 'error'
      });
      
      // В случае критической ошибки, перенаправляем на страницу результатов
      if (err.response?.status === 400 || err.response?.status === 500) {
        navigate(`/tests/hard-mode/results/${attemptId}`);
      }
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
              onClick={() => navigate('/tests/hard-mode')}
              className="retry-button"
            >
              Вернуться к началу
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
            <div>Нет доступных вопросов</div>
            <button 
              onClick={() => navigate('/tests/hard-mode')}
              className="retry-button"
            >
              Вернуться к началу
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  // Для отладки: смотрим, что приходит в imageUrl
  console.log('imageUrl:', currentQuestion.imageUrl);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <div className="topic-test-container">
          <div className="test-header">
            <h2>Сложные вопросы ПДД</h2>
            <div className="test-progress-wrapper">
              <div className="test-progress-item">
                <span className="test-progress-label">Вопрос</span>
                <span className="test-progress-count">
                  {currentQuestionIndex + 1} / {testData.questions.length}
                </span>
              </div>
              <div className="test-progress-item">
                <span className="test-progress-label">Осталось времени</span>
                <span className="test-progress-time">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          <div className="question-container">
            <p className="question-text">{currentQuestion.text}</p>
            {currentQuestion.imageUrl && (
              <img 
                src={`${process.env.REACT_APP_API_URL}${currentQuestion.imageUrl.replace(/^\/api/, '')}`}
                alt="Иллюстрация к вопросу" 
                className="question-image"
                onError={(e) => {
                  console.error('Failed to load question image:', currentQuestion.imageUrl);
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="answers-list">
              {currentQuestion.answers.map(answer => (
                <button
                  key={answer.id}
                  className={`answer-option ${selectedAnswer === answer.id ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(answer.id)}
                >
                  {answer.text}
                </button>
              ))}
            </div>
          </div>

          <div className="test-controls">
            <button 
              className={`submit-button ${!selectedAnswer ? 'disabled' : ''}`}
              onClick={handleSubmit}
              disabled={!selectedAnswer}
            >
              {currentQuestionIndex + 1 === testData.questions.length ? 'Завершить' : 'Следующий вопрос'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}