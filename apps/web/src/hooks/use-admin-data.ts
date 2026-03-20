import type {
  DelayCommonLocationList,
  DelayCommonLocationUpdate,
  DelayTemplateList,
  DelayTemplateUpdate,
  PermissionGroupList,
  PermissionGroupUpdate,
  PropertyCode,
  ReportConfigList,
  ReportConfigUpdate,
  SpecialMovementList,
  SpecialMovementUpdate
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  fetchAdminDelayCommonLocations,
  fetchAdminDelayTemplates,
  fetchAdminSpecialMovements,
  fetchPermissionGroups,
  fetchReportConfig,
  updatePermissionGroupDefinition,
  updateAdminDelayCommonLocation,
  updateAdminDelayTemplate,
  updateAdminSpecialMovement,
  updateReportConfig
} from "../lib/api.js";
import {
  demoDelayCommonLocations,
  demoDelayTemplates,
  demoPermissionGroups,
  demoReportConfig,
  demoSpecialMovements
} from "../lib/session.js";

interface AdminDataState {
  delayCommonLocations: DelayCommonLocationList;
  delayTemplates: DelayTemplateList;
  permissionGroups: PermissionGroupList;
  reportConfig: ReportConfigList;
  specialMovements: SpecialMovementList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  savePermissionGroup: (groupId: string, update: PermissionGroupUpdate) => Promise<void>;
  saveDelayCommonLocation: (locationId: string, update: DelayCommonLocationUpdate) => Promise<void>;
  saveDelayTemplate: (templateId: string, update: DelayTemplateUpdate) => Promise<void>;
  saveReportConfig: (reportId: string, update: ReportConfigUpdate) => Promise<void>;
  saveSpecialMovement: (movementId: string, update: SpecialMovementUpdate) => Promise<void>;
}

export function useAdminData(propertyCode: PropertyCode): AdminDataState {
  const [state, setState] = useState<AdminDataState>({
    delayCommonLocations: demoDelayCommonLocations[propertyCode],
    delayTemplates: demoDelayTemplates[propertyCode],
    permissionGroups: demoPermissionGroups[propertyCode],
    reportConfig: demoReportConfig[propertyCode],
    specialMovements: demoSpecialMovements[propertyCode],
    source: "fallback",
    isLoading: true,
    isSaving: false,
    savePermissionGroup: async () => undefined,
    saveDelayCommonLocation: async () => undefined,
    saveDelayTemplate: async () => undefined,
    saveReportConfig: async () => undefined,
    saveSpecialMovement: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      delayCommonLocations: demoDelayCommonLocations[propertyCode],
      delayTemplates: demoDelayTemplates[propertyCode],
      permissionGroups: demoPermissionGroups[propertyCode],
      reportConfig: demoReportConfig[propertyCode],
      specialMovements: demoSpecialMovements[propertyCode],
      source: "fallback",
      isLoading: true,
      isSaving: false,
      savePermissionGroup: state.savePermissionGroup,
      saveDelayCommonLocation: state.saveDelayCommonLocation,
      saveDelayTemplate: state.saveDelayTemplate,
      saveReportConfig: state.saveReportConfig,
      saveSpecialMovement: state.saveSpecialMovement
    });

    void Promise.all([
      fetchAdminDelayCommonLocations(propertyCode),
      fetchAdminDelayTemplates(propertyCode),
      fetchAdminSpecialMovements(propertyCode),
      fetchPermissionGroups(propertyCode),
      fetchReportConfig(propertyCode)
    ])
      .then(([delayCommonLocations, delayTemplates, specialMovements, permissionGroups, reportConfig]) => {
        if (isMounted) {
          setState({
            delayCommonLocations,
            delayTemplates,
            permissionGroups,
            reportConfig,
            specialMovements,
            source: "api",
            isLoading: false,
            isSaving: false,
            savePermissionGroup: state.savePermissionGroup,
            saveDelayCommonLocation: state.saveDelayCommonLocation,
            saveDelayTemplate: state.saveDelayTemplate,
            saveReportConfig: state.saveReportConfig,
            saveSpecialMovement: state.saveSpecialMovement
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            delayCommonLocations: demoDelayCommonLocations[propertyCode],
            delayTemplates: demoDelayTemplates[propertyCode],
            permissionGroups: demoPermissionGroups[propertyCode],
            reportConfig: demoReportConfig[propertyCode],
            specialMovements: demoSpecialMovements[propertyCode],
            source: "fallback",
            isLoading: false,
            isSaving: false,
            savePermissionGroup: state.savePermissionGroup,
            saveDelayCommonLocation: state.saveDelayCommonLocation,
            saveDelayTemplate: state.saveDelayTemplate,
            saveReportConfig: state.saveReportConfig,
            saveSpecialMovement: state.saveSpecialMovement
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode]);

  async function savePermissionGroup(groupId: string, update: PermissionGroupUpdate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await updatePermissionGroupDefinition(propertyCode, groupId, update);
      setState((current) => ({
        ...current,
        permissionGroups: {
          items: current.permissionGroups.items.map((item) =>
            item.id === groupId ? { ...item, ...update } : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("permission_group.update_failed");
    }
  }

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

  async function saveDelayCommonLocation(
    locationId: string,
    update: DelayCommonLocationUpdate
  ): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await updateAdminDelayCommonLocation(propertyCode, locationId, update);
      setState((current) => ({
        ...current,
        delayCommonLocations: {
          items: current.delayCommonLocations.items.map((item) =>
            item.id === locationId ? { ...item, ...update } : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("delay_common_location.update_failed");
    }
  }

  async function saveDelayTemplate(templateId: string, update: DelayTemplateUpdate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await updateAdminDelayTemplate(propertyCode, templateId, update);
      setState((current) => ({
        ...current,
        delayTemplates: {
          items: current.delayTemplates.items.map((item) =>
            item.id === templateId ? { id: item.id, ...update } : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("delay_template.update_failed");
    }
  }

  async function saveSpecialMovement(
    movementId: string,
    update: SpecialMovementUpdate
  ): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await updateAdminSpecialMovement(propertyCode, movementId, update);
      setState((current) => ({
        ...current,
        specialMovements: {
          items: current.specialMovements.items.map((item) =>
            item.id === movementId ? { ...item, ...update } : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("special_movement.update_failed");
    }
  }

  return {
    ...state,
    savePermissionGroup,
    saveDelayCommonLocation,
    saveDelayTemplate,
    saveReportConfig,
    saveSpecialMovement
  };
}
