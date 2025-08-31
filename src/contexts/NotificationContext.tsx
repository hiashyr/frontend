// src/contexts/NotificationContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import NewNotification from '../components/Notification/NewNotification';

interface NotificationType {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  showNotification: (notification: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const closeNotification = () => {
    setIsClosing(true);
    // Ждем окончания анимации перед удалением уведомления
    setTimeout(() => {
      setNotification(null);
      setIsClosing(false);
    }, 300); // 300ms - длительность анимации
  };

  const showNotification = (notification: NotificationType) => {
    console.log('Showing notification:', notification);
    if (notification) {
      // Если уже есть уведомление, сначала закрываем его
      setIsClosing(true);
      setTimeout(() => {
        setNotification(notification);
        setIsClosing(false);
        // Устанавливаем таймер для автоматического закрытия
        setTimeout(closeNotification, 3000);
      }, 300);
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <NewNotification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
          isClosing={isClosing}
        />
      )}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
