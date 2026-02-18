
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    let userData;
    
    if (email === 'admin@escuela.com' && password === 'admin123') {
      userData = { 
        email, 
        role: 'admin_financiero',
        name: 'Admin Financiero'
      };
    } else if (email === 'contenido@escuela.com' && password === 'contenido123') {
      userData = { 
        email, 
        role: 'admin_contenido',
        name: 'Admin de Contenido'
      };
    } else if (email === 'padre@escuela.com' && password === 'padre123') {
      userData = { 
        email, 
        role: 'padre_familia', 
        child_id: 1,
        name: 'Padre de Familia'
      };
    } else {
      throw new Error('Credenciales inválidas');
    }
    
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthContextProvider');
  }
  return context;
};
