import type {
  ManagedUserCreate,
  ManagedUserDetail,
  ManagedUserList,
  PropertyCode,
  ReferenceDataset,
  PropertySettings,
  PropertySettingsUpdate
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  createManagedUser,
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
  createUser: (input: ManagedUserCreate) => Promise<ManagedUserDetail>;
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
    createUser: async () => {
      throw new Error("user.create_unavailable");
    },
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
      createUser: state.createUser,
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
            createUser: state.createUser,
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
            createUser: state.createUser,
            saveReferenceData: state.saveReferenceData,
            saveSettings: state.saveSettings
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode]);

  async function createUserAndRefresh(input: ManagedUserCreate): Promise<ManagedUserDetail> {
    setState((current) => ({
      ...current,
      isSaving: true
    }));

    try {
      const detail = await createManagedUser(propertyCode, input);
      setState((current) => ({
        ...current,
        users: {
          items: [...current.users.items, {
            id: detail.id,
            displayName: detail.displayName,
            email: detail.email,
            status: detail.status,
            roleLabel: detail.roleLabel,
            lastSeen: detail.lastSeen
          }]
        },
        source: "api",
        isSaving: false
      }));
      return detail;
    } catch {
      setState((current) => ({
        ...current,
        isSaving: false
      }));
      throw new Error("user.create_failed");
    }
  }

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
    createUser: createUserAndRefresh,
    saveReferenceData,
    saveSettings
  };
}
