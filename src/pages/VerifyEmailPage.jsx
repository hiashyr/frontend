import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './VerifyEmailPage.css';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'already_verified'
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [email, setEmail] = useState('');

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
  
          const timer = setTimeout(() => {
            navigate('/login', { 
              state: { 
                emailVerified: true,
                email: response.data.email,
                message: response.data.message
              },
              replace: true
            });
          }, 5000);
  
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Verification error:', error);
        
        const serverMessage = error.response?.data?.error;
        const defaultMessage = 'Не удалось подтвердить email';
        
        setStatus('error');
        setMessage(serverMessage || defaultMessage);
      }
    };
  
    verifyEmail();
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <div className="verify-email-container">
        <LoadingSpinner />
        <p>Идёт подтверждение email...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="verify-email-container error">
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
    );
  }

  if (status === 'already_verified') {
    return (
      <div className="verify-email-container info">
        <div className="info-icon">ℹ</div>
        <h2>{message}</h2>
        <p>Вы будете перенаправлены на страницу входа...</p>
      </div>
    );
  }

  return (
    <div className="verify-email-container success">
      <div className="success-icon">✓</div>
      <h2>Email успешно подтверждён!</h2>
      {email && <p>Аккаунт: {email}</p>}
      <p>Перенаправление через {countdown} секунд...</p>
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
  );
}