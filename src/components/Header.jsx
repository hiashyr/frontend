import { Link } from 'react-router-dom';
import { FaBook, FaClipboardList, FaUserPlus } from 'react-icons/fa';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import defaultAvatar from '../assets/default-avatar.png';
import './Header.css';

export default function Header() {
  const { user } = useAuth();
  const [avatarSrc, setAvatarSrc] = useState(defaultAvatar);

  const getAvatarUrl = useCallback((avatarUrl) => {
    if (!avatarUrl) return defaultAvatar;
    
    // Если URL уже абсолютный (уже содержит базовый URL)
    if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) {
      return avatarUrl;
    }
    
    // Для относительных путей (на случай, если где-то еще используется)
    return `${process.env.REACT_APP_API_URL || window.location.origin}${avatarUrl}`;
  }, []);

  useEffect(() => {
    console.log('Current avatar URL:', user?.avatarUrl);
    console.log('Processed avatar URL:', getAvatarUrl(user?.avatarUrl));
    if (user?.avatarUrl) {
      const newAvatarSrc = getAvatarUrl(user.avatarUrl);
      
      // Предзагрузка изображения для избежания мигания
      const img = new Image();
      img.src = newAvatarSrc;
      
      img.onload = () => {
        setAvatarSrc(newAvatarSrc);
      };
      
      img.onerror = () => {
        setAvatarSrc(defaultAvatar);
      };
    } else {
      setAvatarSrc(defaultAvatar);
    }
  }, [user?.avatarUrl, getAvatarUrl]);

  const handleAvatarError = useCallback((e) => {
    e.currentTarget.src = defaultAvatar;
    // Можно добавить логирование ошибки
    console.error('Failed to load avatar:', e.target.src);
  }, []);

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo" aria-label="На главную">
          <span className="logo-text">ПДД Тренер</span>
        </Link>
        
        <nav className="nav" aria-label="Основная навигация">
          <Link to="/rules" className="nav-link" aria-label="Правила ПДД">
            <FaBook className="nav-icon" aria-hidden="true" />
            <span className="nav-text">Правила ПДД</span>
          </Link>
          
          <Link to="/exam-info" className="nav-link" aria-label="Об экзамене">
            <FaClipboardList className="nav-icon" aria-hidden="true" />
            <span className="nav-text">О экзамене</span>
          </Link>
          
          {user ? (
            <Link 
              to="/profile" 
              className="nav-link user-profile-link"
              aria-label="Личный кабинет"
            >
              <img 
                src={avatarSrc}
                alt={`Аватар ${user.email}`}
                className="user-avatar"
                onError={handleAvatarError}
                loading="lazy"
                width="40"
                height="40"
              />
              <span className="nav-text">Личный кабинет</span>
            </Link>
          ) : (
            <Link 
              to="/register" 
              className="nav-link register-btn"
              aria-label="Зарегистрироваться"
            >
              <FaUserPlus className="nav-icon" aria-hidden="true" />
              <span className="nav-text">Зарегистрироваться</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}