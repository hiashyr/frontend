import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import pddBackground from '../../assets/pdd-background.jpg';
import '../../pages/AuthPage.css';

export default function AuthForm({
  title,
  fields,
  submitText,
  error,
  onSubmit,
  linkText,
  linkPath,
  linkDescription,
  isLoading = false
}) {
  return (
    <div className="auth-page-container">
      <div 
        className="auth-background" 
        style={{ backgroundImage: `url(${pddBackground})` }}
      ></div>
      
      <div className="auth-form-container">
        <div className="auth-form">
          <h2>{title}</h2>
          <form onSubmit={onSubmit}>
            {fields.map((field) => (
              <div key={field.name} className="form-group">
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                  required={field.required}
                  minLength={field.minLength}
                  disabled={isLoading}
                  className={field.error ? 'invalid' : ''}
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
                  <div className="field-error">{field.error}</div>
                )}
              </div>
            ))}
            
            {error && <div className="form-error">{error}</div>}
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading || fields.some(f => f.value && !f.isValid)}
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