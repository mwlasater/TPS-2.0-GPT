import type {
  ConsistEquipmentList,
  ConsistEquipmentUpdate,
  CrewAssignmentList,
  CrewAssignmentUpdate,
  DelayEventList,
  DelayEventUpdate,
  FareEnforcementList,
  FareEnforcementUpdate,
  PropertyCode,
  ReferenceDataset,
  StationStop,
  StationStopList,
  StationStopUpdate,
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
  updateConsistEquipment,
  updateCrewAssignment,
  updateDelayEvent,
  updateFareEnforcement,
  updateStationStop,
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
  selectedRunId: string | null;
  delayEvents: DelayEventList;
  fareEnforcement: FareEnforcementList;
  consist: ConsistEquipmentList;
  crew: CrewAssignmentList;
  stationStops: StationStopList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  selectRun: (runId: string) => Promise<void>;
  saveRunApproval: (runId: string, update: TrainRunApprovalUpdate) => Promise<TrainRun | undefined>;
  saveStop: (
    runId: string,
    stopId: string,
    update: StationStopUpdate
  ) => Promise<StationStop | undefined>;
  saveDelay: (
    runId: string,
    delayId: string,
    update: DelayEventUpdate
  ) => Promise<DelayEventList["items"][number] | undefined>;
  saveConsist: (
    runId: string,
    equipmentId: string,
    update: ConsistEquipmentUpdate
  ) => Promise<ConsistEquipmentList["items"][number] | undefined>;
  saveCrew: (
    runId: string,
    assignmentId: string,
    update: CrewAssignmentUpdate
  ) => Promise<CrewAssignmentList["items"][number] | undefined>;
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
    selectedRunId: demoTrainRuns[propertyCode].items[0]?.id ?? null,
    consist: demoConsistEquipment[propertyCode],
    crew: demoCrewAssignments[propertyCode],
    delayEvents: demoDelayEvents[propertyCode],
    fareEnforcement: demoFareEnforcement[propertyCode],
    stationStops: demoStationStops[propertyCode],
    source: "fallback",
    isLoading: true,
    isSaving: false,
    selectRun: async () => undefined,
    saveRunApproval: async () => undefined,
    saveStop: async () => undefined,
    saveDelay: async () => undefined,
    saveConsist: async () => undefined,
    saveCrew: async () => undefined,
    saveFare: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      referenceData: demoReferenceData[propertyCode],
      schedules: demoTrainSchedules[propertyCode],
      runs: demoTrainRuns[propertyCode],
      selectedRunId: demoTrainRuns[propertyCode].items[0]?.id ?? null,
      consist: demoConsistEquipment[propertyCode],
      crew: demoCrewAssignments[propertyCode],
      delayEvents: demoDelayEvents[propertyCode],
      fareEnforcement: demoFareEnforcement[propertyCode],
      stationStops: demoStationStops[propertyCode],
      source: "fallback",
      isLoading: true,
      isSaving: false,
      selectRun: state.selectRun,
      saveRunApproval: state.saveRunApproval,
      saveStop: state.saveStop,
      saveDelay: state.saveDelay,
      saveConsist: state.saveConsist,
      saveCrew: state.saveCrew,
      saveFare: state.saveFare
    });

    void Promise.all([
      fetchReferenceData(propertyCode),
      fetchTrainSchedules(propertyCode),
      fetchTrainRuns(propertyCode)
    ])
      .then(async ([referenceData, schedules, runs]) => {
        const selectedRunId = runs.items[0]?.id ?? null;
        const [stationStops, delayEvents, consist, crew, fareEnforcement] = selectedRunId
          ? await Promise.all([
              fetchStationStops(propertyCode, selectedRunId),
              fetchDelayEvents(propertyCode, selectedRunId),
              fetchConsistEquipment(propertyCode, selectedRunId),
              fetchCrewAssignments(propertyCode, selectedRunId),
              fetchFareEnforcement(propertyCode, selectedRunId)
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
            selectedRunId,
            consist,
            crew,
            delayEvents,
            fareEnforcement,
            stationStops,
            source: "api",
            isLoading: false,
            isSaving: false,
            selectRun: state.selectRun,
            saveRunApproval: state.saveRunApproval,
            saveStop: state.saveStop,
            saveDelay: state.saveDelay,
            saveConsist: state.saveConsist,
            saveCrew: state.saveCrew,
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
            selectedRunId: demoTrainRuns[propertyCode].items[0]?.id ?? null,
            consist: demoConsistEquipment[propertyCode],
            crew: demoCrewAssignments[propertyCode],
            delayEvents: demoDelayEvents[propertyCode],
            fareEnforcement: demoFareEnforcement[propertyCode],
            stationStops: demoStationStops[propertyCode],
            source: "fallback",
            isLoading: false,
            isSaving: false,
            selectRun: state.selectRun,
            saveRunApproval: state.saveRunApproval,
            saveStop: state.saveStop,
            saveDelay: state.saveDelay,
            saveConsist: state.saveConsist,
            saveCrew: state.saveCrew,
            saveFare: state.saveFare
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode]);

  async function selectRun(runId: string): Promise<void> {
    setState((current) => ({
      ...current,
      selectedRunId: runId,
      isLoading: true
    }));

    try {
      const [stationStops, delayEvents, consist, crew, fareEnforcement] = await Promise.all([
        fetchStationStops(propertyCode, runId),
        fetchDelayEvents(propertyCode, runId),
        fetchConsistEquipment(propertyCode, runId),
        fetchCrewAssignments(propertyCode, runId),
        fetchFareEnforcement(propertyCode, runId)
      ]);

      setState((current) => ({
        ...current,
        selectedRunId: runId,
        stationStops,
        delayEvents,
        consist,
        crew,
        fareEnforcement,
        source: "api",
        isLoading: false
      }));
    } catch {
      setState((current) => ({
        ...current,
        selectedRunId: runId,
        stationStops: demoStationStops[propertyCode],
        delayEvents: demoDelayEvents[propertyCode],
        consist: demoConsistEquipment[propertyCode],
        crew: demoCrewAssignments[propertyCode],
        fareEnforcement: demoFareEnforcement[propertyCode],
        source: "fallback",
        isLoading: false
      }));
    }
  }

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

  async function saveStop(runId: string, stopId: string, update: StationStopUpdate) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const stop = await updateStationStop(propertyCode, runId, stopId, update);
      setState((current) => ({
        ...current,
        stationStops: {
          items: current.stationStops.items.map((item) => (item.id === stopId ? stop : item))
        },
        isSaving: false
      }));
      return stop;
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

  async function saveConsist(
    runId: string,
    equipmentId: string,
    update: ConsistEquipmentUpdate
  ) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const equipment = await updateConsistEquipment(propertyCode, runId, equipmentId, update);
      setState((current) => ({
        ...current,
        consist: {
          items: current.consist.items
            .map((item) => (item.id === equipmentId ? equipment : item))
            .sort((left, right) => left.position - right.position)
        },
        isSaving: false
      }));
      return equipment;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  async function saveCrew(runId: string, assignmentId: string, update: CrewAssignmentUpdate) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const assignment = await updateCrewAssignment(propertyCode, runId, assignmentId, update);
      setState((current) => ({
        ...current,
        crew: {
          items: current.crew.items.map((item) => (item.id === assignmentId ? assignment : item))
        },
        isSaving: false
      }));
      return assignment;
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
    selectRun,
    saveRunApproval,
    saveStop,
    saveDelay,
    saveConsist,
    saveCrew,
    saveFare
  };
}
