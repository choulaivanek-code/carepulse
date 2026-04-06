import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse, User } from '../types';

interface AuthState {
  user: Partial<User> | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (data) => {
        try {
          console.log('authStore: Login successful, mapping user data...', data);
          if (!data || !data.token) {
            console.error('authStore: Invalid login data received');
            return;
          }
          set({
            user: {
              id: data.userId,
              email: data.email,
              nom: data.nom,
              prenom: data.prenom,
              role: data.role as any,
            },
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('authStore: Error during login state update', error);
        }
      },
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
