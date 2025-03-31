import { Link } from 'react-router-dom';
import { FaCar, FaBook, FaInfoCircle, FaShieldAlt, FaEnvelope, FaCopyright} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      {
              <footer className="footer">
              <div className="footer-container">
                <div className="footer-column">
                  <div className="footer-item">
                    <FaCar className="footer-icon" size={20} />
                    <h3 className="footer-logo">ПДД Тренажёр</h3>
                  </div>
                  <p>Подготовка к экзамену по теории в ГИБДД</p>
                </div>
                
                <div className="footer-column">
                  <Link to="/rules" className="footer-link">
                    <FaBook className="footer-icon" size={16} />
                    Правила ПДД
                  </Link>
                  <Link to="/exam-info" className="footer-link">
                    <FaInfoCircle className="footer-icon" size={16} />
                    Об экзамене
                  </Link>
                  <Link to="/privacy" className="footer-link">
                    <FaShieldAlt className="footer-icon" size={16} />
                    Конфиденциальность
                  </Link>
                </div>
                
                <div className="footer-column">
                  <div className="footer-item">
                    <FaEnvelope className="footer-icon" size={16} />
                    <p>support@pdd-trener.ru</p>
                  </div>
                  <div className="footer-item">
                    <FaCopyright className="footer-icon" size={16} />
                    <p>2024 Все права защищены</p>
                  </div>
                </div>
              </div>
            </footer>
      }
    </footer>
  );
}