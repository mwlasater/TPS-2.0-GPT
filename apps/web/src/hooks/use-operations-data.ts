import type {
  ConsistEquipmentList,
  ConsistEquipmentUpdate,
  CrewAssignmentList,
  CrewAssignmentUpdate,
  DelayEventList,
  DelayEventUpdate,
  FareEnforcementCreate,
  FareEnforcementList,
  FareEnforcementSummaryList,
  FareEnforcementUpdate,
  PropertyCode,
  ReferenceDataset,
  StationStop,
  StationStopList,
  StationStopUpdate,
  TrainRun,
  TrainRunApprovalHistoryList,
  TrainRunApprovalUpdate,
  TrainRunList,
  TrainScheduleList
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  fetchConsistEquipment,
  createFareEnforcement,
  fetchCrewAssignments,
  fetchDelayEvents,
  fetchFareEnforcement,
  fetchFareEnforcementSummary,
  fetchReferenceData,
  fetchStationStops,
  fetchTrainRuns,
  fetchTrainSchedules,
  fetchTrainRunApprovalHistory,
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
  demoFareEnforcementSummary,
  demoReferenceData,
  demoStationStops,
  demoTrainRuns,
  demoTrainRunApprovalHistory,
  demoTrainSchedules
} from "../lib/session.js";

function getFallbackApprovalHistory(
  propertyCode: PropertyCode,
  runId: string | null
): TrainRunApprovalHistoryList {
  return {
    items: runId
      ? demoTrainRunApprovalHistory[propertyCode].items.filter((entry) => entry.runId === runId)
      : []
  };
}

interface OperationsDataState {
  referenceData: ReferenceDataset;
  schedules: TrainScheduleList;
  runs: TrainRunList;
  selectedRunId: string | null;
  approvalHistory: TrainRunApprovalHistoryList;
  delayEvents: DelayEventList;
  fareEnforcement: FareEnforcementList;
  fareSummary: FareEnforcementSummaryList;
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
  createFare: (
    input: FareEnforcementCreate
  ) => Promise<FareEnforcementList["items"][number] | undefined>;
}

