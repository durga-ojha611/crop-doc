import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = 'http://localhost:5001/api';

interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  location_district?: string;
  avatarUrl?: string;
  app_metadata?: any;
  user_metadata?: any;
  displayName?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isEmailVerified: boolean;
  linkedProviders: string[];
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  loginWithGoogle: (googleIdToken: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateEmail: (newEmail: string) => Promise<{ error: Error | null }>;
  updateProfile: (profileData: { full_name?: string; phone?: string; location_district?: string }) => Promise<{ error: Error | null }>;
  updateAvatar: (file: File) => Promise<{ error: Error | null }>;
  signInWithProvider: (providerId: string) => Promise<{ error: Error | null }>;
  resendVerificationEmail: () => Promise<{ error: Error | null }>;
  linkProvider: (providerId: string) => Promise<{ error: Error | null }>;
  unlinkProvider: (providerId: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isEmailVerified = true;
  const linkedProviders: string[] = [];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Token invalid');
        return res.json();
      })
      .then(userData => {
        setUser({ 
          id: userData._id, 
          email: userData.email, 
          full_name: userData.full_name,
          phone: userData.phone,
          location_district: userData.location_district,
          avatarUrl: userData.avatarUrl
        });
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      localStorage.setItem('token', data.token);
      setUser({ 
        id: data.id, 
        email: data.email, 
        full_name: data.full_name,
        phone: data.phone,
        location_district: data.location_district,
        avatarUrl: data.avatarUrl
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('token', data.token);
      setUser({ 
        id: data.id, 
        email: data.email, 
        full_name: data.full_name,
        phone: data.phone,
        location_district: data.location_district,
        avatarUrl: data.avatarUrl
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const loginWithGoogle = async (googleIdToken: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleIdToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google login failed');
      
      localStorage.setItem('token', data.token);
      setUser({ 
        id: data.id, 
        email: data.email, 
        full_name: data.full_name,
        phone: data.phone,
        location_district: data.location_district,
        avatarUrl: data.avatarUrl
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset email');
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const confirmPasswordReset = async (token: string, newPassword: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password reset failed');
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Mock functions for unused features
  const signInWithProvider = async (providerId: string) => ({ error: new Error('Not implemented') });
  const updatePassword = async (newPassword: string) => ({ error: new Error('Not implemented') });
  const updateEmail = async (newEmail: string) => ({ error: new Error('Not implemented') });
  
  const updateProfile = async (profileData: { full_name?: string; phone?: string; location_district?: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Profile update failed');
      
      setUser(prev => prev ? { 
        ...prev, 
        full_name: data.full_name,
        phone: data.phone,
        location_district: data.location_district,
        avatarUrl: data.avatarUrl
      } : null);
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateAvatar = async (file: File) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(`${API_URL}/auth/avatar`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Avatar update failed');
      
      setUser(prev => prev ? { 
        ...prev, 
        avatarUrl: data.avatarUrl
      } : null);
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const resendVerificationEmail = async () => ({ error: new Error('Not implemented') });
  const linkProvider = async (providerId: string) => ({ error: new Error('Not implemented') });
  const unlinkProvider = async (providerId: string) => ({ error: new Error('Not implemented') });

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isEmailVerified,
      linkedProviders,
      signUp,
      signIn,
      loginWithGoogle,
      signInWithProvider,
      signOut,
      resetPassword,
      confirmPasswordReset,
      updatePassword,
      updateEmail,
      updateProfile,
      updateAvatar,
      resendVerificationEmail,
      linkProvider,
      unlinkProvider,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
