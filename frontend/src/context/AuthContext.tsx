import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/authClient';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        const { accessToken, user } = await authApi.refreshSession();
        authApi.setAccessToken(accessToken);
        return user;
      } catch {
        try {
          return await authApi.getMe();
        } catch {
          return null;
        }
      }
    },
    staleTime: Infinity,
  });

  const login = async (data: any) => {
    const res = await authApi.login(data);
    authApi.setAccessToken(res.accessToken);
    queryClient.setQueryData(['auth', 'user'], res.user);
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    authApi.setAccessToken(res.accessToken);
    queryClient.setQueryData(['auth', 'user'], res.user);
  };

  const logout = async () => {
    await authApi.logout();
    authApi.setAccessToken(null);
    queryClient.setQueryData(['auth', 'user'], null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
