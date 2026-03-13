import type {
  ManagedUserList,
  PropertyCode,
  ReferenceDataset,
  PropertySettings,
  PropertySettingsUpdate
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  fetchManagedUsers,
  fetchPropertySettings,
  fetchReferenceData,
  updateReferenceData,
  updatePropertySettings
} from "../lib/api.js";
import { demoManagedUsers, demoPropertySettings, demoReferenceData } from "../lib/session.js";

interface PropertyDataState {
  referenceData: ReferenceDataset;
  settings: PropertySettings;
  users: ManagedUserList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  saveReferenceData: (update: ReferenceDataset) => Promise<void>;
  saveSettings: (update: PropertySettingsUpdate) => Promise<void>;
}

export function usePropertyData(propertyCode: PropertyCode): PropertyDataState {
  const [state, setState] = useState<PropertyDataState>({
    referenceData: demoReferenceData[propertyCode],
    settings: demoPropertySettings[propertyCode],
    users: demoManagedUsers[propertyCode],
    source: "fallback",
    isLoading: true,
    isSaving: false,
    saveReferenceData: async () => undefined,
    saveSettings: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      referenceData: demoReferenceData[propertyCode],
      settings: demoPropertySettings[propertyCode],
      users: demoManagedUsers[propertyCode],
      source: "fallback",
      isLoading: true,
      isSaving: false,
      saveReferenceData: state.saveReferenceData,
      saveSettings: state.saveSettings
    });

    void Promise.all([
      fetchReferenceData(propertyCode),
      fetchPropertySettings(propertyCode),
      fetchManagedUsers(propertyCode)
    ])
      .then(([referenceData, settings, users]) => {
        if (isMounted) {
          setState({
            referenceData,
            settings,
            users,
            source: "api",
            isLoading: false,
            isSaving: false,
            saveReferenceData: state.saveReferenceData,
            saveSettings: state.saveSettings
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            referenceData: demoReferenceData[propertyCode],
            settings: demoPropertySettings[propertyCode],
            users: demoManagedUsers[propertyCode],
            source: "fallback",
            isLoading: false,
            isSaving: false,
            saveReferenceData: state.saveReferenceData,
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

  async function saveReferenceData(update: ReferenceDataset): Promise<void> {
    setState((current) => ({
      ...current,
      isSaving: true
    }));

    try {
      const referenceData = await updateReferenceData(propertyCode, update);
      setState((current) => ({
        ...current,
        referenceData,
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({
        ...current,
        isSaving: false
      }));
      throw new Error("reference_data.update_failed");
    }
  }

  return {
    ...state,
    saveReferenceData,
    saveSettings
  };
}
