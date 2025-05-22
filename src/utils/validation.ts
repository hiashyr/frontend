export interface ValidationResult {
  isValid: boolean;
  error: string;
}

export interface FieldValidation {
  value: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string) => ValidationResult;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_REGEX = /^.{6,}$/;

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email обязателен' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Введите корректный email' };
  }
  return { isValid: true, error: '' };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Пароль обязателен' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Пароль должен содержать минимум 6 символов' };
  }
  return { isValid: true, error: '' };
};

export const validatePasswordConfirm = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Подтверждение пароля обязательно' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Пароли не совпадают' };
  }
  return { isValid: true, error: '' };
};

export const validateField = ({ 
  value, 
  required = false, 
  minLength, 
  maxLength,
  pattern,
  customValidator 
}: FieldValidation): ValidationResult => {
  if (required && !value) {
    return { isValid: false, error: 'Поле обязательно для заполнения' };
  }

  if (value) {
    if (minLength && value.length < minLength) {
      return { 
        isValid: false, 
        error: `Минимальная длина поля - ${minLength} символов` 
      };
    }

    if (maxLength && value.length > maxLength) {
      return { 
        isValid: false, 
        error: `Максимальная длина поля - ${maxLength} символов` 
      };
    }

    if (pattern && !pattern.test(value)) {
      return { 
        isValid: false, 
        error: 'Значение не соответствует требуемому формату' 
      };
    }
  }

  if (customValidator) {
    return customValidator(value);
  }

  return { isValid: true, error: '' };
}; 