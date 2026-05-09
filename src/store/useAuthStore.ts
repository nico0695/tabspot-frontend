'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/features/auth/types';
import { createClient } from '@/lib/supabase/client';
import { fetchWithAuth } from '@/lib/api/fetcher';
import { ApiError } from '@/lib/api/errors';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  loginSupabase: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  registerSupabase: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logoutSupabase: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      loginSupabase: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, message: error.message };
          }

          const accessToken = data.session.access_token;
          const user = await fetchWithAuth<User>(accessToken, '/api/v1/me');

          set({
            user,
            token: accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (err) {
          const message =
            err instanceof ApiError
              ? err.userMessage
              : err instanceof Error
                ? err.message
                : 'Error al iniciar sesión';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      registerSupabase: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
            },
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, message: error.message };
          }

          set({ isLoading: false });
          return { success: true };
        } catch (err) {
          const message =
            err instanceof ApiError
              ? err.userMessage
              : err instanceof Error
                ? err.message
                : 'Error al registrarse';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      logoutSupabase: async () => {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } finally {
          set({ ...initialState });
        }
      },

      validateSession: async () => {
        try {
          const supabase = createClient();
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            set({ ...initialState });
            return false;
          }

          const currentToken = get().token;

          if (session.access_token !== currentToken) {
            const user = await fetchWithAuth<User>(session.access_token, '/api/v1/me');

            set({
              user,
              token: session.access_token,
              isAuthenticated: true,
              error: null,
            });
          }

          return true;
        } catch {
          set({ ...initialState });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: true,
    },
  ),
);
