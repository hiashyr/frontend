import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import pddBackground from '../assets/pdd-background.jpg';
import './AuthPage.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState('checking'); // 'checking', 'valid', 'used', 'expired', 'invalid'
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Проверка токена при загрузке страницы
  useEffect(() => {
    const checkToken = async () => {
      if (!searchParams.get('token')) {
        setTokenStatus('invalid');
        setIsPageLoading(false);
        return;
      }

      try {
        const response = await API.post('/auth/check-token', { 
          token: searchParams.get('token') 
        });

        if (response.status === 'used') {
          setTokenStatus('used');
        } else if (response.status === 'expired') {
          setTokenStatus('expired');
        } else if (response.status === 'invalid') {
          setTokenStatus('invalid');
        } else {
          setTokenStatus('valid');
        }
      } catch (err) {
        setTokenStatus('invalid');
        setError('Ошибка при проверке токена');
      } finally {
        setIsPageLoading(false);
      }
    };

    checkToken();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);
    try {
      await API.post('/auth/reset-password', { 
        token: searchParams.get('token'), 
        newPassword 
      });
      
      showNotification({
        message: 'Пароль успешно изменён!',
        type: 'success'
      });
      navigate('/login', { replace: true });
    } catch (error) {
      if (error.error === 'TOKEN_ALREADY_USED') {
        setTokenStatus('used');
      } else if (error.error === 'TOKEN_EXPIRED') {
        setTokenStatus('expired');
      } else {
        setError(error.message || 'Ошибка при сбросе пароля');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="auth-page-container">
        <div className="loading-container">
          <p>Проверка ссылки...</p>
        </div>
      </div>
    );
  }

  if (tokenStatus === 'used') {
    return (
      <div className="auth-page-container">
        <div 
          className="auth-background" 
          style={{ backgroundImage: `url(${pddBackground})` }}
        ></div>
        
        <div className="auth-form-container">
          <div className="token-status-card">
            <h2>Ссылка уже использована</h2>
            <div className="token-status-message">
              <p>Вы уже использовали эту ссылку для смены пароля.</p>
              <p>Если вам нужно снова изменить пароль, запросите новую ссылку.</p>
            </div>
            <div className="token-status-actions">
              <Link to="/forgot-password" className="btn-primary">
                Запросить новую ссылку
              </Link>
              <Link to="/login" className="btn-secondary">
                Войти в аккаунт
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tokenStatus === 'expired') {
    return (
      <div className="auth-page-container">
        <div 
          className="auth-background" 
          style={{ backgroundImage: `url(${pddBackground})` }}
        ></div>
        
        <div className="auth-form-container">
          <div className="token-status-card">
            <h2>Срок действия ссылки истёк</h2>
            <div className="token-status-message">
              <p>Ссылка для сброса пароля действительна только 1 час.</p>
              <p>Пожалуйста, запросите новую ссылку.</p>
            </div>
            <div className="token-status-actions">
              <Link to="/forgot-password" className="btn-primary">
                Запросить новую ссылку
              </Link>
              <Link to="/login" className="btn-secondary">
                Войти в аккаунт
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tokenStatus === 'invalid') {
    return (
      <div className="auth-page-container">
        <div 
          className="auth-background" 
          style={{ backgroundImage: `url(${pddBackground})` }}
        ></div>
        
        <div className="auth-form-container">
          <div className="token-status-card">
            <h2>Недействительная ссылка</h2>
            <div className="token-status-message">
              <p>Эта ссылка для сброса пароля недействительна.</p>
              <p>Пожалуйста, запросите новую ссылку.</p>
            </div>
            <div className="token-status-actions">
              <Link to="/forgot-password" className="btn-primary">
                Запросить новую ссылку
              </Link>
              <Link to="/login" className="btn-secondary">
                Войти в аккаунт
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
      ></div>
      
      <div className="auth-form-container">
        <div className="auth-form">
          <h2>Смена пароля</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="password"
                name="newPassword"
                placeholder="Новый пароль (минимум 6 символов)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                className={newPassword && newPassword.length < 6 ? 'invalid' : ''}
              />
              {newPassword && newPassword.length < 6 && (
                <div className="field-error">Слишком короткий пароль</div>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Подтвердите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className={confirmPassword && newPassword !== confirmPassword ? 'invalid' : ''}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <div className="field-error">Пароли не совпадают</div>
              )}
            </div>

            {error && <div className="form-error">{error}</div>}
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || 
                !newPassword || 
                !confirmPassword || 
                newPassword.length < 6 || 
                newPassword !== confirmPassword}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить пароль'}
            </button>
          </form>
          
          <p className="auth-link">
            Вспомнили пароль? <Link to="/login">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;