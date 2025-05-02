import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import API from '../../services/api';

export default function ChangePassword() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      showNotification({
        message: 'Пароли не совпадают',
        type: 'error'
      });
      return;
    }

    if (newPassword.length < 6) {
      showNotification({
        message: 'Пароль должен содержать минимум 6 символов',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      await API.post('/auth/change-password', { 
        currentPassword,
        newPassword,
        email: user.email // Добавляем email для отправки подтверждения
      });
      
      showNotification({
        message: 'Пароль успешно изменен. Проверьте вашу почту для подтверждения.',
        type: 'success'
      });
      
      // Очищаем поля формы
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showNotification({
        message: err.response?.data?.error || 'Ошибка при изменении пароля',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="password-change-form">
      <div className="form-group">
        <label>Текущий пароль</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Новый пароль</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength="6"
          required
        />
        <small>Минимум 6 символов</small>
      </div>
      
      <div className="form-group">
        <label>Подтвердите новый пароль</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength="6"
          required
        />
      </div>
      
      <button type="submit" disabled={isLoading} className="submit-btn">
        {isLoading ? 'Сохранение...' : 'Изменить пароль'}
      </button>
    </form>
  );
}