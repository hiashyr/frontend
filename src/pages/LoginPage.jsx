import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../services/api';
import AuthForm from '../components/Auth/AuthForm';
import './AuthPage.css';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import pddBackground from '.././assets/pdd-background.jpg'
import FloatingLabelInput from '../components/FloatingLabelInput';
import CloseButton from '../components/CloseButton/CloseButton';
import { validateEmail, validatePassword } from '../utils/validation';
import NewNotification from '../components/Notification/NewNotification';

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
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const newErrors = { ...errors };

    if (touched.email) {
      const { isValid, error } = validateEmail(formData.email);
      newErrors.email = error;
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
    setWasSubmitted(true);
    setTouched({ email: true, password: true });

    const { isValid: isEmailValid, error: emailError } = validateEmail(formData.email);
    const passwordError = !formData.password
      ? 'Пароль обязателен'
      : formData.password.length < 6
        ? 'Пароль должен содержать минимум 6 символов'
        : '';

    if (!isEmailValid || passwordError) {
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


      // Save the token and user data
      login(data.token, data.user);

      // Show notification after the second request to /api/users/me
      setIsAuthenticated(true);

      // Redirect to home page with state
      navigate('/', {
        replace: true,
        state: {
          fromLogin: true,
          userData: data.user
        }
      });

    } catch (err) {

      const serverError = err.response?.data || err;

      if (err.response?.status === 403 && serverError?.error === 'EMAIL_NOT_VERIFIED') {
        setFormError({
          message: serverError.message || 'Подтвердите email, письмо отправлено',
          canResend: serverError.canResend || false
        });
      } else {
        setFormError({
          message: serverError?.message ||
                  'Неверные учетные данные для входа',
          canResend: false
        });
      }

      if (err.response?.status !== 403 || serverError?.error !== 'EMAIL_NOT_VERIFIED') {
        setFormData(prev => ({ ...prev, password: '' }));
      }
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
        const newEmail = e.target.value;
        setFormData({...formData, email: newEmail});
      },
      onBlur: () => {
        handleBlur('email');
        const { isValid } = validateEmail(formData.email);
      },
      required: true,
      error: (wasSubmitted || touched.email) ? errors.email : '',
      isValid: touched.email ? validateEmail(formData.email).isValid : formData.email ? validateEmail(formData.email).isValid : false,
      'aria-describedby': 'email-error'
    },
    {
      name: 'password',
      type: 'password',
      label: 'Пароль',
      placeholder: 'Введите ваш пароль',
      value: formData.password,
      onChange: (e) => {
        const newPassword = e.target.value;
        setFormData({...formData, password: newPassword});
      },
      onBlur: () => {
        handleBlur('password');
        const { isValid } = validatePassword(formData.password);
      },
      required: true,
      minLength: 6,
      error: (wasSubmitted || (touched.password && formData.password)) ? errors.password : '',
      isValid: touched.password ? validatePassword(formData.password).isValid : formData.password ? validatePassword(formData.password).isValid : false,
      'aria-describedby': 'password-error'
    }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      setNotification({
        message: 'Авторизация прошла успешно!',
        type: 'success'
      });
    }
  }, [isAuthenticated]);

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
          <h1>Вход в аккаунт</h1>
          <form onSubmit={handleSubmit} aria-label="Форма авторизации">
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

      {notification && (
        <NewNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
