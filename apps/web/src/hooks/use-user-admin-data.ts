import type {
  ManagedUserDetail,
  PropertyCode,
  UserPermissionGroupUpdate,
  UserPropertyAccessUpdate,
  UserAdminActionList
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  fetchManagedUserDetail,
  fetchUserAdminActions,
  updateManagedUserPermissionGroups,
  updateManagedUserPropertyAccess
} from "../lib/api.js";
import { demoUserAdminActions, demoUserDetails } from "../lib/session.js";

interface UserAdminDataState {
  detail: ManagedUserDetail;
  actions: UserAdminActionList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  savePropertyAccess: (update: UserPropertyAccessUpdate) => Promise<void>;
  savePermissionGroups: (update: UserPermissionGroupUpdate) => Promise<void>;
}

export function useUserAdminData(
  propertyCode: PropertyCode,
  userId: string
): UserAdminDataState {
  const [state, setState] = useState<UserAdminDataState>({
    detail: demoUserDetails[propertyCode],
    actions: demoUserAdminActions,
    source: "fallback",
    isLoading: true,
    isSaving: false,
    savePropertyAccess: async () => undefined,
    savePermissionGroups: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      detail: demoUserDetails[propertyCode],
      actions: demoUserAdminActions,
      source: "fallback",
      isLoading: true,
      isSaving: false,
      savePropertyAccess: state.savePropertyAccess,
      savePermissionGroups: state.savePermissionGroups
    });

    void Promise.all([
      fetchManagedUserDetail(propertyCode, userId),
      fetchUserAdminActions(propertyCode, userId)
    ])
      .then(([detail, actions]) => {
        if (isMounted) {
          setState({
            detail,
            actions,
            source: "api",
            isLoading: false,
            isSaving: false,
            savePropertyAccess: state.savePropertyAccess,
            savePermissionGroups: state.savePermissionGroups
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            detail: demoUserDetails[propertyCode],
            actions: demoUserAdminActions,
            source: "fallback",
            isLoading: false,
            isSaving: false,
            savePropertyAccess: state.savePropertyAccess,
            savePermissionGroups: state.savePermissionGroups
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode, userId]);

  async function savePropertyAccess(update: UserPropertyAccessUpdate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const detail = await updateManagedUserPropertyAccess(propertyCode, userId, update);
      setState((current) => ({
        ...current,
        detail,
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("user_access.update_failed");
    }
  }

  async function savePermissionGroups(update: UserPermissionGroupUpdate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const detail = await updateManagedUserPermissionGroups(propertyCode, userId, update);
      setState((current) => ({
        ...current,
        detail,
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("user_groups.update_failed");
    }
  }

  return {
    ...state,
    savePropertyAccess,
    savePermissionGroups
  };
}
