import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import API from '../../services/api';
import defaultAvatar from '../../assets/default-avatar.png';
import { FiUpload, FiUser } from 'react-icons/fi';
import './AvatarUpload.css'; // Создайте этот файл для стилей

const AvatarUpload = () => {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotification();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Валидация на клиенте
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showNotification({
        message: 'Допустимые форматы: JPG, PNG, WEBP',
        type: 'error',
        duration: 5000
      });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showNotification({
        message: 'Максимальный размер файла - 2MB',
        type: 'error',
        duration: 5000
      });
      return;
    }

    // Показываем превью
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    // Загрузка на сервер
    const formData = new FormData();
    formData.append('avatar', file);

    setIsLoading(true);
    try {
      const { data } = await API.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      updateUser({ avatarUrl: data.avatarUrl });
      showNotification({
        message: 'Аватар успешно обновлен!',
        type: 'success',
        duration: 3000
      });
    } catch (err) {
      setPreviewUrl(null);
      showNotification({
        message: err.response?.data?.error || 'Ошибка загрузки аватара',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="avatar-upload-container">
      <div 
        className="avatar-preview"
        onClick={triggerFileInput}
        title="Нажмите для изменения аватара"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Превью аватара" className="avatar-image" />
        ) : user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="Аватар пользователя" className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            <FiUser className="placeholder-icon" />
          </div>
        )}
        
        {isLoading && (
          <div className="upload-overlay">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      <div className="upload-controls">
        <input
          type="file"
          ref={fileInputRef}
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="file-input"
        />
        <button 
          type="button" 
          onClick={triggerFileInput}
          className="upload-button"
          disabled={isLoading}
        >
          <FiUpload className="upload-icon" />
          {user?.avatarUrl ? 'Изменить фото' : 'Загрузить фото'}
        </button>
        <p className="file-hint">JPG, PNG или WEBP. Макс. 2MB</p>
      </div>
    </div>
  );
};

export default AvatarUpload;