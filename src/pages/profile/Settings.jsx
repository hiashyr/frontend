import { useState } from 'react';
import AvatarUpload from '../../components/profile/AvatarUpload';
import PasswordChange from '../../components/profile/PasswordChange';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './Settings.css';
import backgroundImage from '../../assets/settings-bg.jpg'; // Добавляем фоновое изображение

export default function Settings() {
  const { user, logout } = useAuth();
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [avatarUpdated, setAvatarUpdated] = useState(false);

  const formattedDate = user?.createdAt 
    ? format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: ru })
    : 'неизвестно';

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h2 className="page-title">Настройки профиля</h2>
        
        <div className="settings-grid">
          {/* Блок информации */}
          <div className="settings-card info-card">
            <h3 className="section-title">Основная информация</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value email-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Дата регистрации:</span>
                <span className="info-value">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Блок аватара */}
          <div className="settings-card avatar-card">
            <h3 className="section-title">Аватар профиля</h3>
            <AvatarUpload onSuccess={() => setAvatarUpdated(true)} />
            {avatarUpdated && (
              <div className="success-message">Аватар успешно обновлен</div>
            )}
          </div>

          {/* Блок пароля */}
          <div className="settings-card password-card">
            <h3 className="section-title">Изменение пароля</h3>
            <PasswordChange onSuccess={() => setPasswordChanged(true)} />
            {passwordChanged && (
              <div className="success-message">
                Пароль успешно изменен. Проверьте почту.
              </div>
            )}
          </div>
        </div>

        <div className="logout-container">
          <button onClick={logout} className="logout-btn">
            Выйти из системы
          </button>
        </div>
      </div>
    </div>
  );
}