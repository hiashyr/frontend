import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import pddBackground from '../assets/pdd-background.jpg';
import './AuthPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [countdown, setCountdown] = useState(5);

  // Валидация полей
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'password':
        return value.length >= 6;
      case 'confirmPassword':
        return value === formData.password;
      default:
        return false;
    }
  };

  // Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Валидация всей формы
  const validateForm = () => {
    if (!validateField('email', formData.email)) {
      setError('Введите корректный email');
      return false;
    }
    if (!validateField('password', formData.password)) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    if (!validateField('confirmPassword', formData.confirmPassword)) {
      setError('Пароли не совпадают');
      return false;
    }
    return true;
  };

  // Поля формы с улучшенной доступностью
  const fields = [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Введите ваш email',
      value: formData.email,
      onChange: handleChange,
      required: true,
      isValid: validateField('email', formData.email),
      error: formData.email && !validateField('email', formData.email) 
        ? 'Некорректный email' 
        : null,
      'aria-describedby': 'email-error'
    },
    {
      name: 'password',
      type: 'password',
      label: 'Пароль',
      placeholder: 'Придумайте пароль (минимум 6 символов)',
      value: formData.password,
      onChange: handleChange,
      required: true,
      minLength: 6,
      isValid: validateField('password', formData.password),
      error: formData.password && !validateField('password', formData.password)
        ? 'Слишком короткий пароль'
        : null,
      'aria-describedby': 'password-error'
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Подтверждение пароля',
      placeholder: 'Повторите пароль',
      value: formData.confirmPassword,
      onChange: handleChange,
      required: true,
      isValid: formData.confirmPassword && 
               validateField('confirmPassword', formData.confirmPassword),
      error: formData.confirmPassword && 
             !validateField('confirmPassword', formData.confirmPassword)
        ? 'Пароли не совпадают'
        : null,
      'aria-describedby': 'confirmPassword-error'
    }
  ];

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsLoading(true);
    try {
      const response = await API.post('/users/register', {
        email: formData.email,
        password: formData.password
      });
      
      if (response.status === 201) {
        setRegistrationSuccess(true);
        setRegisteredEmail(formData.email);
        startCountdown();
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err?.message || 
               err?.error === 'EMAIL_EXISTS' 
                 ? 'Этот email уже зарегистрирован' 
                 : 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  // Запуск обратного отсчета
  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login', { 
            state: { fromRegistration: true },
            replace: true
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  // Страница успешной регистрации
  if (registrationSuccess) {
    return (
      <div className="auth-page-container">
        <div 
          className="auth-background" 
          style={{ backgroundImage: `url(${pddBackground})` }}
          aria-hidden="true"
        ></div>
        
        <div className="auth-form-container">
          <div className="auth-form">
            <h1>Регистрация успешно завершена!</h1>
            <div className="success-message" role="status">
              <div className="success-icon" aria-hidden="true">✓</div>
              <div className="success-content">
                <p>На адрес <strong>{registeredEmail}</strong> было отправлено письмо с подтверждением.</p>
                <p>Пожалуйста, проверьте вашу почту и следуйте инструкциям в письме.</p>
                <p aria-live="assertive">Перенаправление на страницу входа через {countdown} секунд...</p>
              </div>
              <Link 
                to="/login" 
                className="back-to-login"
                state={{ fromRegistration: true }}
              >
                Перейти к входу сейчас
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Основная форма регистрации
  return (
    <div className="auth-page-container">
      <div 
        className="auth-background" 
        style={{ backgroundImage: `url(${pddBackground})` }}
        aria-hidden="true"
      ></div>
      
      <div className="auth-form-container">
        <div className="auth-form">
          <h1>Регистрация</h1>
          <form onSubmit={handleSubmit} aria-label="Форма регистрации">
            {fields.map((field) => (
              <div key={field.name} className="form-group">
                <label htmlFor={field.name} className="visually-hidden">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                  required={field.required}
                  minLength={field.minLength}
                  disabled={isLoading}
                  className={field.error ? 'invalid' : ''}
                  aria-invalid={!!field.error}
                  aria-describedby={field.error ? `${field.name}-error` : undefined}
                />
                {field.error && (
                  <div id={`${field.name}-error`} className="field-error" role="alert">
                    {field.error}
                  </div>
                )}
              </div>
            ))}

            {error && <div className="form-error" role="alert">{error}</div>}
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
              aria-disabled={isLoading}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          
          <p className="auth-link">
            Уже есть аккаунт? <Link to="/login">Войдите</Link>
          </p>
        </div>
      </div>
    </div>
  );
}