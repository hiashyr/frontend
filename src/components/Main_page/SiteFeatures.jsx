import { FaBook, FaClipboardList, FaQuestionCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function SiteFeatures() {
  return (
    <div className="features-section">
      <div className="container">
        <h3 className="features-title">Что еще есть на нашем сайте?</h3>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaBook size={32} />
            </div>
            <h4>Правила ПДД</h4>
            <p>
              Полный актуальный свод правил дорожного движения с комментариями и пояснениями
            </p>
            <Link to="/rules" className="feature-link">
              Изучить правила →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaClipboardList size={32} />
            </div>
            <h4>Об экзамене</h4>
            <p>
              Всё о теоретическом экзамене в ГИБДД: как проходит, какие билеты, как оценивается
            </p>
            <Link to="/exam-info" className="feature-link">
              Узнать подробности →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}