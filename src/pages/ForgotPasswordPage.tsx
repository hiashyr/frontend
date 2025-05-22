import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useForm } from '../hooks/useForm';
import { validateEmail, EMAIL_REGEX } from '../utils/validation';
import pddBackground from '../assets/pdd-background.jpg';
import './AuthPage.css';

interface ForgotPasswordResponse {
  emailExists: boolean;
  message: string;
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'form' | 'email_not_found' | 'email_sent'>('form');
  const [serverError, setServerError] = useState('');

  const { fields, handleChange, handleBlur, isValid, resetForm } = useForm({
    email: {
      name: 'email',
      value: '',
      required: true,
      pattern: EMAIL_REGEX,
      customValidator: validateEmail
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setServerError('');
    
    try {
      const { data } = await API.post<ForgotPasswordResponse>('/auth/forgot-password', { 
        email: fields.email.value 
      });
      
      if (data.emailExists) {
        setStatus('email_sent');
      } else {
        setStatus('email_not_found');
      }
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || 
        err?.message || 
        'Ошибка при отправке запроса'
      );
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
              <p>Аккаунт с email <strong>{fields.email.value}</strong> не зарегистрирован.</p>
              <p>Проверьте правильность ввода или зарегистрируйтесь.</p>
            </div>
            <div className="status-actions">
              <button 
                onClick={() => {
                  resetForm();
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
              <p>На адрес <strong>{fields.email.value}</strong> отправлено письмо с инструкциями по восстановлению пароля.</p>
              <p>Проверьте вашу почту и следуйте инструкциям в письме.</p>
            </div>
            <div className="status-actions">
              <Link to="/login" className="btn-primary" aria-label="Вернуться к входу">
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
                value={fields.email.value}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                required
                disabled={isLoading}
                className={fields.email.touched && fields.email.error ? 'invalid' : ''}
                aria-invalid={!!(fields.email.touched && fields.email.error)}
                aria-describedby={fields.email.error ? "email-error" : undefined}
              />
              {fields.email.touched && fields.email.error && (
                <div id="email-error" className="field-error" role="alert">
                  {fields.email.error}
                </div>
              )}
            </div>

            {serverError && (
              <div className="form-error" role="alert">
                {serverError}
              </div>
            )}
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || !isValid}
              aria-disabled={isLoading || !isValid}
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