import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';

export default function PasswordChange() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await API.post('/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setSuccess('Пароль успешно изменен');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка смены пароля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="password-change">
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
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Сохранение...' : 'Изменить пароль'}
      </button>
    </form>
  );
}