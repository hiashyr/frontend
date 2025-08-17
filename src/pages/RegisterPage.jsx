import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import pddBackground from '../assets/pdd-background.jpg';
import './AuthPage.css';
import FloatingLabelInput from '../components/FloatingLabelInput';
import CloseButton from '../components/CloseButton/CloseButton';
import { validateEmail, validatePassword, validatePasswordConfirm } from '../utils/validation';

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
  const [countdown, setCountdown] = useState(10);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false
  });

  // Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Обработчик потери фокуса
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Валидация всей формы
  const validateForm = () => {
    const { isValid: isEmailValid, error: emailError } = validateEmail(formData.email);
    const { isValid: isPasswordValid, error: passwordError } = validatePassword(formData.password);
    const { isValid: isConfirmPasswordValid, error: confirmPasswordError } = validatePasswordConfirm(formData.password, formData.confirmPassword);

    if (!isEmailValid) {
      setError(emailError);
      return false;
    }
    if (!isPasswordValid) {
      setError(passwordError);
      return false;
    }
    if (!isConfirmPasswordValid) {
      setError(confirmPasswordError);
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
      onChange: (e) => {
        const newEmail = e.target.value;
        setFormData(prev => ({ ...prev, email: newEmail }));
      },
      onBlur: () => {
        handleBlur('email');
        const { isValid } = validateEmail(formData.email);
      },
      required: true,
      isValid: touched.email ? validateEmail(formData.email).isValid : formData.email ? validateEmail(formData.email).isValid : false,
      error: touched.email && !validateEmail(formData.email).isValid
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
      onChange: (e) => {
        const newPassword = e.target.value;
        setFormData(prev => ({ ...prev, password: newPassword }));
      },
      onBlur: () => {
        handleBlur('password');
        const { isValid } = validatePassword(formData.password);
      },
      required: true,
      minLength: 6,
      isValid: touched.password ? validatePassword(formData.password).isValid : formData.password ? validatePassword(formData.password).isValid : false,
      error: touched.password && !validatePassword(formData.password).isValid
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
      onChange: (e) => {
        const newConfirmPassword = e.target.value;
        setFormData(prev => ({ ...prev, confirmPassword: newConfirmPassword }));
      },
      onBlur: () => {
        handleBlur('confirmPassword');
        const { isValid } = validatePasswordConfirm(formData.password, formData.confirmPassword);
      },
      required: true,
      isValid: touched.confirmPassword ? validatePasswordConfirm(formData.password, formData.confirmPassword).isValid : formData.confirmPassword ? validatePasswordConfirm(formData.password, formData.confirmPassword).isValid : false,
      error: touched.confirmPassword && !validatePasswordConfirm(formData.password, formData.confirmPassword).isValid
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
      <div className="verify-email-page">
        <div className="verify-email-container">
          <div className="success-icon">✓</div>
          <h2>Регистрация успешно завершена!</h2>
          <p>На адрес <strong>{registeredEmail}</strong> было отправлено письмо с подтверждением.</p>
          <p>Пожалуйста, проверьте вашу почту и следуйте инструкциям в письме.</p>
          <p>Перенаправление через <span className="countdown">{countdown}</span> секунд</p>
          <button
            onClick={() => navigate('/login', {
              state: { fromRegistration: true },
              replace: true
            })}
            className="primary-button"
          >
            Перейти сейчас
          </button>
        </div>
      </div>
    );
  }

  // Основная форма регистрации
  return (
    <div className="auth-page-container">
      <CloseButton />
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
                <FloatingLabelInput
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  label={field.label}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  required={field.required}
                  minLength={field.minLength}
                  disabled={isLoading}
                  className={field.error ? 'invalid' : ''}
                  aria-invalid={!!field.error}
                  aria-describedby={field.error ? `${field.name}-error` : undefined}
                  placeholder=" "
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
              disabled={
                isLoading ||
                !formData.email ||
                !formData.password ||
                !formData.confirmPassword ||
                fields.some(f => f.required && (!f.value || (f.isValid !== undefined && !f.isValid)))
              }
              aria-disabled={
                isLoading ||
                !formData.email ||
                !formData.password ||
                !formData.confirmPassword ||
                fields.some(f => f.required && (!f.value || (f.isValid !== undefined && !f.isValid)))
              }
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
