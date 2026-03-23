import type {
  CmmsSyncList,
  CmmsSyncRequest,
  FileServiceRequest,
  FileServiceList,
  NotificationList,
  NotificationUpdate,
  PowerBiEmbedList,
  PowerBiSessionList,
  PropertyCode
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  createCmmsSync,
  createFileRequest,
  createPowerBiSession,
  fetchCmmsSync,
  fetchFiles,
  fetchNotifications,
  fetchPowerBi,
  fetchPowerBiSessions,
  updateNotification
} from "../lib/api.js";
import { demoFiles, demoNotifications, demoPowerBi } from "../lib/session.js";

interface PlatformDataState {
  cmmsSync: CmmsSyncList;
  files: FileServiceList;
  notifications: NotificationList;
  powerBi: PowerBiEmbedList;
  powerBiSessions: PowerBiSessionList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  createCmmsSync: (input: CmmsSyncRequest) => Promise<void>;
  createFileRequest: (input: FileServiceRequest) => Promise<void>;
  createPowerBiSession: (reportId: string) => Promise<void>;
  saveNotification: (notificationId: string, update: NotificationUpdate) => Promise<void>;
}

export function usePlatformData(propertyCode: PropertyCode): PlatformDataState {
  const [state, setState] = useState<PlatformDataState>({
    cmmsSync: { items: [] },
    files: demoFiles[propertyCode],
    notifications: demoNotifications[propertyCode],
    powerBi: demoPowerBi[propertyCode],
    powerBiSessions: { items: [] },
    source: "fallback",
    isLoading: true,
    isSaving: false,
    createCmmsSync: async () => undefined,
    createFileRequest: async () => undefined,
    createPowerBiSession: async () => undefined,
    saveNotification: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      cmmsSync: { items: [] },
      files: demoFiles[propertyCode],
      notifications: demoNotifications[propertyCode],
      powerBi: demoPowerBi[propertyCode],
      powerBiSessions: { items: [] },
      source: "fallback",
      isLoading: true,
      isSaving: false,
      createCmmsSync: state.createCmmsSync,
      createFileRequest: state.createFileRequest,
      createPowerBiSession: state.createPowerBiSession,
      saveNotification: state.saveNotification
    });

    void Promise.all([
      fetchCmmsSync(propertyCode),
      fetchFiles(propertyCode),
      fetchNotifications(propertyCode),
      fetchPowerBi(propertyCode),
      fetchPowerBiSessions(propertyCode)
    ])
      .then(([cmmsSync, files, notifications, powerBi, powerBiSessions]) => {
        if (isMounted) {
          setState({
            cmmsSync,
            files,
            notifications,
            powerBi,
            powerBiSessions,
            source: "api",
            isLoading: false,
            isSaving: false,
            createCmmsSync: state.createCmmsSync,
            createFileRequest: state.createFileRequest,
            createPowerBiSession: state.createPowerBiSession,
            saveNotification: state.saveNotification
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            cmmsSync: { items: [] },
            files: demoFiles[propertyCode],
            notifications: demoNotifications[propertyCode],
            powerBi: demoPowerBi[propertyCode],
            powerBiSessions: { items: [] },
            source: "fallback",
            isLoading: false,
            isSaving: false,
            createCmmsSync: state.createCmmsSync,
            createFileRequest: state.createFileRequest,
            createPowerBiSession: state.createPowerBiSession,
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

  async function queueFileRequest(input: FileServiceRequest): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const created = await createFileRequest(propertyCode, input);
      setState((current) => ({
        ...current,
        files: {
          items: [created, ...current.files.items]
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("file_request.create_failed");
    }
  }

  async function issuePowerBiSession(reportId: string): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const created = await createPowerBiSession(propertyCode, reportId);
      setState((current) => ({
        ...current,
        powerBiSessions: {
          items: [created, ...current.powerBiSessions.items]
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("power_bi_session.create_failed");
    }
  }

  async function queueCmmsSync(input: CmmsSyncRequest): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const created = await createCmmsSync(propertyCode, input);
      setState((current) => ({
        ...current,
        cmmsSync: {
          items: [created, ...current.cmmsSync.items]
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("cmms_sync.create_failed");
    }
  }

  return {
    ...state,
    createCmmsSync: queueCmmsSync,
    createFileRequest: queueFileRequest,
    createPowerBiSession: issuePowerBiSession,
    saveNotification
  };
}
