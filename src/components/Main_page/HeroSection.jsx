import { Link } from 'react-router-dom';
import { FaArrowRight, FaUserPlus } from 'react-icons/fa';
import heroImage from '../../assets/hero-image.jpg';

export default function HeroSection() {
  return (
    <section className="hero-section">
      {
              <section className="hero-section">
              <div className="container">
                <div className="hero-content">
                  <h1>Готовьтесь к экзамену по теории!</h1>
                  <p className="hero-subtitle">
                    Регистрируйтесь, чтобы получить доступ ко всем билетам 
                    и отслеживать свой прогресс
                  </p>
                  <div className="hero-buttons">
                    <Link to="/register" className="btn btn-primary">
                      <FaUserPlus className="btn-icon" /> Регистрация
                    </Link>
                    <Link to="/login" className="btn btn-outline">
                      <FaArrowRight className="btn-icon" /> Войти
                    </Link>
                  </div>
                </div>
                <div className="hero-image">
                  <img 
                    src={heroImage} 
                    alt="Дорожные знаки" 
                    className="hero-photo" 
                  />
                </div>
              </div>
            </section>
      }
    </section>
  );
}