import type { ManagedUserList, PropertyCode, PropertySettings } from "@tps/types";
import { useEffect, useState } from "react";

import { fetchManagedUsers, fetchPropertySettings } from "../lib/api.js";
import { demoManagedUsers, demoPropertySettings } from "../lib/session.js";

interface PropertyDataState {
  settings: PropertySettings;
  users: ManagedUserList;
  source: "api" | "fallback";
  isLoading: boolean;
}

export function usePropertyData(propertyCode: PropertyCode): PropertyDataState {
  const [state, setState] = useState<PropertyDataState>({
    settings: demoPropertySettings[propertyCode],
    users: demoManagedUsers[propertyCode],
    source: "fallback",
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      settings: demoPropertySettings[propertyCode],
      users: demoManagedUsers[propertyCode],
      source: "fallback",
      isLoading: true
    });

    void Promise.all([
      fetchPropertySettings(propertyCode),
      fetchManagedUsers(propertyCode)
    ])
      .then(([settings, users]) => {
        if (isMounted) {
          setState({
            settings,
            users,
            source: "api",
            isLoading: false
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            settings: demoPropertySettings[propertyCode],
            users: demoManagedUsers[propertyCode],
            source: "fallback",
            isLoading: false
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode]);

  return state;
}
