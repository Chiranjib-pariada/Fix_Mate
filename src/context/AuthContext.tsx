import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Provider, UserRole, Address } from '../types';
import { apiRequest } from '../lib/api';

interface AuthContextType {
  user: User | null;
  provider: Provider | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole, phone?: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
  addAddress: (addressData: Partial<Address>) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('fixmate_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('fixmate_token');
    if (!currentToken) {
      setUser(null);
      setProvider(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiRequest<{ user: User; provider?: Provider }>('/auth/me');
      setUser(res.data.user);
      setProvider(res.data.provider || null);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      localStorage.removeItem('fixmate_token');
      setUser(null);
      setProvider(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If no token exists at all on first load, seed with demo customer for seamless demonstration
    if (!localStorage.getItem('fixmate_token')) {
      switchDemoRole('CUSTOMER').finally(() => setIsLoading(false));
    } else {
      refreshUser();
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('fixmate_token', res.data.token);
      setToken(res.data.token);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'CUSTOMER', phone?: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, phone }),
      });
      localStorage.setItem('fixmate_token', res.data.token);
      setToken(res.data.token);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fixmate_token');
    setUser(null);
    setProvider(null);
    setToken(null);
  };

  const switchDemoRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ user: User; provider?: Provider; token: string }>('/auth/demo-switch', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      localStorage.setItem('fixmate_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setProvider(res.data.provider || null);
    } catch (err) {
      console.error('Demo switch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addAddress = async (addressData: Partial<Address>) => {
    const res = await apiRequest<Address[]>('/users/address', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
    if (user) {
      setUser({ ...user, addresses: res.data });
    }
  };

  const removeAddress = async (addressId: string) => {
    const res = await apiRequest<Address[]>(`/users/address/${addressId}`, {
      method: 'DELETE',
    });
    if (user) {
      setUser({ ...user, addresses: res.data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        provider,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        addAddress,
        removeAddress,
        refreshUser,
      }}
    >
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
