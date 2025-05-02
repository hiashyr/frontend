import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import API from '../../services/api';

export default function PasswordChange({ onSuccess }) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showNotification({
        message: 'Новые пароли не совпадают',
        type: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);
      await API.post('/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        email: user.email
      });
      
      onSuccess();
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (err) {
      showNotification({
        message: err.response?.data?.error || 'Ошибка смены пароля',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="password-form">
      <div className="form-group">
        <label>Текущий пароль</label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Новый пароль</label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          minLength="6"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Подтвердите пароль</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
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