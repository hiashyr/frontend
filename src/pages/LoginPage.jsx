import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import './AuthPage.css';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function LoginPage() {
  const { showNotification } = useNotification();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Валидация email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Валидация при изменении полей
  useEffect(() => {
    if (touched.email) {
      setFieldErrors(prev => ({
        ...prev,
        email: formData.email 
          ? validateEmail(formData.email) 
            ? '' 
            : 'Введите корректный email'
          : 'Email обязателен'
      }));
    }

    if (touched.password) {
      setFieldErrors(prev => ({
        ...prev,
        password: formData.password 
          ? formData.password.length >= 6 
            ? '' 
            : 'Пароль должен содержать минимум 6 символов'
          : 'Пароль обязателен'
      }));
    }
  }, [formData, touched]);

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Помечаем поля как touched
    setTouched({
      email: true,
      password: true
    });
  
    // Валидация полей
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
      setFieldErrors({
        email: emailError,
        password: passwordError
      });
      return;
    }
  
    setIsLoading(true);
    setFormError('');
    setFieldErrors({ email: '', password: '' });
  
    try {
      const { data } = await API.post('/users/login', {
        email: formData.email.trim(), // Удаляем пробелы
        password: formData.password
      });
  
      // Расширенная проверка ответа сервера
      if (!data?.token || !data?.user) {
        throw new Error('Неполные данные от сервера');
      }
  
      const requiredUserFields = ['id', 'email', 'role'];
      const missingFields = requiredUserFields.filter(field => !data.user[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Отсутствуют обязательные поля: ${missingFields.join(', ')}`);
      }
  
      // Сохраняем данные авторизации
      login(data.token, data.user);

      // Показываем уведомление
      showNotification({
        message: 'Авторизация прошла успешно!',
        type: 'success'
      });
      
      // Логирование для отладки
      console.log('Успешная авторизация:', {
        user: data.user.email,
        role: data.user.role,
        time: new Date().toISOString()
      });

      // Перенаправление с задержкой, чтобы пользователь увидел уведомление
        setTimeout(() => {
          navigate(redirectPath, {
            replace: true,
            state: { 
              fromLogin: true,
              userData: data.user 
            }
          });
        }, 1000);
  
      // Перенаправление с учетом роли
      const redirectPath = data.user.role === 'admin' 
        ? '/admin/dashboard' 
        : '/';
      
      navigate(redirectPath, {
        replace: true,
        state: { 
          fromLogin: true,
          userData: data.user 
        }
      });
  
    } catch (err) {
      console.error('Ошибка авторизации:', {
        error: err,
        time: new Date().toISOString(),
        email: formData.email
      });
  
      // Расширенная обработка ошибок
      const serverError = err.response?.data;
      
      if (serverError?.error === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email', {
          state: { 
            email: formData.email,
            canResend: true
          }
        });
      } else if (serverError?.field) {
        setFieldErrors({
          [serverError.field]: serverError.message || 'Ошибка при вводе'
        });
      } else {
        setFormError(
          serverError?.message || 
          err.message || 
          'Ошибка при авторизации. Попробуйте позже'
        );
      }
  
      // Сброс пароля в форме
      setFormData(prev => ({ ...prev, password: '' }));
  
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      name: 'email',
      type: 'email',
      placeholder: 'Email',
      value: formData.email,
      onChange: (e) => {
        setFormData({...formData, email: e.target.value});
        setTouched(prev => ({ ...prev, email: true }));
      },
      onBlur: () => handleBlur('email'),
      required: true,
      error: fieldErrors.email,
      isValid: touched.email && !fieldErrors.email
    },
    {
      name: 'password',
      type: 'password',
      placeholder: 'Пароль',
      value: formData.password,
      onChange: (e) => {
        setFormData({...formData, password: e.target.value});
        setTouched(prev => ({ ...prev, password: true }));
      },
      onBlur: () => handleBlur('password'),
      required: true,
      minLength: 6,
      error: fieldErrors.password,
      isValid: touched.password && !fieldErrors.password
    }
  ];

  return (
    <AuthForm
      title="Вход в аккаунт"
      fields={fields}
      submitText={isLoading ? 'Вход...' : 'Войти'}
      error={formError}
      onSubmit={handleSubmit}
      linkDescription="Нет аккаунта?"
      linkText="Зарегистрируйтесь"
      linkPath="/register"
      isLoading={isLoading}
      showForgotPassword={true}
    />
  );
}