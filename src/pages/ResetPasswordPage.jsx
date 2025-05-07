import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import { useNotification } from '../contexts/NotificationContext';
import './AuthPage.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenUsed, setIsTokenUsed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.post('/auth/reset-password', { 
        token: searchParams.get('token'), 
        newPassword 
      });
      
      showNotification({
        message: 'Пароль успешно изменён! Теперь вы можете войти с новым паролем.',
        type: 'success'
      });
      
      navigate('/login', { replace: true });
      
    } catch (error) {
      const serverError = error.response?.data;
      
      if (serverError?.error === 'TOKEN_ALREADY_USED') {
        setIsTokenUsed(true);
        setError(serverError.message);
      } else {
        setError(serverError?.message || 'Ошибка при сбросе пароля');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenUsed) {
    return (
      <div className="password-reset-container">
        <div className="password-reset-card">
          <h2>Ссылка уже использована</h2>
          <div className="alert alert-info">
            <p>Вы уже использовали эту ссылку для сброса пароля.</p>
            <p>Если вы забыли пароль, запросите новую ссылку.</p>
          </div>
          <div className="action-buttons">
            <Link to="/forgot-password" className="btn btn-primary">
              Запросить новую ссылку
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Войти в аккаунт
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthForm
      title="Смена пароля"
      fields={[
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'Новый пароль (минимум 6 символов)',
          value: newPassword,
          onChange: (e) => setNewPassword(e.target.value),
          required: true,
          minLength: 6,
          isValid: newPassword.length >= 6,
          error: newPassword && newPassword.length < 6 ? 'Слишком короткий пароль' : null
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Подтвердите пароль',
          value: confirmPassword,
          onChange: (e) => setConfirmPassword(e.target.value),
          required: true,
          isValid: newPassword === confirmPassword && confirmPassword !== '',
          error: confirmPassword && newPassword !== confirmPassword ? 'Пароли не совпадают' : null
        }
      ]}
      submitText={isLoading ? 'Сохранение...' : 'Сохранить пароль'}
      error={error}
      onSubmit={handleSubmit}
      linkDescription="Вспомнили пароль?"
      linkText="Войти"
      linkPath="/login"
      isLoading={isLoading}
    />
  );
};

export default ResetPasswordPage; // Добавлен экспорт компонента