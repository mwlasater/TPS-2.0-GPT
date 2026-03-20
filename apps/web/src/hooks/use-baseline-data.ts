import type {
  AttendanceExceptionList,
  AttendanceExceptionUpdate,
  AttendanceHistoryList,
  AttendanceIssueList,
  AttendanceIssueUpdate,
  AttendanceNotificationRuleCreate,
  AttendanceNotificationRuleList,
  AttendanceNotificationRuleUpdate,
  JobProfileList,
  JobProfileUpdate,
  PersonnelRecordList,
  PersonnelStatusUpdate,
  PropertyCode
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  createAttendanceNotificationRule,
  deleteAttendanceNotificationRule,
  fetchAttendanceExceptions,
  fetchAttendanceHistory,
  fetchAttendanceIssues,
  fetchAttendanceNotificationRules,
  fetchJobProfiles,
  fetchPersonnelRecords,
  updateAttendanceException,
  updateAttendanceIssue,
  updateAttendanceNotificationRule,
  updateJobProfile,
  updatePersonnelStatus
} from "../lib/api.js";
import {
  demoAttendanceExceptions,
  demoAttendanceIssues,
  demoAttendanceNotificationRules,
  demoJobProfiles,
  demoPersonnelRecords,
  getDemoAttendanceHistory
} from "../lib/session.js";

interface BaselineDataState {
  attendance: AttendanceExceptionList;
  attendanceHistory: AttendanceHistoryList;
  attendanceIssues: AttendanceIssueList;
  attendanceNotificationRules: AttendanceNotificationRuleList;
  jobProfiles: JobProfileList;
  personnel: PersonnelRecordList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  saveJobProfile: (profileId: string, update: JobProfileUpdate) => Promise<void>;
  savePersonnelStatus: (personnelId: string, update: PersonnelStatusUpdate) => Promise<void>;
  saveAttendance: (exceptionId: string, update: AttendanceExceptionUpdate) => Promise<void>;
  saveAttendanceIssue: (issueId: string, update: AttendanceIssueUpdate) => Promise<void>;
  createAttendanceNotificationRule: (input: AttendanceNotificationRuleCreate) => Promise<void>;
  saveAttendanceNotificationRule: (ruleId: string, update: AttendanceNotificationRuleUpdate) => Promise<void>;
  deleteAttendanceNotificationRule: (ruleId: string) => Promise<void>;
}

