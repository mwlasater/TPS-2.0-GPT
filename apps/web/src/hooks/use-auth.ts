import { useEffect, useState } from "react";

import type { AuthState } from "../lib/auth-client.js";
import { initializeAuth, signOut, startSignIn } from "../lib/auth-client.js";

interface UseAuthState extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => void;
}

export function useAuth(): UseAuthState {
  const [state, setState] = useState<AuthState>({
    error: null,
    isAuthenticated: false,
    isLoading: true,
    mode: import.meta.env.VITE_AUTH_MODE === "oidc" ? "oidc" : "development"
  });

  useEffect(() => {
    let isMounted = true;

    void initializeAuth().then((authState) => {
      if (isMounted) {
        setState(authState);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    ...state,
    signIn: startSignIn,
    signOut
  };
}
