import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import './AuthPage.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);
    try {
      await API.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.error || 'Ошибка при сбросе пароля');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page-container">
        <div className="auth-form-container">
          <div className="auth-form">
            <h2>Пароль успешно изменен!</h2>
            <div className="success-message">
              <p>Вы будете перенаправлены на страницу входа через 3 секунды...</p>
              <div className="success-animation">✓</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fields = [
    {
      name: 'newPassword',
      type: 'password',
      placeholder: 'Новый пароль (минимум 6 символов)',
      value: newPassword,
      onChange: (e) => {
        setNewPassword(e.target.value);
        setError('');
      },
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
      onChange: (e) => {
        setConfirmPassword(e.target.value);
        setError('');
      },
      required: true,
      isValid: newPassword === confirmPassword && confirmPassword !== '',
      error: confirmPassword && newPassword !== confirmPassword ? 'Пароли не совпадают' : null
    }
  ];

  return (
    <AuthForm
      title="Сброс пароля"
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