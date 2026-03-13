import type {
  PermissionGroupList,
  PropertyCode,
  ReportConfigList,
  ReportConfigUpdate
} from "@tps/types";
import { useEffect, useState } from "react";

import { fetchPermissionGroups, fetchReportConfig, updateReportConfig } from "../lib/api.js";
import { demoPermissionGroups, demoReportConfig } from "../lib/session.js";

interface AdminDataState {
  permissionGroups: PermissionGroupList;
  reportConfig: ReportConfigList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  saveReportConfig: (reportId: string, update: ReportConfigUpdate) => Promise<void>;
}

export function useAdminData(propertyCode: PropertyCode): AdminDataState {
  const [state, setState] = useState<AdminDataState>({
    permissionGroups: demoPermissionGroups[propertyCode],
    reportConfig: demoReportConfig[propertyCode],
    source: "fallback",
    isLoading: true,
    isSaving: false,
    saveReportConfig: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      permissionGroups: demoPermissionGroups[propertyCode],
      reportConfig: demoReportConfig[propertyCode],
      source: "fallback",
      isLoading: true,
      isSaving: false,
      saveReportConfig: state.saveReportConfig
    });

    void Promise.all([
      fetchPermissionGroups(propertyCode),
      fetchReportConfig(propertyCode)
    ])
      .then(([permissionGroups, reportConfig]) => {
        if (isMounted) {
          setState({
            permissionGroups,
            reportConfig,
            source: "api",
            isLoading: false,
            isSaving: false,
            saveReportConfig: state.saveReportConfig
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            permissionGroups: demoPermissionGroups[propertyCode],
            reportConfig: demoReportConfig[propertyCode],
            source: "fallback",
            isLoading: false,
            isSaving: false,
            saveReportConfig: state.saveReportConfig
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode]);

  async function saveReportConfig(reportId: string, update: ReportConfigUpdate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await updateReportConfig(propertyCode, reportId, update);
      setState((current) => ({
        ...current,
        reportConfig: {
          items: current.reportConfig.items.map((item) => (item.id === reportId ? updated : item))
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("report_config.update_failed");
    }
  }

  return {
    ...state,
    saveReportConfig
  };
}
