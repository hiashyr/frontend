import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import './AuthPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await API.get('/users/me');
        navigate('/');
      } catch {
        localStorage.removeItem('token');
      }
    };
    
    if (localStorage.getItem('token')) {
      verifyToken();
    }
  }, [navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'password':
        return value.length >= 6;
      default:
        return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!validateField('email', formData.email)) {
      setError('Введите корректный email');
      return false;
    }
    if (!validateField('password', formData.password)) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    return true;
  };

  const fields = [
    {
      name: 'email',
      type: 'email',
      placeholder: 'Email',
      value: formData.email,
      onChange: handleChange,
      required: true,
      isValid: validateField('email', formData.email),
      error: formData.email && !validateField('email', formData.email)
        ? 'Некорректный email'
        : null
    },
    {
      name: 'password',
      type: 'password',
      placeholder: 'Пароль',
      value: formData.password,
      onChange: handleChange,
      required: true,
      minLength: 6,
      isValid: validateField('password', formData.password),
      error: formData.password && !validateField('password', formData.password)
        ? 'Пароль слишком короткий'
        : null
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data } = await API.post('/users/login', {
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('token', data.token);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        'Неверный email или пароль'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Вход в аккаунт"
      fields={fields}
      submitText={isLoading ? 'Вход...' : 'Войти'}
      error={error}
      onSubmit={handleSubmit}
      linkDescription="Нет аккаунта?"
      linkText="Зарегистрируйтесь"
      linkPath="/register"
      isLoading={isLoading}
    />
  );
}