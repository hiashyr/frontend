import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import './HardModePage.css';

export default function HardModePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    const startHardTest = async () => {
      try {
        const response = await api.post('/tests/hard-mode/start');
        
        if (!response.data?.success || !response.data?.data?.attemptId) {
          throw new Error('Не удалось начать тестирование');
        }

        navigate(`/tests/hard-mode/attempt/${response.data.data.attemptId}`);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Ошибка начала тестирования';
        showNotification({
          message: errorMessage,
          type: 'error'
        });
        // Navigate back to home page if there's an error
        navigate('/');
      }
    };

    if (user) {
      startHardTest();
    }
  }, [user, navigate, showNotification]);

  return (
    <div className="loading-container">
      <LoadingSpinner />
      <p>Загрузка теста...</p>
    </div>
  );
} 