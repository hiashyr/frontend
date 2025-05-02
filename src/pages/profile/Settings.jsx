import { useState } from 'react';
import AvatarUpload from '../../components/profile/AvatarUpload';
import ChangePassword from '../../components/profile/ChangePassword'; // Заменяем компонент
import { useAuth } from '../../contexts/AuthContext';
import './profile-page.css';

export default function Settings() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('avatar');

  return (
    <div className="settings-page">
      <h2>Настройки профиля</h2>
      
      <div className="settings-tabs">
        <button 
          onClick={() => setActiveTab('avatar')}
          className={activeTab === 'avatar' ? 'active' : ''}
        >
          Аватар
        </button>
        <button 
          onClick={() => setActiveTab('password')}
          className={activeTab === 'password' ? 'active' : ''}
        >
          Пароль
        </button>
      </div>
      
      <div className="settings-content">
        {activeTab === 'avatar' && <AvatarUpload />}
        {activeTab === 'password' && <ChangePassword />}
      </div>
      
      <button onClick={logout} className="logout-btn">
        Выйти из системы
      </button>
    </div>
  );
}