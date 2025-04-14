import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import './ResendVerificationPage.css';

export default function ResendVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await API.post('/auth/resend-verification', { email });
      setMessage('Письмо успешно отправлено! Проверьте ваш email.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="resend-verification-container">
      <h2>Отправить письмо подтверждения повторно</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ваш email"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
      <button 
        onClick={() => navigate('/login')}
        className="back-button"
      >
        Вернуться к входу
      </button>
    </div>
  );
}