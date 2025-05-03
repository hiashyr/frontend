import './Notification.css';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  icon?: React.ReactNode; // Дополнительная кастомизация
}

const DEFAULT_ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ'
};

export default function Notification({ 
  message, 
  type, 
  onClose,
  icon
}: NotificationProps) {
  // Защита от пустого сообщения
  if (!message) return null;

  return (
    <div 
      className={`notification ${type}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="notification-content">
        <span className="notification-icon" aria-hidden="true">
          {icon || DEFAULT_ICONS[type]}
        </span>
        <span className="notification-message">{message}</span>
      </div>
      <button 
        className="notification-close" 
        onClick={onClose}
        aria-label="Закрыть уведомление"
      >
        &times;
      </button>
    </div>
  );
}

// Для большей надежности можно добавить:
Notification.defaultProps = {
  type: 'info'
};