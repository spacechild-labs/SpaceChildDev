import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  subscriptionTier: string;
  monthlyCredits?: number;
  usedCredits?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const { user } = await response.json();
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const initiateSSO = useCallback(async () => {
    const response = await fetch("/api/auth/sso/initiate");
    const { redirectUrl } = await response.json();
    window.location.href = redirectUrl;
  }, []);

  const verifySSOToken = useCallback(async (token: string) => {
    const response = await fetch("/api/auth/sso/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      throw new Error("SSO verification failed");
    }
    
    const { user } = await response.json();
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    
    return user;
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return {
    ...state,
    initiateSSO,
    verifySSOToken,
    logout,
    checkAuth,
  };
}
