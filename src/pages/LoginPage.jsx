import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import './AuthPage.css';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import pddBackground from '.././assets/pdd-background.jpg'

export default function LoginPage() {
  const { showNotification } = useNotification();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  
  const [formError, setFormError] = useState({
    message: '',
    canResend: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  useEffect(() => {
    const newErrors = { ...errors };
    
    if (touched.email) {
      newErrors.email = !formData.email 
        ? 'Email обязателен' 
        : !validateEmail(formData.email) 
          ? 'Введите корректный email' 
          : '';
    }
    
    if (touched.password) {
      newErrors.password = !formData.password 
        ? 'Пароль обязателен' 
        : formData.password.length < 6 
          ? 'Пароль должен содержать минимум 6 символов' 
          : '';
    }
    
    setErrors(newErrors);
  }, [formData, touched]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({ email: true, password: true });
    
    const emailError = !formData.email 
      ? 'Email обязателен' 
      : !validateEmail(formData.email) 
        ? 'Введите корректный email' 
        : '';
    
    const passwordError = !formData.password 
      ? 'Пароль обязателен' 
      : formData.password.length < 6 
        ? 'Пароль должен содержать минимум 6 символов' 
        : '';
    
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }
    
    setIsLoading(true);
    setFormError({ message: '', canResend: false });
    
    try {
      const { data } = await API.post('/users/login', {
        email: formData.email.trim(),
        password: formData.password
      });

      if (!data?.token || !data?.user?.id || !data?.user?.email || !data?.user?.role) {
        throw new Error('Неполные данные от сервера');
      }

      login(data.token, data.user);
      
      showNotification({
        message: 'Авторизация прошла успешно!',
        type: 'success'
      });

      const redirectPath = location.state?.from?.pathname || 
                         (data.user.role === 'admin' ? '/admin/dashboard' : '/');
      
      setTimeout(() => {
        navigate(redirectPath, {
          replace: true,
          state: { 
            fromLogin: true,
            userData: data.user 
          }
        });
      }, 1000);

    } catch (err) {
      console.error('Ошибка авторизации:', err);
      
      const serverError = err.response?.data;
      
      if (serverError?.error === 'EMAIL_NOT_VERIFIED') {
        setFormError({
          message: serverError.message || 'Подтвердите email, письмо отправлено',
          canResend: serverError.canResend || false
        });
      } else {
        setFormError({
          message: serverError?.message || 
                  'Неверные учетные данные или ошибка сервера',
          canResend: false
        });
      }
      
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      await API.post('/auth/resend-verification', { email: formData.email });
      showNotification({
        message: 'Письмо отправлено повторно',
        type: 'success'
      });
    } catch (err) {
      setFormError({
        message: 'Ошибка при повторной отправке письма',
        canResend: false
      });
    }
  };

  const fields = [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Введите ваш email',
      value: formData.email,
      onChange: (e) => {
        setFormData({...formData, email: e.target.value});
        setTouched(prev => ({ ...prev, email: true }));
      },
      onBlur: () => handleBlur('email'),
      required: true,
      error: errors.email,
      isValid: !errors.email && touched.email,
      'aria-describedby': 'email-error'
    },
    {
      name: 'password',
      type: 'password',
      label: 'Пароль',
      placeholder: 'Введите ваш пароль',
      value: formData.password,
      onChange: (e) => {
        setFormData({...formData, password: e.target.value});
        setTouched(prev => ({ ...prev, password: true }));
      },
      onBlur: () => handleBlur('password'),
      required: true,
      minLength: 6,
      error: errors.password,
      isValid: !errors.password && touched.password,
      'aria-describedby': 'password-error'
    }
  ];

  return (
    <div className="auth-page-container">
      <div 
        className="auth-background" 
        style={{ backgroundImage: `url(${pddBackground})` }}
        aria-hidden="true"
      ></div>
      
      <div className="auth-form-container">
        <div className="auth-form">
          <h1>Вход в аккаунт</h1>
          <form onSubmit={handleSubmit} aria-label="Форма авторизации">
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
                  onBlur={field.onBlur}
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

            {formError.message && (
              <div className="form-error" role="alert">
                {formError.message}
                {formError.canResend && (
                  <button 
                    type="button"
                    onClick={handleResendEmail}
                    className="resend-button"
                    disabled={isLoading}
                  >
                    Отправить письмо повторно
                  </button>
                )}
              </div>
            )}
            
            <div className="forgot-password-link">
              <Link to="/forgot-password">Забыли пароль?</Link>
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || !formData.email || !formData.password || !!errors.email || !!errors.password}
              aria-disabled={isLoading || !formData.email || !formData.password || !!errors.email || !!errors.password}
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