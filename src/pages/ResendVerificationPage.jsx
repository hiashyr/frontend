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
    if (!email) return;
    
    setIsLoading(true);
    setMessage('');
    try {
      const response = await API.post('/auth/resend-verification', { email });
      
      if (response.data.success) {
        setMessage('Письмо с подтверждением отправлено на ваш email');
        setMessageType('success');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      
      if (error.response?.data?.error === 'EMAIL_ALREADY_VERIFIED') {
        setMessage('Этот email уже подтверждён. Вы будете перенаправлены на страницу входа...');
        setMessageType('info');
        setCountdown(5);
      } else {
        setMessage(error.response?.data?.error || 'Ошибка при отправке письма');
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