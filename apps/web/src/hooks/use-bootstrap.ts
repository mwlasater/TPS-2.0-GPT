import type { AppBootstrap } from "@tps/types";
import { useEffect, useState } from "react";

import { fetchBootstrap } from "../lib/api.js";
import { demoBootstrap } from "../lib/session.js";

interface BootstrapState {
  data: AppBootstrap;
  isLoading: boolean;
  source: "api" | "fallback";
}

export function useBootstrap(): BootstrapState {
  const [state, setState] = useState<BootstrapState>({
    data: demoBootstrap,
    isLoading: true,
    source: "fallback"
  });

  useEffect(() => {
    let isMounted = true;

    void fetchBootstrap()
      .then((data) => {
        if (isMounted) {
          setState({
            data,
            isLoading: false,
            source: "api"
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            data: demoBootstrap,
            isLoading: false,
            source: "fallback"
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
