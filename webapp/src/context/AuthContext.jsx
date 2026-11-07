import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('serveai_auth_user');
      return saved ? JSON.parse(saved) : {
        id: 'user-admin-1',
        name: 'Chef Vikram',
        email: 'vikram@foodhouse.in',
        role: 'owner', // 'owner', 'admin', 'manager', 'waiter', 'kitchen', 'cashier'
        restaurantId: '11111111-1111-1111-1111-111111111111',
      };
    } catch {
      return {
        id: 'user-admin-1',
        name: 'Chef Vikram',
        email: 'vikram@foodhouse.in',
        role: 'owner',
        restaurantId: '11111111-1111-1111-1111-111111111111',
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('serveai_auth_user', JSON.stringify(user));
    } catch (e) {}
  }, [user]);

  const switchRole = (newRole) => {
    setUser((prev) => ({
      ...prev,
      role: newRole,
      name: newRole === 'kitchen' ? 'Chef Vikram (Kitchen)' : newRole === 'waiter' ? 'Staff Ramesh' : 'Vikram Malhotra (Owner)',
    }));
  };

  const login = (email, password, role = 'owner') => {
    const newUser = {
      id: 'user-' + Date.now(),
      name: email.split('@')[0],
      email,
      role,
      restaurantId: '11111111-1111-1111-1111-111111111111',
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('serveai_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

