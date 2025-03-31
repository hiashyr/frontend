import { Link } from 'react-router-dom';
import pddBackground from '../../assets/pdd-background.jpg'; // Импортируем фоновое изображение
import '../../pages/AuthPage.css';

export default function AuthForm({
  title,
  fields,
  submitText,
  error,
  onSubmit,
  linkText,
  linkPath,
  linkDescription
}) {
  return (
    <div className="auth-page-container">
      {/* Размытый задний фон */}
      <div 
        className="auth-background" 
        style={{ backgroundImage: `url(${pddBackground})` }}
      ></div>
      
      {/* Контейнер с формой */}
      <div className="auth-form-container">
        <div className="auth-form">
          <h2>{title}</h2>
          <form onSubmit={onSubmit}>
            {fields.map((field) => (
              <input
                key={field.name}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={field.value}
                onChange={field.onChange}
                required={field.required}
                minLength={field.minLength}
              />
            ))}
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn">{submitText}</button>
          </form>
          <p>
            {linkDescription} <Link to={linkPath}>{linkText}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}