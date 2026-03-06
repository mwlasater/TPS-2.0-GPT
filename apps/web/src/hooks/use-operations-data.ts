import type {
  PropertyCode,
  ReferenceDataset,
  TrainRunList,
  TrainScheduleList
} from "@tps/types";
import { useEffect, useState } from "react";

import { fetchReferenceData, fetchTrainRuns, fetchTrainSchedules } from "../lib/api.js";
import {
  demoReferenceData,
  demoTrainRuns,
  demoTrainSchedules
} from "../lib/session.js";

interface OperationsDataState {
  referenceData: ReferenceDataset;
  schedules: TrainScheduleList;
  runs: TrainRunList;
  source: "api" | "fallback";
  isLoading: boolean;
}

export function useOperationsData(propertyCode: PropertyCode): OperationsDataState {
  const [state, setState] = useState<OperationsDataState>({
    referenceData: demoReferenceData[propertyCode],
    schedules: demoTrainSchedules[propertyCode],
    runs: demoTrainRuns[propertyCode],
    source: "fallback",
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      referenceData: demoReferenceData[propertyCode],
      schedules: demoTrainSchedules[propertyCode],
      runs: demoTrainRuns[propertyCode],
      source: "fallback",
      isLoading: true
    });

    void Promise.all([
      fetchReferenceData(propertyCode),
      fetchTrainSchedules(propertyCode),
      fetchTrainRuns(propertyCode)
    ])
      .then(([referenceData, schedules, runs]) => {
        if (isMounted) {
          setState({
            referenceData,
            schedules,
            runs,
            source: "api",
            isLoading: false
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            referenceData: demoReferenceData[propertyCode],
            schedules: demoTrainSchedules[propertyCode],
            runs: demoTrainRuns[propertyCode],
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
