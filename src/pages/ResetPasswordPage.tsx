import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { useForm } from '../hooks/useForm';
import { validatePassword, validatePasswordConfirm } from '../utils/validation';
import { useNotification } from '../contexts/NotificationContext';
import pddBackground from '../assets/pdd-background.jpg';
import './AuthPage.css';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // Получаем токен из URL при монтировании компонента
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const resetToken = searchParams.get('token');
    
    if (!resetToken) {
      showNotification({
        message: 'Отсутствует токен сброса пароля',
        type: 'error'
      });
      navigate('/login', { replace: true });
      return;
    }

    // Извлекаем только токен из URL, если он был передан как полный URL
    const tokenOnly = resetToken.includes('token=')
      ? new URLSearchParams(resetToken.split('?')[1]).get('token')
      : resetToken;

    if (!tokenOnly) {
      showNotification({
        message: 'Некорректный формат токена',
        type: 'error'
      });
      navigate('/login', { replace: true });
      return;
    }

    setToken(tokenOnly);
  }, [location, navigate, showNotification]);

  const { fields, handleChange, handleBlur, isValid } = useForm({
    password: {
      name: 'password',
      value: '',
      required: true,
      minLength: 6,
      customValidator: validatePassword
    },
    confirmPassword: {
      name: 'confirmPassword',
      value: '',
      required: true,
      customValidator: (value) => validatePasswordConfirm(fields.password.value, value)
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !token) {
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      const response = await API.post('/auth/reset-password', {
        token,
        newPassword: fields.password.value
      });

      if (response.data?.success) {
        showNotification({
          message: 'Пароль успешно изменен!',
          type: 'success'
        });

        navigate('/login', { 
          replace: true,
          state: { fromPasswordReset: true }
        });
      } else {
        throw new Error('Не удалось сбросить пароль');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      const errorMessage = err?.response?.data?.message || 
                         err?.response?.data?.error || 
                         err?.message || 
                         'Ошибка при сбросе пароля';
      
      setServerError(errorMessage);
      
      if (err?.response?.data?.error === 'TOKEN_EXPIRED') {
        showNotification({
          message: 'Срок действия ссылки истек. Запросите новую.',
          type: 'error'
        });
        navigate('/forgot-password', { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null; // или можно показать спиннер загрузки
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
          <h2>Смена пароля</h2>
          <form onSubmit={handleSubmit} aria-label="Форма смены пароля">
            {Object.values(fields).map((field) => (
              <div key={field.name} className="form-group">
                <label htmlFor={field.name} className="visually-hidden">
                  {field.name === 'password' ? 'Новый пароль' : 'Подтверждение пароля'}
                </label>
                <input
                  id={field.name}
                  type="password"
                  name={field.name}
                  placeholder={
                    field.name === 'password' 
                      ? 'Новый пароль (минимум 6 символов)' 
                      : 'Подтвердите пароль'
                  }
                  value={field.value}
                  onChange={handleChange}
                  onBlur={() => handleBlur(field.name)}
                  required
                  minLength={field.name === 'password' ? 6 : undefined}
                  disabled={isLoading}
                  className={field.touched && field.error ? 'invalid' : ''}
                  aria-invalid={!!(field.touched && field.error)}
                  aria-describedby={field.error ? `${field.name}-error` : undefined}
                />
                {field.touched && field.error && (
                  <div id={`${field.name}-error`} className="field-error" role="alert">
                    {field.error}
                  </div>
                )}
              </div>
            ))}

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
              {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 