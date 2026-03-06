import type {
  AttendanceExceptionList,
  JobProfileList,
  PropertyCode
} from "@tps/types";
import { useEffect, useState } from "react";

import { fetchAttendanceExceptions, fetchJobProfiles } from "../lib/api.js";
import { demoAttendanceExceptions, demoJobProfiles } from "../lib/session.js";

interface BaselineDataState {
  attendance: AttendanceExceptionList;
  jobProfiles: JobProfileList;
  source: "api" | "fallback";
  isLoading: boolean;
}

export function useBaselineData(propertyCode: PropertyCode): BaselineDataState {
  const [state, setState] = useState<BaselineDataState>({
    attendance: demoAttendanceExceptions[propertyCode],
    jobProfiles: demoJobProfiles[propertyCode],
    source: "fallback",
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      attendance: demoAttendanceExceptions[propertyCode],
      jobProfiles: demoJobProfiles[propertyCode],
      source: "fallback",
      isLoading: true
    });

    void Promise.all([
      fetchJobProfiles(propertyCode),
      fetchAttendanceExceptions(propertyCode)
    ])
      .then(([jobProfiles, attendance]) => {
        if (isMounted) {
          setState({
            attendance,
            jobProfiles,
            source: "api",
            isLoading: false
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            attendance: demoAttendanceExceptions[propertyCode],
            jobProfiles: demoJobProfiles[propertyCode],
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
