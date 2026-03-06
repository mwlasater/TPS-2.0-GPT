import type {
  ConsistEquipmentList,
  CrewAssignmentList,
  DelayEventList,
  PropertyCode,
  ReferenceDataset,
  StationStopList,
  TrainRunList,
  TrainScheduleList
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  fetchConsistEquipment,
  fetchCrewAssignments,
  fetchDelayEvents,
  fetchReferenceData,
  fetchStationStops,
  fetchTrainRuns,
  fetchTrainSchedules
} from "../lib/api.js";
import {
  demoConsistEquipment,
  demoCrewAssignments,
  demoDelayEvents,
  demoReferenceData,
  demoStationStops,
  demoTrainRuns,
  demoTrainSchedules
} from "../lib/session.js";

interface OperationsDataState {
  referenceData: ReferenceDataset;
  schedules: TrainScheduleList;
  runs: TrainRunList;
  delayEvents: DelayEventList;
  consist: ConsistEquipmentList;
  crew: CrewAssignmentList;
  stationStops: StationStopList;
  source: "api" | "fallback";
  isLoading: boolean;
}

export function useOperationsData(propertyCode: PropertyCode): OperationsDataState {
  const [state, setState] = useState<OperationsDataState>({
    referenceData: demoReferenceData[propertyCode],
    schedules: demoTrainSchedules[propertyCode],
    runs: demoTrainRuns[propertyCode],
    consist: demoConsistEquipment[propertyCode],
    crew: demoCrewAssignments[propertyCode],
    delayEvents: demoDelayEvents[propertyCode],
    stationStops: demoStationStops[propertyCode],
    source: "fallback",
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      referenceData: demoReferenceData[propertyCode],
      schedules: demoTrainSchedules[propertyCode],
      runs: demoTrainRuns[propertyCode],
      consist: demoConsistEquipment[propertyCode],
      crew: demoCrewAssignments[propertyCode],
      delayEvents: demoDelayEvents[propertyCode],
      stationStops: demoStationStops[propertyCode],
      source: "fallback",
      isLoading: true
    });

    void Promise.all([
      fetchReferenceData(propertyCode),
      fetchTrainSchedules(propertyCode),
      fetchTrainRuns(propertyCode)
    ])
      .then(async ([referenceData, schedules, runs]) => {
        const firstRunId = runs.items[0]?.id;
        const [stationStops, delayEvents, consist, crew] = firstRunId
          ? await Promise.all([
              fetchStationStops(propertyCode, firstRunId),
              fetchDelayEvents(propertyCode, firstRunId),
              fetchConsistEquipment(propertyCode, firstRunId),
              fetchCrewAssignments(propertyCode, firstRunId)
            ])
          : [
              demoStationStops[propertyCode],
              demoDelayEvents[propertyCode],
              demoConsistEquipment[propertyCode],
              demoCrewAssignments[propertyCode]
            ];

        if (isMounted) {
          setState({
            referenceData,
            schedules,
            runs,
            consist,
            crew,
            delayEvents,
            stationStops,
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
            consist: demoConsistEquipment[propertyCode],
            crew: demoCrewAssignments[propertyCode],
            delayEvents: demoDelayEvents[propertyCode],
            stationStops: demoStationStops[propertyCode],
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
