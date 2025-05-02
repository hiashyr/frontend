import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import examModeImage from '../../assets/Exam-img.jpg';
import themesModeImage from '../../assets/Themes-img.jpg';
import hardModeImage from '../../assets/Hard-img.png';

export default function ChoseMode() {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const handleModeClick = (e) => {
    if (!user) {
      e.preventDefault();
      showNotification({
        message: 'Для выбора режима тестирования необходимо войти в систему',
        type: 'error'
      });
    }
  };

  return (
    <section className="test-modes-section">
      <div className="container">
        <h2 className="section-title">Выберите режим теста</h2>
        <p className="section-description">
          Режимы отличаются количеством вопросов и критериями, по которым они распределены
        </p>

        <div className="mode-cards-container">
          {/* Карточка 1 */}
          <Link 
            to="/exam-mode" 
            className="mode-card"
            onClick={handleModeClick}
          >
            <img 
              src={themesModeImage} 
              alt="Темы" 
              className="mode-image"
            />
            <div className="mode-content">
              <h3>Темы</h3>
              <p>
                Выберите определенную тему из правил ПДД, на которую вы хотите прорешать вопросы.
              </p>
            </div>
          </Link>

          {/* Карточка 2 */}
          <Link 
            to="/ticket-mode" 
            className="mode-card"
            onClick={handleModeClick}
          >
            <img 
              src={examModeImage} 
              alt="Экзамен" 
              className="mode-image"
            />
            <div className="mode-content">
              <h3>Экзамен</h3>
              <p>
                Попробуйте решить экзамен как в ГИБДД! Представлены 20 случайных вопросов из 76 билетов сайта
              </p>
            </div>
          </Link>

          {/* Карточка 3 */}
          <Link 
            to="/marathon-mode" 
            className="mode-card"
            onClick={handleModeClick}
          >
            <img 
              src={hardModeImage}
              alt="Сложные вопросы" 
              className="mode-image"
            />
            <div className="mode-content">
              <h3>Сложные вопросы</h3>
              <p>
                Здесь собран билет из 20 самых сложных вопросов, в которых ошибаются больше всего учеников
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}