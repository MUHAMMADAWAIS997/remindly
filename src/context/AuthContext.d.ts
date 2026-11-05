import React from 'react';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  gender: 'Male' | 'Female';
  email: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    firstName: string,
    lastName: string,
    gender: 'Male' | 'Female',
    email: string,
    password: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export declare const AuthContext: React.Context<AuthContextType | null>;
export declare function AuthProvider(props: { children: React.ReactNode }): React.JSX.Element;
export declare function useAuth(): AuthContextType;

