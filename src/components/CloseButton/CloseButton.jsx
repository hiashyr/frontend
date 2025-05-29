import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import './CloseButton.css';

export default function CloseButton() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <button 
      className="profile-close-btn" 
      onClick={handleClose}
      aria-label="Вернуться на главную"
    >
      <FaTimes aria-hidden="true" />
    </button>
  );
} 