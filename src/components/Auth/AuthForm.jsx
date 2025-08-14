import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import pddBackground from '../../assets/pdd-background.jpg';
import '../../pages/AuthPage.css';
import FloatingLabelInput from '../FloatingLabelInput';

export default function AuthForm({
  title,
  fields,
  submitText,
  error,
  onSubmit,
  linkText,
  linkPath,
  linkDescription,
  isLoading = false,
  showForgotPassword = false
}) {
  return (
    <div className="auth-page-container">
      <div
        className="auth-background"
        style={{ backgroundImage: `url(${pddBackground})` }}
      ></div>
      
      <div className="auth-form-container">
        <div className="auth-form">
          <h1>{title}</h1>
          <form onSubmit={onSubmit}>
            {fields.map((field) => (
              <div key={field.name} className="form-group">
                <FloatingLabelInput
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  label={field.label || field.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                  required={field.required}
                  minLength={field.minLength}
                  disabled={isLoading}
                  className={field.error ? 'invalid' : (field.isValid ? 'valid' : '')}
                  placeholder=" "
                />
                {field.value && (
                  <span className="validation-icon">
                    {field.isValid ? (
                      <FaCheck className="valid-icon" />
                    ) : (
                      <FaTimes className="invalid-icon" />
                    )}
                  </span>
                )}
                {field.error && (
                  <div className="field-error">
                    {field.error}
                  </div>
                )}
              </div>
            ))}

            {showForgotPassword && (
              <div className="forgot-password-link">
                <Link to="/forgot-password">Забыли пароль?</Link>
              </div>
            )}

            {error && <div className="form-error">{error}</div>}

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || fields.some(f => f.required && (!f.value || (f.isValid !== undefined && !f.isValid)))}
            >
              {isLoading ? 'Загрузка...' : submitText}
            </button>
          </form>

          <p className="auth-link">
            {linkDescription} <Link to={linkPath}>{linkText}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