export function useBaselineData(propertyCode: PropertyCode): BaselineDataState {
  const [state, setState] = useState<BaselineDataState>({
    attendance: demoAttendanceExceptions[propertyCode],
    attendanceHistory: getDemoAttendanceHistory(propertyCode, demoPersonnelRecords[propertyCode].items[0]?.id ?? ""),
    attendanceIssues: demoAttendanceIssues[propertyCode],
    attendanceNotificationRules: demoAttendanceNotificationRules[propertyCode],
    jobProfiles: demoJobProfiles[propertyCode],
    personnel: demoPersonnelRecords[propertyCode],
    source: "fallback",
    isLoading: true,
    isSaving: false,
    saveJobProfile: async () => undefined,
    savePersonnelStatus: async () => undefined,
    saveAttendance: async () => undefined,
    saveAttendanceIssue: async () => undefined,
    createAttendanceNotificationRule: async () => undefined,
    saveAttendanceNotificationRule: async () => undefined,
    deleteAttendanceNotificationRule: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;
    const defaultEmployeeId = demoPersonnelRecords[propertyCode].items[0]?.id ?? "";

    setState({
      attendance: demoAttendanceExceptions[propertyCode],
      attendanceHistory: getDemoAttendanceHistory(propertyCode, defaultEmployeeId),
      attendanceIssues: demoAttendanceIssues[propertyCode],
      attendanceNotificationRules: demoAttendanceNotificationRules[propertyCode],
      jobProfiles: demoJobProfiles[propertyCode],
      personnel: demoPersonnelRecords[propertyCode],
      source: "fallback",
      isLoading: true,
      isSaving: false,
      saveJobProfile,
      savePersonnelStatus,
      saveAttendance,
      saveAttendanceIssue,
      createAttendanceNotificationRule: createAttendanceRule,
      saveAttendanceNotificationRule,
      deleteAttendanceNotificationRule: removeAttendanceRule
    });

    void Promise.all([
      fetchJobProfiles(propertyCode),
      fetchAttendanceExceptions(propertyCode),
      fetchAttendanceIssues(propertyCode),
      fetchAttendanceNotificationRules(propertyCode),
      fetchPersonnelRecords(propertyCode)
    ])
      .then(async ([jobProfiles, attendance, attendanceIssues, attendanceNotificationRules, personnel]) => {
        const selectedEmployeeId = personnel.items[0]?.id ?? defaultEmployeeId;
        const attendanceHistory = selectedEmployeeId
          ? await fetchAttendanceHistory(propertyCode, selectedEmployeeId)
          : getDemoAttendanceHistory(propertyCode, selectedEmployeeId);

        if (isMounted) {
          setState({
            attendance,
            attendanceHistory,
            attendanceIssues,
            attendanceNotificationRules,
            jobProfiles,
            personnel,
            source: "api",
            isLoading: false,
            isSaving: false,
            saveJobProfile,
            savePersonnelStatus,
            saveAttendance,
            saveAttendanceIssue,
            createAttendanceNotificationRule: createAttendanceRule,
            saveAttendanceNotificationRule,
            deleteAttendanceNotificationRule: removeAttendanceRule
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            attendance: demoAttendanceExceptions[propertyCode],
            attendanceHistory: getDemoAttendanceHistory(propertyCode, defaultEmployeeId),
            attendanceIssues: demoAttendanceIssues[propertyCode],
            attendanceNotificationRules: demoAttendanceNotificationRules[propertyCode],
            jobProfiles: demoJobProfiles[propertyCode],
            personnel: demoPersonnelRecords[propertyCode],
            source: "fallback",
            isLoading: false,
            isSaving: false,
            saveJobProfile,
            savePersonnelStatus,
            saveAttendance,
            saveAttendanceIssue,
            createAttendanceNotificationRule: createAttendanceRule,
            saveAttendanceNotificationRule,
            deleteAttendanceNotificationRule: removeAttendanceRule
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode]);

  async function saveJobProfile(profileId: string, update: JobProfileUpdate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await updateJobProfile(propertyCode, profileId, update);
      setState((current) => ({
        ...current,
        jobProfiles: {
          items: current.jobProfiles.items.map((item) => (item.id === profileId ? updated : item))
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("job_profile.update_failed");
    }
  }

  async function saveAttendance(exceptionId: string, update: AttendanceExceptionUpdate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await updateAttendanceException(propertyCode, exceptionId, update);
      setState((current) => ({
        ...current,
        attendance: {
          items: current.attendance.items.map((item) => (item.id === exceptionId ? updated : item))
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("attendance.update_failed");
    }
  }

  async function saveAttendanceIssue(issueId: string, update: AttendanceIssueUpdate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await updateAttendanceIssue(propertyCode, issueId, update);
      const attendanceHistory = await fetchAttendanceHistory(propertyCode, updated.employeeId);
      setState((current) => ({
        ...current,
        attendanceIssues: {
          items: current.attendanceIssues.items.map((item) => (item.id === issueId ? updated : item))
        },
        attendance: {
          items: current.attendance.items.map((item) =>
            item.id === issueId
              ? {
                  ...item,
                  employeeId: updated.employeeId,
                  employeeName: updated.employeeName,
                  exceptionType: updated.issueType === "tardiness" ? "tardy" : "absence",
                  startDate: updated.startDate,
                  endDate: updated.endDate,
                  status: updated.status,
                  notes: updated.notes
                }
              : item
          )
        },
        attendanceHistory,
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("attendance_issue.update_failed");
    }
  }

  async function savePersonnelStatus(
    personnelId: string,
    update: PersonnelStatusUpdate
  ): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await updatePersonnelStatus(propertyCode, personnelId, update);
      const attendanceHistory = await fetchAttendanceHistory(propertyCode, personnelId)
        .catch(() => getDemoAttendanceHistory(propertyCode, personnelId));
      setState((current) => ({
        ...current,
        personnel: {
          items: current.personnel.items.map((item) => (item.id === personnelId ? updated : item))
        },
        attendanceHistory,
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("personnel.update_failed");
    }
  }

  async function createAttendanceRule(input: AttendanceNotificationRuleCreate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const created = await createAttendanceNotificationRule(propertyCode, input);
      setState((current) => ({
        ...current,
        attendanceNotificationRules: {
          items: [created, ...current.attendanceNotificationRules.items]
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("attendance_notification_rule.create_failed");
    }
  }

  async function saveAttendanceNotificationRule(
    ruleId: string,
    update: AttendanceNotificationRuleUpdate
  ): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await updateAttendanceNotificationRule(propertyCode, ruleId, update);
      setState((current) => ({
        ...current,
        attendanceNotificationRules: {
          items: current.attendanceNotificationRules.items.map((item) =>
            item.id === ruleId ? updated : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("attendance_notification_rule.update_failed");
    }
  }

  async function removeAttendanceRule(ruleId: string): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await deleteAttendanceNotificationRule(propertyCode, ruleId);
      setState((current) => ({
        ...current,
        attendanceNotificationRules: {
          items: current.attendanceNotificationRules.items.filter((item) => item.id !== ruleId)
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("attendance_notification_rule.delete_failed");
    }
  }

  return {
    ...state,
    saveJobProfile,
    savePersonnelStatus,
    saveAttendance,
    saveAttendanceIssue,
    createAttendanceNotificationRule: createAttendanceRule,
    saveAttendanceNotificationRule,
    deleteAttendanceNotificationRule: removeAttendanceRule
  };
}
