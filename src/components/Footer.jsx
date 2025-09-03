import './Footer.css'
import { Link } from 'react-router-dom';
import { FaCar, FaBook, FaInfoCircle, FaShieldAlt, FaEnvelope, FaCopyright, FaClipboardList } from 'react-icons/fa';

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
          <Link to="/theory" className="footer-link" aria-label="Правила ПДД">
            <FaBook className="footer-icon" />
            <span>Правила ПДД</span>
          </Link>
          <Link to="/about-exam" className="footer-link" aria-label="Об экзамене">
            <FaClipboardList className="footer-icon" />
            <span>О экзамене</span>
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
