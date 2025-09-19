import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import './admin.css';

const QuestionDetailPage = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
      const response = await API.put(`/admin/questions/${id}`, question);
      if (response.notification) {
        showNotification(response.notification);
      } else {
        showNotification({ message: 'Вопрос успешно сохранен', type: 'success' });
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Ошибка сохранения вопроса:', err);
      showNotification({ message: 'Не удалось сохранить вопрос', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      try {
        const response = await API.delete(`/admin/questions/${id}`);
        if (response.notification) {
          showNotification(response.notification);
        } else {
          showNotification({ message: 'Вопрос успешно удален', type: 'success' });
        }
        navigate('/admin/questions');
      } catch (err) {
        console.error('Ошибка удаления вопроса:', err);
        showNotification({ message: 'Не удалось удалить вопрос', type: 'error' });
      }
    }
  };

  const handleChange = (e, field, answerIndex = null) => {
    const value = field === 'isCorrect' ? e.target.checked : e.target.value;

    if (answerIndex !== null) {
      if (field === 'isCorrect' && value) {
        // If marking an answer as correct, unmark all others
        const newAnswers = question.answers.map((answer, idx) =>
          idx === answerIndex ? { ...answer, isCorrect: true } : { ...answer, isCorrect: false }
        );
        setQuestion({ ...question, answers: newAnswers });
      } else {
        const newAnswers = [...question.answers];
        newAnswers[answerIndex][field] = value;
        setQuestion({ ...question, answers: newAnswers });
      }
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

  const handleAddAnswer = () => {
    const newAnswer = { text: '', isCorrect: false };
    setQuestion({ ...question, answers: [...question.answers, newAnswer] });
  };

  const handleRemoveAnswer = (index) => {
    const newAnswers = [...question.answers];
    newAnswers.splice(index, 1);
    setQuestion({ ...question, answers: newAnswers });
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
          <h1>Подробнее о вопросе</h1>
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
              <label>Вопрос:</label>
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
                  <img src={question.imageUrl} alt="Question" width="600" />
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
                      <button
                        onClick={() => handleRemoveAnswer(index)}
                        className="remove-answer-button"
                      >
                        Удалить
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{answer.text}</span>
                      {answer.isCorrect && <span> (Правильный)</span>}
                    </>
                  )}
                </div>
              ))}
              {isEditing && (
                <button onClick={handleAddAnswer} className="add-answer-button">
                  Добавить ответ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
