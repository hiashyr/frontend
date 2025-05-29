import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import API from '../services/api';
import { useForm } from '../hooks/useForm';
import { validateEmail, validatePassword, EMAIL_REGEX } from '../utils/validation';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import pddBackground from '../assets/pdd-background.jpg';
import CloseButton from '../components/CloseButton/CloseButton';
import './AuthPage.css';

export default function LoginPage() {
  const { showNotification } = useNotification();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { fields, handleChange, handleBlur, isValid } = useForm({
    email: {
      name: 'email',
      value: '',
      required: true,
      pattern: EMAIL_REGEX,
      customValidator: validateEmail
    },
    password: {
      name: 'password',
      value: '',
      required: true,
      minLength: 6,
      customValidator: (value) => validatePassword(value)
    }
  });

  const canSubmit = (): boolean => {
    const allFieldsFilled = Object.values(fields).every(field => field.value.trim() !== '');
    const allFieldsTouched = Object.values(fields).every(field => field.touched);
    const noErrors = Object.values(fields).every(field => !field.error);
    const notLoading = !isLoading;
    return allFieldsFilled && allFieldsTouched && noErrors && notLoading;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setServerError('');
    
    try {
      const { data } = await API.post('/users/login', {
        email: fields.email.value,
        password: fields.password.value
      });

      if (!data?.token || !data?.user?.id || !data?.user?.email || !data?.user?.role) {
        throw new Error('Неполные данные от сервера');
      }

      await login(data.token, data.user);
      
      showNotification({
        message: 'Авторизация прошла успешно!',
        type: 'success'
      });

      const redirectPath = location.state?.from?.pathname || 
                         (data.user.role === 'admin' ? '/admin/dashboard' : '/');
      
      navigate(redirectPath, {
        replace: true,
        state: { 
          fromLogin: true,
          userData: data.user 
        }
      });
    } catch (err: any) {
      console.error('Login error:', err);
      setServerError(
        err?.response?.data?.message || 
        err?.message || 
        'Неверный email или пароль'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <CloseButton />
      <div 
        className="auth-background" 
        style={{ backgroundImage: `url(${pddBackground})` }}
        aria-hidden="true"
      ></div>
      
      <div className="auth-form-container">
        <div className="auth-form">
          <h1>Вход в аккаунт</h1>
          <form onSubmit={handleSubmit} aria-label="Форма авторизации">
            {Object.values(fields).map((field) => (
              <div key={field.name} className="form-group">
                <label htmlFor={field.name} className="visually-hidden">
                  {field.name === 'email' ? 'Email' : 'Пароль'}
                </label>
                <input
                  id={field.name}
                  type={field.name === 'password' ? 'password' : 'email'}
                  name={field.name}
                  placeholder={
                    field.name === 'email' ? 'Введите ваш email' : 'Введите ваш пароль'
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
            
            <div className="forgot-password-link">
              <Link to="/forgot-password">Забыли пароль?</Link>
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={!canSubmit()}
              aria-disabled={!canSubmit()}
              title={!canSubmit() ? 'Заполните все поля корректно' : 'Войти в аккаунт'}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          
          <p className="auth-link">
            Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 