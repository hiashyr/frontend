import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useForm } from '../hooks/useForm';
import { validateEmail, EMAIL_REGEX } from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';
import pddBackground from '../assets/pdd-background.jpg';
import './ResendVerificationPage.css';

interface LocationState {
  email?: string;
}

export default function ResendVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [countdown, setCountdown] = useState(5);

  const { fields, handleChange, handleBlur, isValid, setFieldValue } = useForm({
    email: {
      name: 'email',
      value: '',
      required: true,
      pattern: EMAIL_REGEX,
      customValidator: validateEmail
    }
  });

  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.email) {
      setFieldValue('email', state.email);
    }
  }, [location.state, setFieldValue]);

  useEffect(() => {
    if (messageType === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (messageType === 'success' && countdown === 0) {
      navigate('/login');
    }
  }, [countdown, messageType, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await API.post('/auth/resend-verification', {
        email: fields.email.value
      });

      setMessage('Письмо с подтверждением отправлено на ваш email');
      setMessageType('success');
    } catch (err: any) {
      console.error('Resend verification error:', err);
      setMessage(
        err?.response?.data?.message || 
        err?.message || 
        'Ошибка при отправке письма'
      );
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="resend-verification-page">
      <div 
        className="resend-background"
        style={{ backgroundImage: `url(${pddBackground})` }}
        aria-hidden="true"
      ></div>
      
      <div className="resend-container">
        <div className="resend-content">
          <h2>Повторная отправка письма</h2>
          <form onSubmit={handleSubmit} aria-label="Форма повторной отправки письма">
            <div className="form-group">
              <label htmlFor="email" className="visually-hidden">
                Email
              </label>
              <input
                id="email"
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

            {message && (
              <div 
                className={`message ${messageType}`} 
                role="alert"
              >
                {message}
                {messageType === 'success' && (
                  <p>Перенаправление на страницу входа через {countdown} секунд...</p>
                )}
              </div>
            )}
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || !isValid}
              aria-disabled={isLoading || !isValid}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Отправка...
                </>
              ) : (
                'Отправить письмо повторно'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 