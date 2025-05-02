import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import API from '../../services/api';
import defaultAvatar from '../../assets/default-avatar.png';
import { FiUpload, FiInfo } from 'react-icons/fi';

export default function AvatarUpload({ onSuccess }) {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Проверка размера файла (макс. 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showNotification({
        message: 'Размер файла не должен превышать 2MB',
        type: 'error'
      });
      return;
    }

    // Проверка формата
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showNotification({
        message: 'Допустимые форматы: JPG, PNG, WEBP',
        type: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Создание превью
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('avatar', file);
      
      const { data } = await API.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      updateUser(data.user);
      showNotification({ message: 'Аватар успешно обновлен', type: 'success' });
      onSuccess(); // Вызываем колбэк при успехе
    } catch (err) {
      showNotification({
        message: err.response?.data?.error || 'Ошибка загрузки аватара',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="avatar-upload-container">
      <div className="avatar-section">
        <div className="avatar-preview">
          <img 
            src={preview || user.avatarUrl || defaultAvatar} 
            alt="Аватар пользователя"
            className="avatar-image"
          />
        </div>

        <div className="avatar-upload-controls">
          <label className="upload-btn">
            <FiUpload className="icon" />
            {isLoading ? 'Загрузка...' : 'Выбрать аватар'}
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
              disabled={isLoading}
              hidden
            />
          </label>
          
          <div className="avatar-requirements">
            <div className="requirements-title">
              <FiInfo className="info-icon" />
              <span>Требования к аватару:</span>
            </div>
            <ul className="requirements-list">
              <li>Форматы: JPG, PNG, WEBP</li>
              <li>Макс. размер: 2MB</li>
              <li>Рекомендуемый размер: 200×200px</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}