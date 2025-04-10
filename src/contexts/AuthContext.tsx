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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Проверка аутентификации при загрузке
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await API.get('/users/me');
        setUser(data);
        
        // Автоматический редирект для администратора
        if (data.role === 'admin' && window.location.pathname !== '/admin/dashboard') {
          navigate('/admin/dashboard', { replace: true });
        }
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    // Не делаем редирект здесь, только в LoginPage
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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