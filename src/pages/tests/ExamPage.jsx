import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import './ExamPage.css';

export default function ExamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 минут в секундах

  // Загрузка экзамена
  useEffect(() => {
    const startExam = async () => {
      try {
        setLoading(true);
        const response = await api.post('/exam/start');
        setExamData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      startExam();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  // Таймер
  useEffect(() => {
    if (!examData) return;

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
  }, [examData]);

  const handleTimeExpired = async () => {
    try {
      await api.post(`/exam/${examData.attemptId}/finish`);
      navigate(`/tests/exam/${examData.attemptId}/results`);
    } catch (err) {
      setError('Время вышло! Не удалось завершить экзамен');
    }
  };

  const handleAnswerSelect = (answerId) => {
    setSelectedAnswer(answerId);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;
  
    try {
      const currentQuestion = examData.questions[currentQuestionIndex];
      const response = await api.post(`/exam/${examData.attemptId}/answer`, {
        questionId: currentQuestion.id,
        answerId: selectedAnswer
      });
  
      if (response.data.requiresAdditionalQuestions) {
        const additionalResponse = await api.post(
          `/exam/${examData.attemptId}/request-additional`
        );
        setExamData(prev => ({
          ...prev,
          questions: [...prev.questions, ...additionalResponse.data.questions]
        }));
      }
  
      // Если это не последний вопрос
      if (currentQuestionIndex < examData.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } 
      // Если это последний вопрос
      else {
        try {
          const finishResponse = await api.post(`/exam/${examData.attemptId}/finish`);
          
          // Проверяем, нужны ли дополнительные вопросы
          if (finishResponse.data.status === 'additional_required') {
            setExamData(prev => ({
              ...prev,
              questions: [...prev.questions, ...finishResponse.data.questions]
            }));
            setCurrentQuestionIndex(prev => prev + 1); // Переходим к доп. вопросам
            setSelectedAnswer(null);
          } else {
            // Если доп. вопросы не нужны - переходим к результатам
            navigate(`/tests/exam/${examData.attemptId}/results`);
          }
        } catch (finishError) {
          console.error('Failed to finish exam:', finishError);
          setError('Не удалось завершить экзамен');
        }
      }
    } catch (err) {
      console.error('Answer submission error:', err);
      setError(err.response?.data?.error || err.message || 'Ошибка при отправке ответа');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;
  if (!examData) return <div>Не удалось загрузить данные экзамена</div>;

  const currentQuestion = examData.questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="exam-container">
      <div className="exam-header">
        <h2>Экзамен по ПДД</h2>
        <div className="timer">
          Осталось времени: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
        <div className="progress">
          Вопрос {currentQuestionIndex + 1} из {examData.questions.length}
        </div>
      </div>

      <div className="question-container">
        <div className="question-text">
          <p>{currentQuestion.text}</p>
          {currentQuestion.imageUrl && (
            <img 
              src={currentQuestion.imageUrl} 
              alt="Иллюстрация к вопросу" 
              className="question-image"
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

      <div className="exam-controls">
        <button 
          onClick={handleSubmitAnswer}
          disabled={selectedAnswer === null}
          className="submit-button"
        >
          {currentQuestionIndex < examData.questions.length - 1 ? 'Следующий вопрос' : 'Завершить экзамен'}
        </button>
      </div>
    </div>
  );
}