import React, { useEffect } from 'react';
import './NewNotification.css';

interface NewNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  icon?: React.ReactNode;
  isClosing?: boolean;
}

const DEFAULT_ICONS = {
  success: '✓',
  error: '!',
  info: 'ℹ'
};

const NewNotification: React.FC<NewNotificationProps> = ({
  message,
  type,
  onClose,
  icon,
  isClosing = false
}) => {
  // Защита от пустого сообщения
  if (!message) return null;

  useEffect(() => {
    // Автоматическое закрытие через 3 секунды
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`new-notification ${type} ${isClosing ? 'hiding' : ''}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="new-notification-content">
        <span className="new-notification-icon" aria-hidden="true">
          {icon || DEFAULT_ICONS[type]}
        </span>
        <span className="new-notification-message">{message}</span>
      </div>
      <button
        className="new-notification-close"
        onClick={onClose}
        aria-label="Закрыть уведомление"
      >
        &times;
      </button>
    </div>
  );
};

export default NewNotification;
