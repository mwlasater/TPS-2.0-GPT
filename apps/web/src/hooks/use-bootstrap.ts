import type { AppBootstrap } from "@tps/types";
import { useEffect, useState } from "react";

import { fetchBootstrap } from "../lib/api.js";
import { demoBootstrap } from "../lib/session.js";
import { isDemoFallbackEnabled } from "../lib/auth-client.js";

interface BootstrapState {
  data: AppBootstrap;
  error: string | null;
  isLoading: boolean;
  source: "api" | "fallback";
}

export function useBootstrap(enabled = true): BootstrapState {
  const [state, setState] = useState<BootstrapState>({
    data: demoBootstrap,
    error: null,
    isLoading: true,
    source: "fallback"
  });

  useEffect(() => {
    let isMounted = true;

    if (!enabled) {
      setState({
        data: demoBootstrap,
        error: null,
        isLoading: false,
        source: "fallback"
      });
      return () => {
        isMounted = false;
      };
    }

    void fetchBootstrap()
      .then((data) => {
        if (isMounted) {
          setState({
            data,
            error: null,
            isLoading: false,
            source: "api"
          });
        }
      })
      .catch((error) => {
        if (isMounted) {
          if (isDemoFallbackEnabled()) {
            setState({
              data: demoBootstrap,
              error: null,
              isLoading: false,
              source: "fallback"
            });
          } else {
            setState({
              data: demoBootstrap,
              error: error instanceof Error ? error.message : "bootstrap.failed",
              isLoading: false,
              source: "api"
            });
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  return state;
}
