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
  useEffect(() => {
    // Защита от пустого сообщения - проверяем внутри useEffect
    if (!message) return;

    // Автоматическое закрытие через 3 секунды
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]); // Добавили message в зависимости

  // Защита от пустого сообщения - теперь после всех хуков
  if (!message) return null;

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