import type {
  FileServiceList,
  NotificationList,
  NotificationUpdate,
  PowerBiEmbedList,
  PropertyCode
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  fetchFiles,
  fetchNotifications,
  fetchPowerBi,
  updateNotification
} from "../lib/api.js";
import { demoFiles, demoNotifications, demoPowerBi } from "../lib/session.js";

interface PlatformDataState {
  files: FileServiceList;
  notifications: NotificationList;
  powerBi: PowerBiEmbedList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  saveNotification: (notificationId: string, update: NotificationUpdate) => Promise<void>;
}

export function usePlatformData(propertyCode: PropertyCode): PlatformDataState {
  const [state, setState] = useState<PlatformDataState>({
    files: demoFiles[propertyCode],
    notifications: demoNotifications[propertyCode],
    powerBi: demoPowerBi[propertyCode],
    source: "fallback",
    isLoading: true,
    isSaving: false,
    saveNotification: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      files: demoFiles[propertyCode],
      notifications: demoNotifications[propertyCode],
      powerBi: demoPowerBi[propertyCode],
      source: "fallback",
      isLoading: true,
      isSaving: false,
      saveNotification: state.saveNotification
    });

    void Promise.all([
      fetchFiles(propertyCode),
      fetchNotifications(propertyCode),
      fetchPowerBi(propertyCode)
    ])
      .then(([files, notifications, powerBi]) => {
        if (isMounted) {
          setState({
            files,
            notifications,
            powerBi,
            source: "api",
            isLoading: false,
            isSaving: false,
            saveNotification: state.saveNotification
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            files: demoFiles[propertyCode],
            notifications: demoNotifications[propertyCode],
            powerBi: demoPowerBi[propertyCode],
            source: "fallback",
            isLoading: false,
            isSaving: false,
            saveNotification: state.saveNotification
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode]);

  async function saveNotification(
    notificationId: string,
    update: NotificationUpdate
  ): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await updateNotification(propertyCode, notificationId, update);
      setState((current) => ({
        ...current,
        notifications: {
          items: current.notifications.items.map((item) =>
            item.id === notificationId ? updated : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("notification.update_failed");
    }
  }

  return {
    ...state,
    saveNotification
  };
}
