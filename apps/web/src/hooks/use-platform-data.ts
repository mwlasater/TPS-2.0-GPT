import type {
  FileServiceList,
  NotificationList,
  PowerBiEmbedList,
  PropertyCode
} from "@tps/types";
import { useEffect, useState } from "react";

import { fetchFiles, fetchNotifications, fetchPowerBi } from "../lib/api.js";
import { demoFiles, demoNotifications, demoPowerBi } from "../lib/session.js";

interface PlatformDataState {
  files: FileServiceList;
  notifications: NotificationList;
  powerBi: PowerBiEmbedList;
  source: "api" | "fallback";
  isLoading: boolean;
}

export function usePlatformData(propertyCode: PropertyCode): PlatformDataState {
  const [state, setState] = useState<PlatformDataState>({
    files: demoFiles[propertyCode],
    notifications: demoNotifications[propertyCode],
    powerBi: demoPowerBi[propertyCode],
    source: "fallback",
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      files: demoFiles[propertyCode],
      notifications: demoNotifications[propertyCode],
      powerBi: demoPowerBi[propertyCode],
      source: "fallback",
      isLoading: true
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
            isLoading: false
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
