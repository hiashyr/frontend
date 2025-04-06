import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !validateField('email', formData.email)) {
      setError('Введите корректный email');
      return false;
    }
    if (!formData.password || !validateField('password', formData.password)) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
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
      placeholder: 'Пароль (минимум 6 символов)',
      value: formData.password,
      onChange: handleChange,
      required: true,
      minLength: 6,
      isValid: validateField('password', formData.password),
      error: formData.password && !validateField('password', formData.password)
        ? 'Слишком короткий пароль'
        : null
    },
    {
      name: 'confirmPassword',
      type: 'password',
      placeholder: 'Подтвердите пароль',
      value: formData.confirmPassword,
      onChange: handleChange,
      required: true,
      isValid: formData.confirmPassword && 
               validateField('confirmPassword', formData.confirmPassword),
      error: formData.confirmPassword && 
             !validateField('confirmPassword', formData.confirmPassword)
        ? 'Пароли не совпадают'
        : null
    }
  ];

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
        navigate('/login', { 
          state: { fromRegistration: true },
          replace: true
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Обработка ошибки существующего email
      if (err.response?.data?.error === 'REGISTRATION_ERROR') {
        setError(err.response.data.message);
        
        // Подсвечиваем конкретное поле с ошибкой
        setFormData(prev => ({
          ...prev,
          emailError: err.response.data.field === 'email' 
            ? err.response.data.message 
            : null
        }));
      } else {
        setError(err.response?.data?.message || 'Ошибка регистрации');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Регистрация"
      fields={fields}
      submitText={isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      error={error}
      onSubmit={handleSubmit}
      linkDescription="Уже есть аккаунт?"
      linkText="Войдите"
      linkPath="/login"
      isLoading={isLoading}
    />
  );
}