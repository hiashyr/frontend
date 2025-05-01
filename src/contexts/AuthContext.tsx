import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

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

  // Мемоизированная функция для получения данных пользователя
  const fetchUserData = useCallback(async (): Promise<User> => {
    try {
      const { data } = await API.get('/users/me');
      
      if (!data?.id || !data?.role) {
        throw new Error('Invalid user data structure');
      }
      
      setUser(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      localStorage.removeItem('token');
      delete API.defaults.headers.common['Authorization'];
      setUser(null);
      throw err;
    }
  }, []);

  // Проверка авторизации при монтировании и изменении маршрута
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
  
      try {
        // Устанавливаем токен в заголовки перед запросом
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await fetchUserData();
      } catch (err) {
        console.error('Authentication check failed:', err);
        if (window.location.pathname !== '/login') {
          navigate('/login', { replace: true });
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
    setUser(userData);
    navigate('/profile', { replace: true });
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
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

  // Добавляем обработчик для автоматического выхода при 401 ошибке
  useEffect(() => {
    const responseInterceptor = API.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

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
          <p>Проверка авторизации...</p>
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