export function useOperationsData(propertyCode: PropertyCode): OperationsDataState {
  const [state, setState] = useState<OperationsDataState>({
    referenceData: demoReferenceData[propertyCode],
    schedules: demoTrainSchedules[propertyCode],
    runs: demoTrainRuns[propertyCode],
    selectedRunId: demoTrainRuns[propertyCode].items[0]?.id ?? null,
    approvalHistory: getFallbackApprovalHistory(propertyCode, demoTrainRuns[propertyCode].items[0]?.id ?? null),
    consist: demoConsistEquipment[propertyCode],
    crew: demoCrewAssignments[propertyCode],
    delayEvents: demoDelayEvents[propertyCode],
    fareEnforcement: demoFareEnforcement[propertyCode],
    fareSummary: demoFareEnforcementSummary[propertyCode],
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
    saveFare: async () => undefined,
    createFare: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      referenceData: demoReferenceData[propertyCode],
      schedules: demoTrainSchedules[propertyCode],
      runs: demoTrainRuns[propertyCode],
      selectedRunId: demoTrainRuns[propertyCode].items[0]?.id ?? null,
      approvalHistory: getFallbackApprovalHistory(
        propertyCode,
        demoTrainRuns[propertyCode].items[0]?.id ?? null
      ),
      consist: demoConsistEquipment[propertyCode],
      crew: demoCrewAssignments[propertyCode],
      delayEvents: demoDelayEvents[propertyCode],
      fareEnforcement: demoFareEnforcement[propertyCode],
      fareSummary: demoFareEnforcementSummary[propertyCode],
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
      saveFare: state.saveFare,
      createFare: state.createFare
    });

    void Promise.all([
      fetchReferenceData(propertyCode),
      fetchTrainSchedules(propertyCode),
      fetchTrainRuns(propertyCode)
    ])
      .then(async ([referenceData, schedules, runs]) => {
        const selectedRunId = runs.items[0]?.id ?? null;
        const [stationStops, delayEvents, consist, crew, fareEnforcement, approvalHistory, fareSummary] = selectedRunId
          ? await Promise.all([
              fetchStationStops(propertyCode, selectedRunId),
              fetchDelayEvents(propertyCode, selectedRunId),
              fetchConsistEquipment(propertyCode, selectedRunId),
              fetchCrewAssignments(propertyCode, selectedRunId),
              fetchFareEnforcement(propertyCode, selectedRunId),
              fetchTrainRunApprovalHistory(propertyCode, selectedRunId),
              fetchFareEnforcementSummary(propertyCode)
            ])
          : [
              demoStationStops[propertyCode],
              demoDelayEvents[propertyCode],
              demoConsistEquipment[propertyCode],
              demoCrewAssignments[propertyCode],
              demoFareEnforcement[propertyCode],
              getFallbackApprovalHistory(propertyCode, selectedRunId),
              demoFareEnforcementSummary[propertyCode]
            ];

        if (isMounted) {
          setState({
            referenceData,
            schedules,
            runs,
            selectedRunId,
            approvalHistory,
            consist,
            crew,
            delayEvents,
            fareEnforcement,
            fareSummary,
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
            saveFare: state.saveFare,
            createFare: state.createFare
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
            approvalHistory: getFallbackApprovalHistory(
              propertyCode,
              demoTrainRuns[propertyCode].items[0]?.id ?? null
            ),
            consist: demoConsistEquipment[propertyCode],
            crew: demoCrewAssignments[propertyCode],
            delayEvents: demoDelayEvents[propertyCode],
            fareEnforcement: demoFareEnforcement[propertyCode],
            fareSummary: demoFareEnforcementSummary[propertyCode],
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
            saveFare: state.saveFare,
            createFare: state.createFare
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
      const [stationStops, delayEvents, consist, crew, fareEnforcement, approvalHistory] = await Promise.all([
        fetchStationStops(propertyCode, runId),
        fetchDelayEvents(propertyCode, runId),
        fetchConsistEquipment(propertyCode, runId),
        fetchCrewAssignments(propertyCode, runId),
        fetchFareEnforcement(propertyCode, runId),
        fetchTrainRunApprovalHistory(propertyCode, runId)
      ]);

      setState((current) => ({
        ...current,
        selectedRunId: runId,
        stationStops,
        delayEvents,
        consist,
        crew,
        fareEnforcement,
        approvalHistory,
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
        approvalHistory: getFallbackApprovalHistory(propertyCode, runId),
        fareSummary: demoFareEnforcementSummary[propertyCode],
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
        approvalHistory: {
          items: [
            {
              id: `${runId}-${update.isApproved ? "approved" : "unapproved"}-local`,
              runId,
              action: update.isApproved ? "approved" : "unapproved",
              actorName: "Local Development User",
              notes: update.notes,
              createdAt: "2026-03-06T12:30:00Z"
            },
            ...current.approvalHistory.items
          ]
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
        fareSummary: {
          items: current.fareSummary.items.map((item) =>
            item.runId === record.runId
              ? {
                  ...item,
                  activityCount: current.fareEnforcement.items
                    .map((candidate) => (candidate.id === recordId ? record : candidate))
                    .filter((candidate) => candidate.runId === record.runId)
                    .reduce((total, candidate) => total + candidate.activityCount, 0),
                  inspectors: Array.from(
                    new Set(
                      current.fareEnforcement.items
                        .map((candidate) => (candidate.id === recordId ? record : candidate))
                        .filter((candidate) => candidate.runId === record.runId)
                        .map((candidate) => candidate.inspectorName)
                    )
                  ),
                  latestCapturedAt: current.fareEnforcement.items
                    .map((candidate) => (candidate.id === recordId ? record : candidate))
                    .filter((candidate) => candidate.runId === record.runId)
                    .map((candidate) => candidate.capturedAt)
                    .sort()
                    .at(-1) ?? null
                }
              : item
          )
        },
        isSaving: false
      }));
      return record;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  async function createFare(input: FareEnforcementCreate) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const record = await createFareEnforcement(propertyCode, input);
      setState((current) => {
        const nextFareItems =
          current.selectedRunId === record.runId
            ? [record, ...current.fareEnforcement.items]
            : current.fareEnforcement.items;
        const propertyRunItems = [
          ...nextFareItems.filter((item) => item.runId === record.runId),
          ...(current.selectedRunId === record.runId ? [] : [record])
        ];
        const nextSummaryItem = {
          runId: record.runId,
          recordCount: propertyRunItems.length,
          activityCount: propertyRunItems.reduce((total, item) => total + item.activityCount, 0),
          inspectors: Array.from(new Set(propertyRunItems.map((item) => item.inspectorName))),
          latestCapturedAt: propertyRunItems.map((item) => item.capturedAt).sort().at(-1) ?? null
        };
        const existingSummary = current.fareSummary.items.find((item) => item.runId === record.runId);

        return {
          ...current,
          fareEnforcement: {
            items: nextFareItems
          },
          fareSummary: {
            items: existingSummary
              ? current.fareSummary.items.map((item) =>
                  item.runId === record.runId ? nextSummaryItem : item
                )
              : [nextSummaryItem, ...current.fareSummary.items]
          },
          isSaving: false
        };
      });
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
    saveFare,
    createFare
  };
}
