import type {
  UserAdminHistoryList,
  ManagedUserDetail,
  ManagedUserList,
  PropertyCode,
  UserPermissionGroupUpdate,
  UserPropertyAccessUpdate,
  UserAdminActionList
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  executeUserAdminAction,
  fetchManagedUserDetail,
  fetchUserAdminHistory,
  fetchUserAdminActions,
  updateManagedUserPermissionGroups,
  updateManagedUserPropertyAccess
} from "../lib/api.js";
import {
  demoUserAdminActions,
  getDemoUserAdminHistory,
  getDemoUserDetail
} from "../lib/session.js";

interface UserAdminDataState {
  detail: ManagedUserDetail;
  history: UserAdminHistoryList;
  actions: UserAdminActionList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  runAdminAction: (actionId: string) => Promise<void>;
  savePropertyAccess: (update: UserPropertyAccessUpdate) => Promise<void>;
  savePermissionGroups: (update: UserPermissionGroupUpdate) => Promise<void>;
}

export function useUserAdminData(
  propertyCode: PropertyCode,
  userId: string,
  users: ManagedUserList
): UserAdminDataState {
  const [state, setState] = useState<UserAdminDataState>({
    detail: getDemoUserDetail(propertyCode, userId),
    history: getDemoUserAdminHistory(propertyCode, userId),
    actions: demoUserAdminActions,
    source: "fallback",
    isLoading: true,
    isSaving: false,
    runAdminAction: async () => undefined,
    savePropertyAccess: async () => undefined,
      savePermissionGroups: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;
    const selectedUserId = users.items.some((user) => user.id === userId)
      ? userId
      : users.items[0]?.id ?? userId;

    setState({
      detail: getDemoUserDetail(propertyCode, selectedUserId),
      history: getDemoUserAdminHistory(propertyCode, selectedUserId),
      actions: demoUserAdminActions,
      source: "fallback",
      isLoading: true,
      isSaving: false,
      runAdminAction: state.runAdminAction,
      savePropertyAccess: state.savePropertyAccess,
      savePermissionGroups: state.savePermissionGroups
    });

    void Promise.all([
      fetchManagedUserDetail(propertyCode, selectedUserId),
      fetchUserAdminHistory(propertyCode, selectedUserId),
      fetchUserAdminActions(propertyCode, selectedUserId)
    ])
      .then(([detail, history, actions]) => {
        if (isMounted) {
          setState({
            detail,
            history,
            actions,
            source: "api",
            isLoading: false,
            isSaving: false,
            runAdminAction: state.runAdminAction,
            savePropertyAccess: state.savePropertyAccess,
            savePermissionGroups: state.savePermissionGroups
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            detail: getDemoUserDetail(propertyCode, selectedUserId),
            history: getDemoUserAdminHistory(propertyCode, selectedUserId),
            actions: demoUserAdminActions,
            source: "fallback",
            isLoading: false,
            isSaving: false,
            runAdminAction: state.runAdminAction,
            savePropertyAccess: state.savePropertyAccess,
            savePermissionGroups: state.savePermissionGroups
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode, userId, users]);

  async function savePropertyAccess(update: UserPropertyAccessUpdate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const detail = await updateManagedUserPropertyAccess(propertyCode, userId, update);
      const history = await fetchUserAdminHistory(propertyCode, userId);
      setState((current) => ({
        ...current,
        detail,
        history,
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
      const history = await fetchUserAdminHistory(propertyCode, userId);
      setState((current) => ({
        ...current,
        detail,
        history,
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("user_groups.update_failed");
    }
  }

  async function runAdminAction(actionId: string): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const detail = await executeUserAdminAction(propertyCode, userId, actionId);
      const history = await fetchUserAdminHistory(propertyCode, userId);
      setState((current) => ({
        ...current,
        detail,
        history,
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("user_action.execute_failed");
    }
  }

  return {
    ...state,
    runAdminAction,
    savePropertyAccess,
    savePermissionGroups
  };
}
