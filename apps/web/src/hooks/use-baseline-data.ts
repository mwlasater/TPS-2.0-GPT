import type {
  AttendanceExceptionUpdate,
  AttendanceExceptionList,
  JobProfileUpdate,
  JobProfileList,
  PersonnelRecordList,
  PersonnelStatusUpdate,
  PropertyCode
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  fetchAttendanceExceptions,
  fetchJobProfiles,
  fetchPersonnelRecords,
  updateAttendanceException,
  updateJobProfile,
  updatePersonnelStatus
} from "../lib/api.js";
import { demoAttendanceExceptions, demoJobProfiles, demoPersonnelRecords } from "../lib/session.js";

interface BaselineDataState {
  attendance: AttendanceExceptionList;
  jobProfiles: JobProfileList;
  personnel: PersonnelRecordList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  saveJobProfile: (profileId: string, update: JobProfileUpdate) => Promise<void>;
  savePersonnelStatus: (personnelId: string, update: PersonnelStatusUpdate) => Promise<void>;
  saveAttendance: (exceptionId: string, update: AttendanceExceptionUpdate) => Promise<void>;
}

export function useBaselineData(propertyCode: PropertyCode): BaselineDataState {
  const [state, setState] = useState<BaselineDataState>({
    attendance: demoAttendanceExceptions[propertyCode],
    jobProfiles: demoJobProfiles[propertyCode],
    personnel: demoPersonnelRecords[propertyCode],
    source: "fallback",
    isLoading: true,
    isSaving: false,
    saveJobProfile: async () => undefined,
    savePersonnelStatus: async () => undefined,
    saveAttendance: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      attendance: demoAttendanceExceptions[propertyCode],
      jobProfiles: demoJobProfiles[propertyCode],
      personnel: demoPersonnelRecords[propertyCode],
      source: "fallback",
      isLoading: true,
      isSaving: false,
      saveJobProfile: state.saveJobProfile,
      savePersonnelStatus: state.savePersonnelStatus,
      saveAttendance: state.saveAttendance
    });

    void Promise.all([
      fetchJobProfiles(propertyCode),
      fetchAttendanceExceptions(propertyCode),
      fetchPersonnelRecords(propertyCode)
    ])
      .then(([jobProfiles, attendance, personnel]) => {
        if (isMounted) {
          setState({
            attendance,
            jobProfiles,
            personnel,
            source: "api",
            isLoading: false,
            isSaving: false,
            saveJobProfile: state.saveJobProfile,
            savePersonnelStatus: state.savePersonnelStatus,
            saveAttendance: state.saveAttendance
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            attendance: demoAttendanceExceptions[propertyCode],
            jobProfiles: demoJobProfiles[propertyCode],
            personnel: demoPersonnelRecords[propertyCode],
            source: "fallback",
            isLoading: false,
            isSaving: false,
            saveJobProfile: state.saveJobProfile,
            savePersonnelStatus: state.savePersonnelStatus,
            saveAttendance: state.saveAttendance
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

  async function saveAttendance(
    exceptionId: string,
    update: AttendanceExceptionUpdate
  ): Promise<void> {
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

  async function savePersonnelStatus(
    personnelId: string,
    update: PersonnelStatusUpdate
  ): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await updatePersonnelStatus(propertyCode, personnelId, update);
      setState((current) => ({
        ...current,
        personnel: {
          items: current.personnel.items.map((item) => (item.id === personnelId ? updated : item))
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("personnel.update_failed");
    }
  }

  return {
    ...state,
    saveJobProfile,
    savePersonnelStatus,
    saveAttendance
  };
}
