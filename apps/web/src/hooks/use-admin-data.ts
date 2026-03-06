import type { PermissionGroupList, PropertyCode, ReportConfigList } from "@tps/types";
import { useEffect, useState } from "react";

import { fetchPermissionGroups, fetchReportConfig } from "../lib/api.js";
import { demoPermissionGroups, demoReportConfig } from "../lib/session.js";

interface AdminDataState {
  permissionGroups: PermissionGroupList;
  reportConfig: ReportConfigList;
  source: "api" | "fallback";
  isLoading: boolean;
}

export function useAdminData(propertyCode: PropertyCode): AdminDataState {
  const [state, setState] = useState<AdminDataState>({
    permissionGroups: demoPermissionGroups[propertyCode],
    reportConfig: demoReportConfig[propertyCode],
    source: "fallback",
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      permissionGroups: demoPermissionGroups[propertyCode],
      reportConfig: demoReportConfig[propertyCode],
      source: "fallback",
      isLoading: true
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
            isLoading: false
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            permissionGroups: demoPermissionGroups[propertyCode],
            reportConfig: demoReportConfig[propertyCode],
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
