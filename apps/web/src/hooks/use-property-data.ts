import type {
  ManagedUserList,
  PropertyCode,
  PropertySettings,
  PropertySettingsUpdate
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  fetchManagedUsers,
  fetchPropertySettings,
  updatePropertySettings
} from "../lib/api.js";
import { demoManagedUsers, demoPropertySettings } from "../lib/session.js";

interface PropertyDataState {
  settings: PropertySettings;
  users: ManagedUserList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  saveSettings: (update: PropertySettingsUpdate) => Promise<void>;
}

export function usePropertyData(propertyCode: PropertyCode): PropertyDataState {
  const [state, setState] = useState<PropertyDataState>({
    settings: demoPropertySettings[propertyCode],
    users: demoManagedUsers[propertyCode],
    source: "fallback",
    isLoading: true,
    isSaving: false,
    saveSettings: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      settings: demoPropertySettings[propertyCode],
      users: demoManagedUsers[propertyCode],
      source: "fallback",
      isLoading: true,
      isSaving: false,
      saveSettings: state.saveSettings
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
            isLoading: false,
            isSaving: false,
            saveSettings: state.saveSettings
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            settings: demoPropertySettings[propertyCode],
            users: demoManagedUsers[propertyCode],
            source: "fallback",
            isLoading: false,
            isSaving: false,
            saveSettings: state.saveSettings
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode]);

  async function saveSettings(update: PropertySettingsUpdate): Promise<void> {
    setState((current) => ({
      ...current,
      isSaving: true
    }));

    try {
      const settings = await updatePropertySettings(propertyCode, update);
      setState((current) => ({
        ...current,
        settings,
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({
        ...current,
        isSaving: false
      }));
      throw new Error("settings.update_failed");
    }
  }

  return {
    ...state,
    saveSettings
  };
}
