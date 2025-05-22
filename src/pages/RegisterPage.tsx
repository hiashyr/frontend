import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import API from '../services/api';
import { useForm } from '../hooks/useForm';
import { validateEmail, validatePassword, validatePasswordConfirm, EMAIL_REGEX, PASSWORD_REGEX } from '../utils/validation';
import pddBackground from '../assets/pdd-background.jpg';
import './AuthPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [countdown, setCountdown] = useState(5);
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
      pattern: PASSWORD_REGEX,
      customValidator: validatePassword
    },
    confirmPassword: {
      name: 'confirmPassword',
      value: '',
      required: true,
      customValidator: (value) => validatePasswordConfirm(fields.password.value, value)
    }
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fields.email.value || fields.email.error) {
      return;
    }

    setIsLoading(true);
    setServerError('');
    
    try {
      const checkEmailResponse = await API.post('/users/check-email', {
        email: fields.email.value
      });

      if (checkEmailResponse.data?.exists) {
        setServerError('Email уже используется');
        setIsLoading(false);
        return;
      }

      if (!isValid) {
        setIsLoading(false);
        return;
      }

      const response = await API.post('/users/register', {
        email: fields.email.value,
        password: fields.password.value
      });
      
      if (response.status === 201) {
        setRegistrationSuccess(true);
        setRegisteredEmail(fields.email.value);
        startCountdown();
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err?.response?.data?.error === 'VALIDATION_ERROR' && err?.response?.data?.errors) {
        // Обработка ошибок валидации
        const validationErrors = err.response.data.errors;
        
        // Обновляем состояние полей с ошибками
        if (validationErrors.email) {
          fields.email.error = validationErrors.email[0];
        }
        if (validationErrors.password) {
          fields.password.error = validationErrors.password[0];
        }
        // Принудительно обновляем состояние для перерисовки
        handleBlur('email');
        handleBlur('password');
      } else {
        setServerError(
          err?.response?.data?.message || 
          err?.message || 
          'Произошла ошибка при регистрации'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Добавляем функцию для проверки возможности отправки формы
  const canSubmit = (): boolean => {
    // Проверяем, что все поля заполнены
    const allFieldsFilled = Object.values(fields).every(field => field.value.trim() !== '');
    
    // Проверяем, что все поля были тронуты
    const allFieldsTouched = Object.values(fields).every(field => field.touched);
    
    // Проверяем отсутствие ошибок
    const noErrors = Object.values(fields).every(field => !field.error);
    
    // Проверяем, что не идет загрузка
    const notLoading = !isLoading;
    
    return allFieldsFilled && allFieldsTouched && noErrors && notLoading;
  };

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
            <div className="form-group">
              <label htmlFor="email" className="visually-hidden">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Введите ваш email"
                value={fields.email.value}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                required
                disabled={isLoading}
                className={fields.email.touched && fields.email.error ? 'invalid' : ''}
                aria-invalid={!!(fields.email.touched && fields.email.error)}
                aria-describedby={fields.email.error ? "email-error" : undefined}
              />
              {fields.email.touched && fields.email.error && (
                <div id="email-error" className="field-error" role="alert">
                  {fields.email.error}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="visually-hidden">Пароль</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Придумайте пароль (минимум 6 символов)"
                value={fields.password.value}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                required
                disabled={isLoading}
                className={fields.password.touched && fields.password.error ? 'invalid' : ''}
                aria-invalid={!!(fields.password.touched && fields.password.error)}
                aria-describedby={fields.password.error ? "password-error" : undefined}
              />
              {fields.password.touched && fields.password.error && (
                <div id="password-error" className="field-error" role="alert">
                  {fields.password.error}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="visually-hidden">Подтверждение пароля</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Повторите пароль"
                value={fields.confirmPassword.value}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                required
                disabled={isLoading}
                className={fields.confirmPassword.touched && fields.confirmPassword.error ? 'invalid' : ''}
                aria-invalid={!!(fields.confirmPassword.touched && fields.confirmPassword.error)}
                aria-describedby={fields.confirmPassword.error ? "confirmPassword-error" : undefined}
              />
              {fields.confirmPassword.touched && fields.confirmPassword.error && (
                <div id="confirmPassword-error" className="field-error" role="alert">
                  {fields.confirmPassword.error}
                </div>
              )}
            </div>

            {serverError && (
              <div className="form-error" role="alert">
                {serverError}
              </div>
            )}
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={!canSubmit()}
              aria-disabled={!canSubmit()}
              title={!canSubmit() ? 'Заполните все поля корректно' : 'Отправить форму'}
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