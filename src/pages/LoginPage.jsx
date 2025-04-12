import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import './AuthPage.css';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
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
    
    // Проверяем, были ли поля touched
    const newTouched = {
      email: true,
      password: true
    };
    setTouched(newTouched);

    // Валидация перед отправкой
    const isValid = validateEmail(formData.email) && formData.password.length >= 6;
    
    if (!isValid) {
      setFieldErrors({
        email: formData.email 
          ? validateEmail(formData.email) 
            ? '' 
            : 'Введите корректный email'
          : 'Email обязателен',
        password: formData.password 
          ? formData.password.length >= 6 
            ? '' 
            : 'Пароль должен содержать минимум 6 символов'
          : 'Пароль обязателен'
      });
      return;
    }

    setIsLoading(true);
    setFormError('');

    try {
      const { data } = await API.post('/users/login', {
        email: formData.email,
        password: formData.password
      });
  
      // Усиленная проверка ответа
      if (!data?.token || !data?.user?.id || !data?.user?.role) {
        throw new Error('Неверный формат ответа сервера');
      }
  
      login(data.token, data.user);
      
      // Двойная проверка роли
      const isAdmin = data.user.role === 'admin';
      console.log('Role after login:', data.user.role); // Логируем роль
      
      navigate(isAdmin ? '/admin/dashboard' : '/', { 
        replace: true,
        state: { forceReload: isAdmin } // Для принудительного обновления
      });
  
    } catch (err) {
      console.error('Ошибка авторизации:', err);
      setFormError(err.response?.data?.message || 'Неверные учетные данные');
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