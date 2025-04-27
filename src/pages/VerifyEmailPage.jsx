import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './VerifyEmailPage.css';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [email, setEmail] = useState('');

  // Таймер обратного отсчета
  useEffect(() => {
    if (status === 'success' || status === 'already_verified') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login', { 
              state: { emailVerified: true, email },
              replace: true
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, email, navigate]);

  // Логика подтверждения email (остается без изменений)
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Ссылка подтверждения не содержит токена');
      return;
    }
  
    const verifyEmail = async () => {
      try {
        const response = await API.post('/auth/verify-email', { token });
        
        if (response.data.success) {
          setStatus(response.data.alreadyVerified ? 'already_verified' : 'success');
          setMessage(response.data.message);
          setEmail(response.data.email || '');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Не удалось подтвердить email');
      }
    };
  
    verifyEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="verify-email-page">
        <div className="verify-email-container">
          <LoadingSpinner />
          <p>Идёт подтверждение email...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="verify-email-page">
        <div className="verify-email-container">
          <div className="error-icon">✕</div>
          <h2>Ошибка подтверждения</h2>
          <p>{message}</p>
          <div className="button-group">
            <button 
              onClick={() => navigate('/resend-verification')}
              className="resend-button"
            >
              Отправить письмо повторно
            </button>
            <button 
              onClick={() => navigate('/login', { replace: true })}
              className="secondary-button"
            >
              Перейти на страницу входа
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'already_verified') {
    return (
      <div className="verify-email-page">
        <div className="verify-email-container">
          <div className="info-icon">ℹ</div>
          <h2>{message}</h2>
          <p>Вы будете перенаправлены на страницу входа через <span className="countdown">{countdown}</span> секунд</p>
          <button 
            onClick={() => navigate('/login', { 
              state: { emailVerified: true, email },
              replace: true
            })}
            className="primary-button"
          >
            Перейти сейчас
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        <div className="success-icon">✓</div>
        <h2>Email успешно подтверждён!</h2>
        {email && (
          <>
            <p>Ваш аккаунт:</p>
            <div className="email-account">{email}</div>
          </>
        )}
        <p>Перенаправление через <span className="countdown">{countdown}</span> секунд</p>
        <button 
          onClick={() => navigate('/login', { 
            state: { emailVerified: true, email },
            replace: true
          })}
          className="primary-button"
        >
          Перейти сейчас
        </button>
      </div>
    </div>
  );
}