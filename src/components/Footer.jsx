import './Footer.css'
import { Link } from 'react-router-dom';
import { FaCar, FaBook, FaInfoCircle, FaShieldAlt, FaEnvelope, FaCopyright} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <div className="footer-item">
            <FaCar className="footer-icon" />
            <h3 className="footer-logo">ПДД Тренажёр</h3>
          </div>
          <p>Подготовка к экзамену по теории в ГИБДД</p>
        </div>
        
        <div className="footer-column">
          <Link to="/rules" className="footer-link">
            <FaBook className="footer-icon" />
            <span>Правила ПДД</span>
          </Link>
          <Link to="/exam-info" className="footer-link">
            <FaInfoCircle className="footer-icon" />
            <span>Об экзамене</span>
          </Link>
        </div>
        
        <div className="footer-column">
          <div className="footer-item">
            <FaEnvelope className="footer-icon" />
            <p>support@pdd-trener.ru</p>
          </div>
        </div>
      </div>
    </footer>
  );
}