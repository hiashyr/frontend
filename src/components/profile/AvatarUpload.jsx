import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';

export default function AvatarUpload() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const { data } = await API.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      updateUser(data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки аватара');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        <img 
          src={user.avatarUrl || '/default-avatar.png'} 
          alt="Аватар" 
        />
      </div>
      
      <label className="upload-btn">
        {isLoading ? 'Загрузка...' : 'Выбрать изображение'}
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
          hidden
        />
      </label>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}