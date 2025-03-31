import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import './AuthPage.css'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      await API.post('/auth/register', {
        email: formData.email,
        password: formData.password
      });
      navigate('/login?registered=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  const fields = [
    {
      name: 'email',
      type: 'email',
      placeholder: 'Email',
      value: formData.email,
      onChange: handleChange,
      required: true
    },
    {
      name: 'password',
      type: 'password',
      placeholder: 'Пароль (минимум 6 символов)',
      value: formData.password,
      onChange: handleChange,
      required: true,
      minLength: 6
    },
    {
      name: 'confirmPassword',
      type: 'password',
      placeholder: 'Повторите пароль',
      value: formData.confirmPassword,
      onChange: handleChange,
      required: true
    }
  ];

  return (
    <AuthForm
      title="Регистрация"
      fields={fields}
      submitText="Зарегистрироваться"
      error={error}
      onSubmit={handleSubmit}
      linkDescription="Уже есть аккаунт?"
      linkText="Войдите"
      linkPath="/login"
    />
  );
}