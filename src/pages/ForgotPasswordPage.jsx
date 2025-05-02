import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import pddBackground from '../assets/pdd-background.jpg';
import './AuthPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

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
      setIsEmailSent(true); // Устанавливаем флаг отправки
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при отправке запроса');
      setIsEmailSent(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="auth-page-container">
        <div 
          className="auth-background" 
          style={{ backgroundImage: `url(${pddBackground})` }}
        ></div>
        
        <div className="auth-form-container">
          <div className="auth-form">
            <h2>Проверьте вашу почту</h2>
            <div className="success-message">
              <div className="success-icon">✓</div>
              <div className="success-content">
                <p>Мы отправили письмо с инструкциями на <strong>{email}</strong></p>
                <p>Если письмо не пришло, проверьте папку "Спам"</p>
              </div>
              <Link to="/login" className="back-to-login">Вернуться к входу</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    />
  );
}