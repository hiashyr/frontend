import { useState } from 'react';
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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Важно: предотвращаем перезагрузку
    
    // Валидация
    if (!formData.email.includes('@')) {
      setError('Введите корректный email');
      return;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data } = await API.post('/users/login', {
        email: formData.email,
        password: formData.password
      });

      if (!data?.token || !data?.user) {
        throw new Error('Ошибка сервера: неверный формат ответа');
      }

      // Сохраняем данные и делаем редирект
      login(data.token, data.user);
      
      // Для администратора
      if (data.user.role === 'admin') {
        window.location.href = '/admin/dashboard'; // Жёсткий редирект
        return;
      }
      
      // Для обычных пользователей
      navigate('/', { replace: true });

    } catch (err) {
      console.error('Ошибка авторизации:', err);
      setError(err.response?.data?.message || 'Неверные учетные данные');
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
      onChange: (e) => setFormData({...formData, email: e.target.value}),
      required: true
    },
    {
      name: 'password',
      type: 'password',
      placeholder: 'Пароль',
      value: formData.password,
      onChange: (e) => setFormData({...formData, password: e.target.value}),
      required: true,
      minLength: 6
    }
  ];

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
      showForgotPassword={true}
    />
  );
}