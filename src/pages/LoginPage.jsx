import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import './AuthPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError('Неверный email или пароль');
    }
  };

  const fields = [
    {
      name: 'email',
      type: 'email',
      placeholder: 'Email',
      value: email,
      onChange: (e) => setEmail(e.target.value),
      required: true
    },
    {
      name: 'password',
      type: 'password',
      placeholder: 'Пароль',
      value: password,
      onChange: (e) => setPassword(e.target.value),
      required: true
    }
  ];

  return (
    <AuthForm
      title="Вход в аккаунт"
      fields={fields}
      submitText="Войти"
      error={error}
      onSubmit={handleSubmit}
      linkDescription="Нет аккаунта?"
      linkText="Зарегистрируйтесь"
      linkPath="/register"
    />
  );
}