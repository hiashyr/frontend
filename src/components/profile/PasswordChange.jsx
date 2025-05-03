import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import API from '../../services/api';

export default function PasswordChange() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPassword) {
      showNotification({
        message: 'Введите текущий пароль',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      await API.post('/auth/request-password-change', { 
        currentPassword,
        email: user.email
      });
      
      showNotification({
        message: 'Письмо с подтверждением отправлено на ваш email',
        type: 'success'
      });
      setCurrentPassword('');
    } catch (err) {
      showNotification({
        message: err.response?.data?.error || 'Ошибка при запросе смены пароля',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="password-change-form">
      <div className="form-group">
        <label htmlFor="currentPassword">Текущий пароль</label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          aria-required="true"
        />
        <p className="form-hint">
          После подтверждения вы получите письмо со ссылкой для смены пароля
        </p>
      </div>
      
      <button type="submit" disabled={isLoading} className="submit-btn">
        {isLoading ? 'Отправка...' : 'Запросить смену пароля'}
      </button>
    </form>
  );
}