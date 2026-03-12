import type {
  ConsistEquipmentList,
  CrewAssignmentList,
  DelayEventList,
  DelayEventUpdate,
  FareEnforcementList,
  FareEnforcementUpdate,
  PropertyCode,
  ReferenceDataset,
  StationStopList,
  TrainRun,
  TrainRunApprovalUpdate,
  TrainRunList,
  TrainScheduleList
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  fetchConsistEquipment,
  fetchCrewAssignments,
  fetchDelayEvents,
  fetchFareEnforcement,
  fetchReferenceData,
  fetchStationStops,
  fetchTrainRuns,
  fetchTrainSchedules,
  updateDelayEvent,
  updateFareEnforcement,
  updateTrainRunApproval
} from "../lib/api.js";
import {
  demoConsistEquipment,
  demoCrewAssignments,
  demoDelayEvents,
  demoFareEnforcement,
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
  fareEnforcement: FareEnforcementList;
  consist: ConsistEquipmentList;
  crew: CrewAssignmentList;
  stationStops: StationStopList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  saveRunApproval: (runId: string, update: TrainRunApprovalUpdate) => Promise<TrainRun | undefined>;
  saveDelay: (
    runId: string,
    delayId: string,
    update: DelayEventUpdate
  ) => Promise<DelayEventList["items"][number] | undefined>;
  saveFare: (
    recordId: string,
    update: FareEnforcementUpdate
  ) => Promise<FareEnforcementList["items"][number] | undefined>;
}

export function useOperationsData(propertyCode: PropertyCode): OperationsDataState {
  const [state, setState] = useState<OperationsDataState>({
    referenceData: demoReferenceData[propertyCode],
    schedules: demoTrainSchedules[propertyCode],
    runs: demoTrainRuns[propertyCode],
    consist: demoConsistEquipment[propertyCode],
    crew: demoCrewAssignments[propertyCode],
    delayEvents: demoDelayEvents[propertyCode],
    fareEnforcement: demoFareEnforcement[propertyCode],
    stationStops: demoStationStops[propertyCode],
    source: "fallback",
    isLoading: true,
    isSaving: false,
    saveRunApproval: async () => undefined,
    saveDelay: async () => undefined,
    saveFare: async () => undefined
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
      fareEnforcement: demoFareEnforcement[propertyCode],
      stationStops: demoStationStops[propertyCode],
      source: "fallback",
      isLoading: true,
      isSaving: false,
      saveRunApproval: state.saveRunApproval,
      saveDelay: state.saveDelay,
      saveFare: state.saveFare
    });

    void Promise.all([
      fetchReferenceData(propertyCode),
      fetchTrainSchedules(propertyCode),
      fetchTrainRuns(propertyCode)
    ])
      .then(async ([referenceData, schedules, runs]) => {
        const firstRunId = runs.items[0]?.id;
        const [stationStops, delayEvents, consist, crew, fareEnforcement] = firstRunId
          ? await Promise.all([
              fetchStationStops(propertyCode, firstRunId),
              fetchDelayEvents(propertyCode, firstRunId),
              fetchConsistEquipment(propertyCode, firstRunId),
              fetchCrewAssignments(propertyCode, firstRunId),
              fetchFareEnforcement(propertyCode, firstRunId)
            ])
          : [
              demoStationStops[propertyCode],
              demoDelayEvents[propertyCode],
              demoConsistEquipment[propertyCode],
              demoCrewAssignments[propertyCode],
              demoFareEnforcement[propertyCode]
            ];

        if (isMounted) {
          setState({
            referenceData,
            schedules,
            runs,
            consist,
            crew,
            delayEvents,
            fareEnforcement,
            stationStops,
            source: "api",
            isLoading: false,
            isSaving: false,
            saveRunApproval: state.saveRunApproval,
            saveDelay: state.saveDelay,
            saveFare: state.saveFare
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
            fareEnforcement: demoFareEnforcement[propertyCode],
            stationStops: demoStationStops[propertyCode],
            source: "fallback",
            isLoading: false,
            isSaving: false,
            saveRunApproval: state.saveRunApproval,
            saveDelay: state.saveDelay,
            saveFare: state.saveFare
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode]);

  async function saveRunApproval(runId: string, update: TrainRunApprovalUpdate) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const run = await updateTrainRunApproval(propertyCode, runId, update);
      setState((current) => ({
        ...current,
        runs: {
          items: current.runs.items.map((item) => (item.id === runId ? run : item))
        },
        isSaving: false
      }));
      return run;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  async function saveDelay(runId: string, delayId: string, update: DelayEventUpdate) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const delay = await updateDelayEvent(propertyCode, runId, delayId, update);
      setState((current) => ({
        ...current,
        delayEvents: {
          items: current.delayEvents.items.map((item) => (item.id === delayId ? delay : item))
        },
        runs: {
          items: current.runs.items.map((item) =>
            item.id === runId
              ? {
                  ...item,
                  delayMinutes: current.delayEvents.items
                    .map((candidate) => (candidate.id === delayId ? delay : candidate))
                    .reduce((total, candidate) => total + candidate.minutes, 0)
                }
              : item
          )
        },
        isSaving: false
      }));
      return delay;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  async function saveFare(recordId: string, update: FareEnforcementUpdate) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const record = await updateFareEnforcement(propertyCode, recordId, update);
      setState((current) => ({
        ...current,
        fareEnforcement: {
          items: current.fareEnforcement.items.map((item) => (item.id === recordId ? record : item))
        },
        isSaving: false
      }));
      return record;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  return {
    ...state,
    saveRunApproval,
    saveDelay,
    saveFare
  };
}
