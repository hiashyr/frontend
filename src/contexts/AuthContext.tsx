import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean; // Добавляем в контекст
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
  
      try {
        const { data } = await API.get('/users/me');
        
        // Добавьте строгую проверку данных
        if (!data?.id || !data?.role) {
          throw new Error('Invalid user data structure');
        }
        
        setUser(data);
      } catch (err) {
        console.error('Auth verification failed:', err);
        localStorage.removeItem('token');
        setUser(null);
        
        // Принудительный редирект на логин при ошибке
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };
  
    verifyAuth();
  }, [navigate]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Убираем проверку isLoading здесь, переносим в роуты
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
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