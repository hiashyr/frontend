import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import './admin.css';

const AddQuestionPage = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState('');
  const [topicId, setTopicId] = useState('');
  const [topics, setTopics] = useState([]);
  const [answers, setAnswers] = useState([{ text: '', isCorrect: false }]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHard, setIsHard] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchTopics = async () => {
      try {
        const { data } = await API.get('/topics');
        setTopics(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Ошибка загрузки тем:', err);
        setError('Не удалось загрузить темы');
        showNotification({ message: 'Не удалось загрузить темы', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchTopics();
    }
  }, [user, navigate, showNotification]);

  const handleAddAnswer = () => {
    setAnswers([...answers, { text: '', isCorrect: false }]);
  };

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...answers];
    newAnswers[index][field] = value;
    setAnswers(newAnswers);
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create a FormData object to handle file upload
      const formData = new FormData();
      formData.append('text', questionText);
      formData.append('topicId', topicId);
      formData.append('isHard', isHard.toString());
      formData.append('answers', JSON.stringify(answers));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await API.post('/admin/questions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showNotification({ message: 'Вопрос успешно добавлен', type: 'success' });
      navigate('/admin/questions');
    } catch (err) {
      console.error('Ошибка добавления вопроса:', err);
      setError('Не удалось добавить вопрос');
      showNotification({ message: 'Не удалось добавить вопрос', type: 'error' });
    } finally {
      setIsLoading(false);
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

  return (
    <div className="admin-layout">
      <div className="admin-content">
        <div className="add-question-page">
          <h1>Добавить вопрос</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Текст вопроса:</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Тема:</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                required
              >
                <option value="">Выберите тему</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Ответы:</label>
              {answers.map((answer, index) => (
                <div key={index} className="answer-group">
                  <input
                    type="text"
                    placeholder="Текст ответа"
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                    required
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={answer.isCorrect}
                      onChange={(e) => handleAnswerChange(index, 'isCorrect', e.target.checked)}
                    />
                    Правильный ответ
                  </label>
                </div>
              ))}
              <button type="button" onClick={handleAddAnswer} className="add-answer-button">
                Добавить ответ
              </button>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={isHard}
                  onChange={(e) => setIsHard(e.target.checked)}
                />
                Сложный вопрос
              </label>
            </div>
            <div className="form-group">
              <label>
                Загрузить изображение:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Добавление...' : 'Добавить вопрос'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionPage;
