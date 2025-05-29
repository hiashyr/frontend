import { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './TopicSelection.css';

export default function TopicSelection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await api.get('/topics');
        
        // Убедимся, что получаем массив из data
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setTopics(response.data.data);
        } else {
          setTopics([]); // На случай если структура ответа неверная
          console.error('Unexpected response format:', response.data);
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Ошибка загрузки тем');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTopics();
  }, [user]);

    const startTest = async (topicId) => {
        try {
            // Сначала создаем новую попытку
            const startResponse = await api.post(`/topics/${topicId}/start`);
            
            if (!startResponse.data?.success || !startResponse.data?.data?.attemptId) {
                throw new Error('Не удалось создать попытку тестирования');
            }

            const attemptId = startResponse.data.data.attemptId;

            // Проверяем, что попытка создана успешно
            const checkResponse = await api.get(`/topics/${topicId}/attempt/${attemptId}`);
            
            if (!checkResponse.data?.success || !checkResponse.data?.data?.questions) {
                throw new Error('Не удалось загрузить вопросы теста');
            }

            // Если все успешно, переходим к тесту
            navigate(`/tests/topics/${topicId}/attempt/${attemptId}`);
        } catch (err) {
            console.error('Ошибка начала теста:', err);
            const errorMessage = err.response?.data?.error || 
                               err.response?.data?.message || 
                               err.message || 
                               'Ошибка начала теста';
            setError(errorMessage);
        }
    };

  if (loading) return <div>Загрузка тем...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="topic-selection">
      <h2>Выберите тему для тестирования</h2>
      <div className="topics-grid">
        {topics.map(topic => (
          <div key={topic.id} className="topic-card">
            <h3>{topic.name}</h3>
            <p className="description">{topic.description}</p>
            <div className="stats">
              <span>Вопросов: {topic.questions_count}</span>
              <span>Время: {topic.questions_count} мин</span>
              <span className="topic-status">
                Статус: 
                <span className={`status-indicator status-${topic.status}`}>
                  {getStatusText(topic.status)}
                </span>
              </span>
            </div>
            <button 
              className="start-button"
              onClick={() => startTest(topic.id)}
            >
              Начать тест
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  function getStatusText(status) {
    const statusMap = {
      'not_started': 'Не начата',
      'in_progress': 'В процессе',
      'passed': 'Пройдена',
      'failed': 'Не пройдена'
    };
    return statusMap[status] || status;
  }
}