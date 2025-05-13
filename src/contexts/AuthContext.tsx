import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface TestStats {
  totalTests: number;
  averageScore: number;
  lastAttempts?: Array<{
    date: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
  }>;
}

interface User {
  id: number;
  email: string;
  role: string;
  avatarUrl?: string;
  isVerified?: boolean;
  testStats?: TestStats;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Функция для нормализации URL аватара
  const normalizeAvatarUrl = (userData: User): User => {
    if (!userData.avatarUrl) return userData;
    
    // Если URL уже абсолютный
    if (userData.avatarUrl.startsWith('http') || userData.avatarUrl.startsWith('data:')) {
      return userData;
    }
    
    // Добавляем базовый URL
    return {
      ...userData,
      avatarUrl: `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${userData.avatarUrl}`
    };
  };

  // Получение данных пользователя с обработкой аватара
  const fetchUserData = useCallback(async (): Promise<User> => {
    try {
      const { data } = await API.get('/users/me');
      
      if (!data?.id || !data?.role) {
        throw new Error('Invalid user data structure');
      }
      
      // Добавляем проверку и нормализацию аватара
      const normalizedUser = normalizeAvatarUrl({
        ...data,
        avatarUrl: data.avatar_url || data.avatarUrl // учитываем разные варианты названия поля
      });
      
      setUser(normalizedUser);
      return normalizedUser;
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      localStorage.removeItem('token');
      delete API.defaults.headers.common['Authorization'];
      setUser(null);
      throw err;
    }
  }, []);

  // Проверка авторизации
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
  
      try {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const userData = await fetchUserData();
        
        // Дополнительная проверка для защиты от невалидных состояний
        if (!userData || !userData.id) {
          throw new Error('Invalid user data');
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        if (!window.location.pathname.includes('/login')) {
          navigate('/login', { 
            replace: true,
            state: { from: window.location.pathname } 
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
  
    verifyAuth();
  }, [navigate, fetchUserData]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Нормализуем URL аватара перед сохранением
    const normalizedUser = normalizeAvatarUrl(userData);
    setUser(normalizedUser);
    
    navigate(normalizedUser.role === 'admin' ? '/admin/dashboard' : '/profile', { 
      replace: true 
    });
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login', { 
      replace: true,
      state: { from: window.location.pathname } 
    });
  }, [navigate]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      
      // Нормализуем URL аватара перед сохранением
      const updatedUser = normalizeAvatarUrl({ ...prev, ...userData });
      
      // Добавим timestamp к URL аватара для избежания кеширования
      if (updatedUser.avatarUrl && !updatedUser.avatarUrl.includes('?')) {
        updatedUser.avatarUrl = `${updatedUser.avatarUrl}?t=${Date.now()}`;
      }
      
      return updatedUser;
    });
  }, []);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      await fetchUserData();
    } catch (err) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик 401 ошибок
  useEffect(() => {
    const responseInterceptor = API.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && user) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, user]);

  const value = {
    user,
    login,
    logout,
    isLoading,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="full-page-loading">
          <LoadingSpinner />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};