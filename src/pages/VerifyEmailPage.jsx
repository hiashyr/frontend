import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './VerifyEmailPage.css';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await API.get(`/auth/verify-email/${token}`);
        setStatus('success');
        
        // Перенаправляем на страницу входа через 3 секунды
        setTimeout(() => navigate('/login', { 
          state: { emailVerified: true } 
        }), 3000);
      } catch (error) {
        setStatus('error');
        setErrorMessage(
          error.response?.data?.error || 
          'Не удалось подтвердить email. Пожалуйста, запросите новое письмо.'
        );
      }
    };

    if (token) verifyEmail();
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
        <p>{errorMessage}</p>
        <button 
          onClick={() => navigate('/resend-verification')}
          className="resend-button"
        >
          Отправить письмо повторно
        </button>
      </div>
    );
  }

  return (
    <div className="verify-email-container success">
      <div className="success-icon">✓</div>
      <h2>Email успешно подтверждён!</h2>
      <p>Вы будете перенаправлены на страницу входа...</p>
    </div>
  );
}