import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import { useNotification } from '../contexts/NotificationContext';
import './AuthPage.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    try {
      await API.post('/auth/reset-password', { 
        token: searchParams.get('token'), 
        newPassword 
      });
      
      // Показываем уведомление и перенаправляем
      showNotification({
        message: 'Пароль успешно изменен! Теперь вы можете войти с новым паролем',
        type: 'success'
      });
      
      navigate('/login', { replace: true });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при сбросе пароля');
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
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
  ];

  return (
    <AuthForm
      title="Смена пароля"
      fields={fields}
      submitText={isLoading ? 'Сохранение...' : 'Сохранить пароль'}
      error={error}
      onSubmit={handleSubmit}
      linkDescription="Вспомнили пароль?"
      linkText="Войти"
      linkPath="/login"
      isLoading={isLoading}
    />
  );
}