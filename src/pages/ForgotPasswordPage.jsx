import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import pddBackground from '../assets/pdd-background.jpg';
import './AuthPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('form'); // 'form', 'email_not_found', 'email_sent'

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Введите корректный email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.post('/auth/forgot-password', { email });
      
      if (response.emailExists) {
        setStatus('email_sent');
      } else {
        setStatus('email_not_found');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при отправке запроса');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'email_not_found') {
    return (
      <div className="auth-page-container">
        <div 
          className="auth-background" 
          style={{ backgroundImage: `url(${pddBackground})` }}
          aria-hidden="true"
        ></div>
        
        <div className="auth-form-container">
          <div className="status-card" role="region" aria-live="polite">
            <h1>Email не найден</h1>
            <div className="status-message">
              <p>Аккаунт с email <strong>{email}</strong> не зарегистрирован.</p>
              <p>Проверьте правильность ввода или зарегистрируйтесь.</p>
            </div>
            <div className="status-actions">
              <button 
                onClick={() => {
                  setEmail('');
                  setStatus('form');
                }}
                className="btn-primary"
                aria-label="Попробовать другой email"
              >
                Попробовать другой email
              </button>
              <Link to="/register" className="btn-secondary" aria-label="Перейти к регистрации">
                Зарегистрироваться
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'email_sent') {
    return (
      <div className="auth-page-container">
        <div 
          className="auth-background" 
          style={{ backgroundImage: `url(${pddBackground})` }}
          aria-hidden="true"
        ></div>
        
        <div className="auth-form-container">
          <div className="status-card" role="region" aria-live="polite">
            <h1>Письмо отправлено</h1>
            <div className="status-message">
              <p>Инструкции по восстановлению пароля отправлены на <strong>{email}</strong></p>
              <p>Проверьте папку "Спам", если письмо не пришло.</p>
            </div>
            <div className="status-actions">
              <Link 
                to="/login" 
                className="btn-primary"
                aria-label="Вернуться на страницу входа"
              >
                Вернуться к входу
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container">
      <div 
        className="auth-background" 
        style={{ backgroundImage: `url(${pddBackground})` }}
        aria-hidden="true"
      ></div>
      
      <div className="auth-form-container">
        <div className="auth-form">
          <h1>Восстановление пароля</h1>
          <form onSubmit={handleSubmit} aria-label="Форма восстановления пароля">
            <div className="form-group">
              <label htmlFor="forgot-email" className="visually-hidden">
                Email для восстановления пароля
              </label>
              <input
                id="forgot-email"
                type="email"
                name="email"
                placeholder="Введите ваш email"
                value={email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={error ? 'invalid' : ''}
                aria-invalid={!!error}
                aria-describedby={error ? "email-error" : undefined}
              />
              {error && (
                <div id="email-error" className="field-error" role="alert">
                  {error}
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || !email || !validateEmail(email)}
              aria-disabled={isLoading || !email || !validateEmail(email)}
            >
              {isLoading ? 'Отправка...' : 'Отправить'}
            </button>
          </form>
          
          <p className="auth-link">
            Вспомнили пароль? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}