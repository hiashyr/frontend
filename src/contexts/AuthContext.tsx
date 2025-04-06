import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: any;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(() => {
    // Восстановление состояния при перезагрузке
    const token = localStorage.getItem('token');
    return token ? parseJwt(token) : null;
  });

  const login = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Перенаправление обрабатывается в компонентах, а не здесь
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Вспомогательная функция для декодирования JWT
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
}

export const useAuth = () => useContext(AuthContext);