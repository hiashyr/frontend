import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import pddBackground from '../assets/pdd-background.jpg';
import './ResendVerificationPage.css';

export default function ResendVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (messageType === 'info' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (messageType === 'info' && countdown === 0) {
      navigate('/login');
    }
  }, [countdown, messageType, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация email
    if (!email) {
      setMessage('Введите email');
      setMessageType('error');
      return;
    }
  
    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Введите корректный email');
      setMessageType('error');
      return;
    }
  
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await API.post('/auth/resend-verification', { email });
      
      if (response.data.success) {
        setMessage('Письмо с подтверждением отправлено на ваш email. Проверьте папку "Спам", если не видите письма.');
        setMessageType('success');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      
      // Обработка разных типов ошибок
      const serverError = error.response?.data;
      
      if (serverError?.error === 'EMAIL_ALREADY_VERIFIED') {
        setMessage('Этот email уже подтверждён. Вы будете перенаправлены на страницу входа...');
        setMessageType('info');
        
        // Запуск таймера для редиректа
        setCountdown(5);
        const timer = setInterval(() => {
          setCountdown(prev => {
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
      else if (serverError?.error === 'USER_NOT_FOUND') {
        setMessage('Пользователь с таким email не найден');
        setMessageType('error');
      }
      else {
        setMessage(
          serverError?.message || 
          error.message || 
          'Ошибка при отправке письма. Попробуйте позже.'
        );
        setMessageType('error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="resend-verification-page">
      <div 
        className="resend-background" 
        style={{ backgroundImage: `url(${pddBackground})` }}
      ></div>
      
      <div className="resend-container">
        <div className="resend-content">
          <h2>Отправить подтверждение повторно</h2>
          
          {message && (
            <div className={`resend-message ${messageType}`}>
              {message}
              {messageType === 'info' && (
                <div className="countdown-message">
                  Перенаправление через {countdown} секунд...
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                required
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner small /> Отправка...
                </>
              ) : 'Отправить письмо'}
            </button>
          </form>

          <button 
            onClick={() => navigate('/login')}
            className="back-button"
            disabled={isLoading}
          >
            Вернуться к входу
          </button>
        </div>
      </div>
    </div>
  );
}