import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import './AuthPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Функция валидации email
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const fields = [
    {
      name: 'email',
      type: 'email',
      placeholder: 'Ваш email',
      value: email,
      onChange: handleChange,
      required: true,
      isValid: validateEmail(email),
      error: email && !validateEmail(email) ? 'Некорректный email' : null
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Введите корректный email');
      return;
    }

    setIsLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setMessage('Письмо с инструкциями отправлено на ваш email');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при отправке запроса');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Восстановление пароля"
      fields={fields}
      submitText={isLoading ? 'Отправка...' : 'Отправить'}
      error={error}
      onSubmit={handleSubmit}
      linkDescription="Вспомнили пароль?"
      linkText="Войти"
      linkPath="/login"
      isLoading={isLoading}
    >
      {message && <div className="success-message">{message}</div>}
    </AuthForm>
  );
}