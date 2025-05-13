import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import QuestionCard from '../../components/tests/QuestionCard';
import './TopicTestPage.css';

export default function TopicTestPage() {
  const { topicId, attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTest = async () => {
      try {
        // Усиленные проверки параметров
        if (!topicId || !attemptId || isNaN(Number(topicId))) {
          throw new Error('Неверный ID темы или попытки');
        }
        
        const parsedAttemptId = parseInt(attemptId, 10);
        if (isNaN(parsedAttemptId) || parsedAttemptId <= 0) {
          throw new Error('Неверный ID попытки');
        }

        const response = await api.get(`/topics/${topicId}/attempt/${parsedAttemptId}`);
        if (!response.data) {
          throw new Error('Данные теста не получены');
        }
        
        setTestData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Ошибка загрузки теста');
        // Перенаправляем обратно к выбору тем при ошибке
        navigate('/tests/topics', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (user) loadTest();
  }, [topicId, attemptId, user, navigate]);
  
  const handleAnswerSelect = async (answerId) => {
    try {
      // Отправляем ответ на сервер
      await api.post(`/topics/${topicId}/attempt/${attemptId}/answer`, {
        questionId: testData.questions[currentQuestionIndex].id,
        answerId
      });

      // Переход к следующему вопросу или завершение
      if (currentQuestionIndex < testData.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        navigate(`/tests/topics/${topicId}/results/${attemptId}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Ошибка сохранения ответа');
    }
  };

  if (loading) return <div>Загрузка теста...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!testData) return <div>Данные теста не загружены</div>;

  const currentQuestion = testData.questions[currentQuestionIndex];

  return (
    <div className="topic-test-container">
      <h2>Тестирование по теме: {testData.topicName}</h2>
      <div className="progress">
        Вопрос {currentQuestionIndex + 1} из {testData.questions.length}
      </div>
      
      <QuestionCard 
        question={currentQuestion}
        answers={currentQuestion.answers}
        onAnswerSelect={handleAnswerSelect}
      />
    </div>
  );
}