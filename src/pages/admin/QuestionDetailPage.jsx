import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { FaTimes, FaEdit, FaTrash, FaSave, FaCheck, FaTimes as FaClose } from 'react-icons/fa';
import AdminSidebar from '../../components/admin/AdminSidebar';
import './admin.css';

const QuestionDetailPage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchQuestion = async () => {
      try {
        const { data } = await API.get(`/admin/questions/${id}`);
        setQuestion(data);
      } catch (err) {
        console.error('Ошибка загрузки вопроса:', err);
        setError('Не удалось загрузить вопрос');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchQuestion();
    }
  }, [user, id, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await API.put(`/admin/questions/${id}`, question);
      setIsEditing(false);
      setSuccessMessage('Вопрос успешно обновлен');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Ошибка сохранения вопроса:', err);
      setErrorMessage('Не удалось сохранить вопрос');
      setSuccessMessage('');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      try {
        await API.delete(`/admin/questions/${id}`);
        navigate('/admin/questions');
        setSuccessMessage('Вопрос успешно удален');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Ошибка удаления вопроса:', err);
        setErrorMessage('Не удалось удалить вопрос');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const handleChange = (e, field, answerIndex = null) => {
    const value = e.target.value;
    if (answerIndex !== null) {
      const newAnswers = [...question.answers];
      newAnswers[answerIndex][field] = value;
      setQuestion({ ...question, answers: newAnswers });
    } else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setQuestion(prevQuestion => ({
        ...prevQuestion,
        [parent]: {
          ...prevQuestion[parent],
          [child]: value
        }
      }));
    } else {
      setQuestion({ ...question, [field]: value });
    }
  };

  if (!user || user.role !== 'admin') {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button onClick={() => window.location.reload()}>Повторить</button>
      </div>
    );
  }

  if (isLoading || !question) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="admin-layout">
      <div className="admin-content">
        <div className="question-detail-page">
          <button
            className="profile-close-btn"
            onClick={() => navigate('/admin/questions')}
            aria-label="Закрыть страницу настроек"
          >
            <FaTimes aria-hidden="true" />
          </button>
          <h1>Подробнее о вопросе</h1>
          {successMessage && (
            <div className="success-message">
              <FaCheck /> {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="error-message">
              <FaClose /> {errorMessage}
            </div>
          )}
          <div className="button-group">
            {isEditing ? (
              <button className="save-btn" onClick={handleSave}>
                <FaSave /> Сохранить
              </button>
            ) : (
              <button className="edit-btn" onClick={handleEdit}>
                <FaEdit /> Редактировать
              </button>
            )}
            <button className="delete-btn" onClick={handleDelete}>
              <FaTrash /> Удалить
            </button>
          </div>
          <div className="question-details">
            <div className="question-field">
              <label>ID:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={question.id}
                  onChange={(e) => handleChange(e, 'id')}
                  disabled
                />
              ) : (
                <span>{question.id}</span>
              )}
            </div>
            <div className="question-field">
              <label>Название вопроса:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => handleChange(e, 'text')}
                />
              ) : (
                <span>{question.text}</span>
              )}
            </div>
            <div className="question-field">
              <label>Тема вопроса:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={question.topic.name}
                  onChange={(e) => handleChange(e, 'topic', 'name')}
                />
              ) : (
                <span>{question.topic.name}</span>
              )}
            </div>
            {question.imageUrl && (
              <div className="question-field">
                <label>Изображение:</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={question.imageUrl}
                    onChange={(e) => handleChange(e, 'imageUrl')}
                  />
                ) : (
                  <img src={question.imageUrl} alt="Question" width="100" />
                )}
              </div>
            )}
            <div className="question-field">
              <label>Варианты ответов:</label>
              {question.answers.map((answer, index) => (
                <div key={answer.id} className="answer-field">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={answer.text}
                        onChange={(e) => handleChange(e, 'text', index)}
                      />
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        onChange={(e) =>
                          handleChange(e, 'isCorrect', index)
                        }
                      />
                      <label>Правильный ответ</label>
                    </>
                  ) : (
                    <>
                      <span>{answer.text}</span>
                      {answer.isCorrect && <span> (Правильный)</span>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
