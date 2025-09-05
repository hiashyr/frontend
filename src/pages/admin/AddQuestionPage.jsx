import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import API from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaChartLine, FaClipboardList } from 'react-icons/fa';
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
  const [isImageUploadEnabled, setIsImageUploadEnabled] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchTopics = async () => {
      try {
        const { data } = await API.get('/topics?_t=' + new Date().getTime());
        console.log('Fetched topics data:', data);
        setTopics(data.data);
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

  useEffect(() => {
    console.log('Topics state updated:', topics);
  }, [topics]);

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

  const toggleImageUpload = () => {
    setIsImageUploadEnabled(!isImageUploadEnabled);
  };

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
              <span>
                {isHard ? 'Сложный' : 'Не сложный'} вопрос
              </span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isHard}
                  onChange={(e) => setIsHard(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div>
              {/* Свитчер */}
              <div className="form-group">
                <span>
                  {isImageUploadEnabled ? 'Выключить' : 'Включить'} загрузку изображения
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={isImageUploadEnabled}
                    onChange={toggleImageUpload}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              {/* Блок загрузки изображения */}
              {isImageUploadEnabled && (
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
              )}
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Добавление...' : 'Добавить вопрос'}
            </button>
          </form>
        </div>
      </div>

      <div className="mobile-nav">
        <NavLink
          to="/admin/dashboard"
          className={({isActive}) => isActive ? 'active' : ''}
          aria-label="Дашборд"
        >
          <FaChartLine className="icon" />
        </NavLink>
        <NavLink
          to="/admin/questions"
          className={({isActive}) => isActive ? 'active' : ''}
          aria-label="Вопросы"
        >
          <FaClipboardList className="icon" />
        </NavLink>
      </div>
    </div>
  );
};

export default AddQuestionPage;
