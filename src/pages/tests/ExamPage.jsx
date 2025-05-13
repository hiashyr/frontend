import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './ExamPage.css';

export default function ExamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20 * 60);

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
    try {
      const currentQuestion = examData.questions[currentQuestionIndex];
      const response = await api.post(`/exam/${examData.attemptId}/answer`, {
        questionId: currentQuestion.id,
        answerId: selectedAnswer,
        attemptId: examData.attemptId
      });

      if (response.additionalQuestions) {
        setExamData(prev => ({
          ...prev,
          questions: [...prev.questions, ...response.additionalQuestions.questions],
          timeLimit: response.additionalQuestions.timeLimit
        }));
        setTimeLeft(response.additionalQuestions.timeLimit);
        setSelectedAnswer(null);
        return;
      }

      if (currentQuestionIndex < examData.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        await api.post(`/exam/${examData.attemptId}/finish`);
        navigate(`/tests/exam/${examData.attemptId}/results`);
      }

      setSelectedAnswer(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Ошибка при отправке ответа');
    }
  };

  if (loading) return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <LoadingSpinner />
      </main>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button 
            onClick={() => navigate('/tests/exam')}
            className="retry-button"
          >
            Попробовать снова
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );

  if (!examData) return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <div className="error-container">
          <div>Не удалось загрузить данные экзамена</div>
          <button 
            onClick={() => navigate('/tests/exam')}
            className="retry-button"
          >
            Попробовать снова
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );

  const currentQuestion = examData.questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <div className="exam-container">
          <div className="exam-header">
            <h2 className="exam-title">Экзамен по ПДД</h2>
            
            {/* Новый блок прогресса с уникальными классами */}
            <div className="exam-progress-wrapper">
              <div className="exam-progress-item">
                <span className="exam-progress-label">Вопрос</span>
                <span className="exam-progress-count">
                  {currentQuestionIndex + 1}<span className="exam-progress-divider">/</span>{examData.questions.length}
                </span>
              </div>
              
              <div className="exam-progress-item">
                <span className="exam-progress-label">Осталось</span>
                <span className="exam-progress-time">
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

          {error && <div className="error-message">{error}</div>}

          <div className="exam-controls">
            <button 
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`submit-button ${selectedAnswer === null ? 'disabled' : ''}`}
            >
              {currentQuestionIndex < examData.questions.length - 1 ? 
                'Следующий вопрос' : 'Завершить экзамен'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}