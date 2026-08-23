"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@/types/user";
import { http } from "@/lib/http";
import { getUserFacingErrorMessage } from "@/lib/error-messages";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  avatar_url?: string;
  role?: "student" | "teacher";
};

type LoginResult =
  | {
      ok: true;
      user: User;
      message?: string;
    }
  | {
      ok: false;
      user: null;
      message: string;
    };

type RegisterResult =
  | {
      ok: true;
      message?: string;
    }
  | {
      ok: false;
      message: string;
    };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refreshMe: () => Promise<User | null>;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshMeRequestRef = useRef<Promise<User | null> | null>(null);

  const refreshMe = useCallback((): Promise<User | null> => {
    if (refreshMeRequestRef.current) {
      return refreshMeRequestRef.current;
    }

    const request = (async () => {
      try {
        const response = await http("/api/auth/me", { method: "GET" });

        if (!response.ok) {
          setUser(null);
          return null;
        }

        const data = await response.json().catch(() => ({}));
        const nextUser = (data?.user ?? null) as User | null;

        setUser(nextUser);
        return nextUser;
      } catch {
        setUser(null);
        return null;
      } finally {
        refreshMeRequestRef.current = null;
      }
    })();

    refreshMeRequestRef.current = request;
    return request;
  }, []);

  const login = useCallback(
    async (payload: LoginPayload): Promise<LoginResult> => {
      try {
        const response = await http("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));

          return {
            ok: false,
            user: null,
            message: getUserFacingErrorMessage(
              data,
              "Не удалось войти. Проверьте email и пароль.",
              { status: response.status },
            ),
          };
        }

        const data = await response.json().catch(() => ({}));
        const nextUser = data?.user ? (data.user as User) : await refreshMe();

        if (!nextUser) {
          return {
            ok: false,
            user: null,
            message:
              "Не удалось получить данные пользователя после входа. Обновите страницу и попробуйте снова.",
          };
        }

        setUser(nextUser);

        return {
          ok: true,
          user: nextUser,
        };
      } catch (error) {
        return {
          ok: false,
          user: null,
          message: getUserFacingErrorMessage(
            error,
            "Не удалось войти. Проверьте соединение и попробуйте снова.",
          ),
        };
      }
    },
    [refreshMe],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<RegisterResult> => {
      try {
        const response = await http("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));

          return {
            ok: false,
            message: getUserFacingErrorMessage(
              data,
              "Не удалось зарегистрироваться. Проверьте данные и попробуйте снова.",
              { status: response.status },
            ),
          };
        }

        const data = await response.json().catch(() => ({}));

        if (data?.user) {
          setUser(data.user as User);
        } else {
          await refreshMe();
        }

        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          message: getUserFacingErrorMessage(
            error,
            "Не удалось зарегистрироваться. Проверьте соединение и попробуйте снова.",
          ),
        };
      }
    },
    [refreshMe],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await http("/api/auth/logout", {
        method: "POST",
        retryOn401: false,
      });
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await refreshMe();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshMe]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refreshMe,
      login,
      register,
      logout,
    }),
    [user, loading, refreshMe, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return ctx;
}
