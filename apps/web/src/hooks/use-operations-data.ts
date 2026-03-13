import type {
  ConsistEquipmentList,
  ConsistTemplateList,
  ConsistEquipmentUpdate,
  CrewAssignmentList,
  CrewTemplateList,
  CrewAssignmentUpdate,
  DelayAdditionalInfo,
  DelayAdditionalInfoUpdate,
  DelayEventBatchCreate,
  DelayCommonLocationList,
  DelayEventDeleteResult,
  DelayEventList,
  DelayTemplateList,
  DelayEventUpdate,
  FareEnforcementCreate,
  FareEnforcementDashboard,
  FareEnforcementList,
  FareEnforcementSummaryList,
  FareEnforcementUpdate,
  PropertyCode,
  ReferenceDataset,
  SpecialMovementList,
  StationStop,
  StationStopList,
  StationStopUpdate,
  TrainRun,
  TrainRunDeleteResult,
  TrainRunInitializeRequest,
  TrainRunInitializeResult,
  TrainRunBatchApprovalResult,
  TrainRunBatchApprovalUpdate,
  TrainRunApprovalHistoryEntry,
  TrainRunApprovalHistoryList,
  TrainRunApprovalUpdate,
  TrainRunList,
  TrainScheduleList
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  createDelayEvents,
  createDelayFromTemplate,
  deleteDelayEvent,
  deleteTrainRun,
  fetchConsistTemplates,
  fetchDelayAdditionalInfo,
  fetchDelayCommonLocations,
  fetchDelayTemplates,
  fetchConsistEquipment,
  fetchCrewTemplates,
  createFareEnforcement,
  fetchCrewAssignments,
  fetchDelayEvents,
  fetchFareEnforcement,
  fetchFareEnforcementDashboard,
  fetchFareEnforcementSummary,
  fetchReferenceData,
  fetchSpecialMovements,
  fetchStationStops,
  fetchTrainRuns,
  fetchTrainSchedules,
  fetchTrainRunApprovalHistory,
  fetchTrainScheduleApprovalHistory,
  initializeTrainRuns,
  resetTrainRun,
  swapConsistEquipment,
  swapCrewAssignments,
  updateConsistEquipment,
  updateCrewAssignment,
  updateDelayAdditionalInfo,
  updateDelayEvent,
  updateFareEnforcement,
  updateStationStop,
  updateTrainRunApprovalBatch,
  updateTrainRunApproval
} from "../lib/api.js";
import {
  demoConsistEquipment,
  demoConsistTemplates,
  demoCrewAssignments,
  demoCrewTemplates,
  demoDelayAdditionalInfo,
  demoDelayCommonLocations,
  demoDelayEvents,
  demoDelayTemplates,
  demoFareEnforcement,
  demoFareEnforcementSummary,
  demoReferenceData,
  demoSpecialMovements,
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

function getFallbackFareDashboard(
  propertyCode: PropertyCode,
  runs: TrainRunList
): FareEnforcementDashboard {
  const items = demoFareEnforcement[propertyCode].items;
  const topInspectors = new Map<
    string,
    {
      inspectorName: string;
      activityCount: number;
      recordCount: number;
    }
  >();

  for (const item of items) {
    const current = topInspectors.get(item.inspectorName) ?? {
      inspectorName: item.inspectorName,
      activityCount: 0,
      recordCount: 0
    };

    current.activityCount += item.activityCount;
    current.recordCount += 1;
    topInspectors.set(item.inspectorName, current);
  }

  const coveredRuns = new Set(items.map((item) => item.runId));

  return {
    totalRecords: items.length,
    totalActivityCount: items.reduce((total, item) => total + item.activityCount, 0),
    totalAmtrakTransfers: items.reduce((total, item) => total + item.amtrakTransfers, 0),
    totalAmtrakTickets: items.reduce((total, item) => total + item.amtrakTickets, 0),
    totalUpassCount: items.reduce((total, item) => total + item.upassCount, 0),
    totalTicketsSold: items.reduce((total, item) => total + item.ticketsSold, 0),
    coveredRuns: coveredRuns.size,
    uncoveredRuns: runs.items.map((run) => run.id).filter((runId) => !coveredRuns.has(runId)),
    topInspectors: Array.from(topInspectors.values()).sort(
      (left, right) => right.activityCount - left.activityCount
    )
  };
}

function summarizeFareRun(
  items: FareEnforcementList["items"],
  runId: string
): FareEnforcementSummaryList["items"][number] {
  const runItems = items.filter((item) => item.runId === runId);

  return {
    runId,
    recordCount: runItems.length,
    activityCount: runItems.reduce((total, item) => total + item.activityCount, 0),
    amtrakTransfers: runItems.reduce((total, item) => total + item.amtrakTransfers, 0),
    amtrakTickets: runItems.reduce((total, item) => total + item.amtrakTickets, 0),
    upassCount: runItems.reduce((total, item) => total + item.upassCount, 0),
    ticketsSold: runItems.reduce((total, item) => total + item.ticketsSold, 0),
    inspectors: Array.from(new Set(runItems.map((item) => item.inspectorName))),
    latestCapturedAt: runItems.map((item) => item.capturedAt).sort().at(-1) ?? null
  };
}

interface OperationsDataState {
  referenceData: ReferenceDataset;
  schedules: TrainScheduleList;
  runs: TrainRunList;
  selectedRunId: string | null;
  approvalHistory: TrainRunApprovalHistoryList;
  scheduleApprovalHistory: TrainRunApprovalHistoryList;
  delayAdditionalInfo: Record<string, DelayAdditionalInfo>;
  delayCommonLocations: DelayCommonLocationList;
  delayTemplates: DelayTemplateList;
  specialMovements: SpecialMovementList;
  delayEvents: DelayEventList;
  fareEnforcement: FareEnforcementList;
  fareDashboard: FareEnforcementDashboard;
  fareSummary: FareEnforcementSummaryList;
  consist: ConsistEquipmentList;
  consistTemplates: ConsistTemplateList;
  crew: CrewAssignmentList;
  crewTemplates: CrewTemplateList;
  stationStops: StationStopList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  selectRun: (runId: string) => Promise<void>;
  saveRunApproval: (runId: string, update: TrainRunApprovalUpdate) => Promise<TrainRun | undefined>;
  saveBatchRunApproval: (
    update: TrainRunBatchApprovalUpdate
  ) => Promise<TrainRunBatchApprovalResult | undefined>;
  initializeRuns: (
    request: TrainRunInitializeRequest
  ) => Promise<TrainRunInitializeResult | undefined>;
  resetRun: (runId: string) => Promise<TrainRun | undefined>;
  deleteRun: (runId: string) => Promise<TrainRunDeleteResult | undefined>;
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
  createDelayBatch: (
    runId: string,
    input: DelayEventBatchCreate
  ) => Promise<DelayEventList | undefined>;
  createDelayTemplate: (
    runId: string,
    templateId: string,
    reportedAt: string
  ) => Promise<DelayEventList["items"][number] | undefined>;
  saveDelayAdditionalInfo: (
    delayId: string,
    update: DelayAdditionalInfoUpdate
  ) => Promise<DelayAdditionalInfo | undefined>;
  deleteDelay: (
    runId: string,
    delayId: string
  ) => Promise<DelayEventDeleteResult | undefined>;
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
  swapConsist: (
    runId: string,
    templateId: string
  ) => Promise<ConsistEquipmentList | undefined>;
  swapCrew: (runId: string, templateId: string) => Promise<CrewAssignmentList | undefined>;
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
    scheduleApprovalHistory: getFallbackApprovalHistory(
      propertyCode,
      demoTrainRuns[propertyCode].items[0]?.id ?? null
    ),
    delayAdditionalInfo: demoDelayAdditionalInfo[propertyCode],
    delayCommonLocations: demoDelayCommonLocations[propertyCode],
    delayTemplates: demoDelayTemplates[propertyCode],
    specialMovements: demoSpecialMovements[propertyCode],
    consist: demoConsistEquipment[propertyCode],
    consistTemplates: demoConsistTemplates[propertyCode],
    crew: demoCrewAssignments[propertyCode],
    crewTemplates: demoCrewTemplates[propertyCode],
    delayEvents: demoDelayEvents[propertyCode],
    fareEnforcement: demoFareEnforcement[propertyCode],
    fareDashboard: getFallbackFareDashboard(propertyCode, demoTrainRuns[propertyCode]),
    fareSummary: demoFareEnforcementSummary[propertyCode],
    stationStops: demoStationStops[propertyCode],
    source: "fallback",
    isLoading: true,
    isSaving: false,
    selectRun: async () => undefined,
    saveRunApproval: async () => undefined,
    saveBatchRunApproval: async () => undefined,
    initializeRuns: async () => undefined,
    resetRun: async () => undefined,
    deleteRun: async () => undefined,
    saveDelayAdditionalInfo: async () => undefined,
    saveStop: async () => undefined,
    saveDelay: async () => undefined,
    createDelayBatch: async () => undefined,
    createDelayTemplate: async () => undefined,
    deleteDelay: async () => undefined,
    saveConsist: async () => undefined,
    saveCrew: async () => undefined,
    swapConsist: async () => undefined,
    swapCrew: async () => undefined,
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
      scheduleApprovalHistory: getFallbackApprovalHistory(
        propertyCode,
        demoTrainRuns[propertyCode].items[0]?.id ?? null
      ),
      delayAdditionalInfo: demoDelayAdditionalInfo[propertyCode],
      delayCommonLocations: demoDelayCommonLocations[propertyCode],
      delayTemplates: demoDelayTemplates[propertyCode],
      specialMovements: demoSpecialMovements[propertyCode],
      consist: demoConsistEquipment[propertyCode],
      consistTemplates: demoConsistTemplates[propertyCode],
      crew: demoCrewAssignments[propertyCode],
      crewTemplates: demoCrewTemplates[propertyCode],
      delayEvents: demoDelayEvents[propertyCode],
      fareEnforcement: demoFareEnforcement[propertyCode],
      fareDashboard: getFallbackFareDashboard(propertyCode, demoTrainRuns[propertyCode]),
      fareSummary: demoFareEnforcementSummary[propertyCode],
      stationStops: demoStationStops[propertyCode],
      source: "fallback",
      isLoading: true,
      isSaving: false,
      selectRun: state.selectRun,
      saveRunApproval: state.saveRunApproval,
      saveBatchRunApproval: state.saveBatchRunApproval,
      initializeRuns: state.initializeRuns,
      resetRun: state.resetRun,
      deleteRun: state.deleteRun,
      saveDelayAdditionalInfo: state.saveDelayAdditionalInfo,
      saveStop: state.saveStop,
      saveDelay: state.saveDelay,
      createDelayBatch: state.createDelayBatch,
      createDelayTemplate: state.createDelayTemplate,
      deleteDelay: state.deleteDelay,
      saveConsist: state.saveConsist,
      saveCrew: state.saveCrew,
      swapConsist: state.swapConsist,
      swapCrew: state.swapCrew,
      saveFare: state.saveFare,
      createFare: state.createFare
    });

    void Promise.all([
      fetchReferenceData(propertyCode),
      fetchDelayCommonLocations(propertyCode),
      fetchDelayTemplates(propertyCode),
      fetchSpecialMovements(propertyCode),
      fetchConsistTemplates(propertyCode),
      fetchCrewTemplates(propertyCode),
      fetchTrainSchedules(propertyCode),
      fetchTrainRuns(propertyCode)
    ])
      .then(
        async ([
          referenceData,
          delayCommonLocations,
          delayTemplates,
          specialMovements,
          consistTemplates,
          crewTemplates,
          schedules,
          runs
        ]) => {
        const selectedRunId = runs.items[0]?.id ?? null;
        const selectedScheduleId = runs.items.find((run) => run.id === selectedRunId)?.scheduleId;
        const [stationStops, delayEvents, consist, crew, fareEnforcement, approvalHistory, scheduleApprovalHistory, fareSummary, fareDashboard] = selectedRunId
          ? await Promise.all([
              fetchStationStops(propertyCode, selectedRunId),
              fetchDelayEvents(propertyCode, selectedRunId),
              fetchConsistEquipment(propertyCode, selectedRunId),
              fetchCrewAssignments(propertyCode, selectedRunId),
              fetchFareEnforcement(propertyCode, selectedRunId),
              fetchTrainRunApprovalHistory(propertyCode, selectedRunId),
              selectedScheduleId
                ? fetchTrainScheduleApprovalHistory(propertyCode, selectedScheduleId)
                : Promise.resolve(getFallbackApprovalHistory(propertyCode, selectedRunId)),
              fetchFareEnforcementSummary(propertyCode),
              fetchFareEnforcementDashboard(propertyCode)
            ])
          : [
              demoStationStops[propertyCode],
              demoDelayEvents[propertyCode],
              demoConsistEquipment[propertyCode],
              demoCrewAssignments[propertyCode],
              demoFareEnforcement[propertyCode],
              getFallbackApprovalHistory(propertyCode, selectedRunId),
              getFallbackApprovalHistory(propertyCode, selectedRunId),
              demoFareEnforcementSummary[propertyCode],
              getFallbackFareDashboard(propertyCode, runs)
            ];
        const delayAdditionalInfo = Object.fromEntries(
          await Promise.all(
            delayEvents.items.map(async (delay) => [
              delay.id,
              await fetchDelayAdditionalInfo(propertyCode, delay.id)
            ])
          )
        );

        if (isMounted) {
          setState({
            referenceData,
            delayCommonLocations,
            specialMovements,
            schedules,
            runs,
            selectedRunId,
            approvalHistory,
            scheduleApprovalHistory,
            delayAdditionalInfo,
            consist,
            consistTemplates,
            crew,
            crewTemplates,
            delayTemplates,
            delayEvents,
            fareEnforcement,
            fareDashboard,
            fareSummary,
            stationStops,
            source: "api",
            isLoading: false,
            isSaving: false,
            selectRun: state.selectRun,
            saveRunApproval: state.saveRunApproval,
            saveBatchRunApproval: state.saveBatchRunApproval,
            initializeRuns: state.initializeRuns,
            resetRun: state.resetRun,
            deleteRun: state.deleteRun,
            saveDelayAdditionalInfo: state.saveDelayAdditionalInfo,
            saveStop: state.saveStop,
            saveDelay: state.saveDelay,
            createDelayBatch: state.createDelayBatch,
            createDelayTemplate: state.createDelayTemplate,
            deleteDelay: state.deleteDelay,
            saveConsist: state.saveConsist,
            saveCrew: state.saveCrew,
            swapConsist: state.swapConsist,
            swapCrew: state.swapCrew,
            saveFare: state.saveFare,
            createFare: state.createFare
          });
        }
      }
      )
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
            scheduleApprovalHistory: getFallbackApprovalHistory(
              propertyCode,
              demoTrainRuns[propertyCode].items[0]?.id ?? null
            ),
            delayAdditionalInfo: demoDelayAdditionalInfo[propertyCode],
            delayCommonLocations: demoDelayCommonLocations[propertyCode],
            delayTemplates: demoDelayTemplates[propertyCode],
            specialMovements: demoSpecialMovements[propertyCode],
            consist: demoConsistEquipment[propertyCode],
            consistTemplates: demoConsistTemplates[propertyCode],
            crew: demoCrewAssignments[propertyCode],
            crewTemplates: demoCrewTemplates[propertyCode],
            delayEvents: demoDelayEvents[propertyCode],
            fareEnforcement: demoFareEnforcement[propertyCode],
            fareDashboard: getFallbackFareDashboard(propertyCode, demoTrainRuns[propertyCode]),
            fareSummary: demoFareEnforcementSummary[propertyCode],
            stationStops: demoStationStops[propertyCode],
            source: "fallback",
            isLoading: false,
            isSaving: false,
            selectRun: state.selectRun,
            saveRunApproval: state.saveRunApproval,
            saveBatchRunApproval: state.saveBatchRunApproval,
            initializeRuns: state.initializeRuns,
            resetRun: state.resetRun,
            deleteRun: state.deleteRun,
            saveDelayAdditionalInfo: state.saveDelayAdditionalInfo,
            saveStop: state.saveStop,
            saveDelay: state.saveDelay,
            createDelayBatch: state.createDelayBatch,
            createDelayTemplate: state.createDelayTemplate,
            deleteDelay: state.deleteDelay,
            saveConsist: state.saveConsist,
            saveCrew: state.saveCrew,
            swapConsist: state.swapConsist,
            swapCrew: state.swapCrew,
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
      const scheduleId = state.runs.items.find((run) => run.id === runId)?.scheduleId;
      const [stationStops, delayEvents, consist, crew, fareEnforcement, approvalHistory, scheduleApprovalHistory] = await Promise.all([
        fetchStationStops(propertyCode, runId),
        fetchDelayEvents(propertyCode, runId),
        fetchConsistEquipment(propertyCode, runId),
        fetchCrewAssignments(propertyCode, runId),
        fetchFareEnforcement(propertyCode, runId),
        fetchTrainRunApprovalHistory(propertyCode, runId),
        scheduleId
          ? fetchTrainScheduleApprovalHistory(propertyCode, scheduleId)
          : Promise.resolve(getFallbackApprovalHistory(propertyCode, runId))
      ]);
      const delayAdditionalInfo = Object.fromEntries(
        await Promise.all(
          delayEvents.items.map(async (delay) => [
            delay.id,
            await fetchDelayAdditionalInfo(propertyCode, delay.id)
          ])
        )
      );

      setState((current) => ({
        ...current,
        selectedRunId: runId,
        stationStops,
        delayEvents,
        consist,
        crew,
        fareEnforcement,
        approvalHistory,
        scheduleApprovalHistory,
        delayAdditionalInfo,
        source: "api",
        isLoading: false
      }));
    } catch {
      setState((current) => ({
        ...current,
        selectedRunId: runId,
        stationStops: demoStationStops[propertyCode],
        delayEvents: demoDelayEvents[propertyCode],
        delayAdditionalInfo: demoDelayAdditionalInfo[propertyCode],
        delayTemplates: demoDelayTemplates[propertyCode],
        consist: demoConsistEquipment[propertyCode],
        crew: demoCrewAssignments[propertyCode],
        fareEnforcement: demoFareEnforcement[propertyCode],
        approvalHistory: getFallbackApprovalHistory(propertyCode, runId),
        scheduleApprovalHistory: getFallbackApprovalHistory(propertyCode, runId),
        fareDashboard: getFallbackFareDashboard(propertyCode, demoTrainRuns[propertyCode]),
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
      const action: TrainRunApprovalHistoryEntry["action"] = update.isApproved ? "approved" : "unapproved";
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
              action,
              actorName: "Local Development User",
              notes: update.notes,
              createdAt: "2026-03-06T12:30:00Z"
            },
            ...current.approvalHistory.items
          ]
        },
        scheduleApprovalHistory: {
          items: [
            {
              id: `${runId}-${update.isApproved ? "approved" : "unapproved"}-local`,
              runId,
              action,
              actorName: "Local Development User",
              notes: update.notes,
              createdAt: "2026-03-06T12:30:00Z"
            },
            ...current.scheduleApprovalHistory.items
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

  async function saveBatchRunApproval(update: TrainRunBatchApprovalUpdate) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const result = await updateTrainRunApprovalBatch(propertyCode, update);
      const action: TrainRunApprovalHistoryEntry["action"] = update.isApproved ? "approved" : "unapproved";
      setState((current) => ({
        ...current,
        runs: {
          items: current.runs.items.map((item) => {
            const updated = result.updatedRuns.find((run) => run.id === item.id);
            return updated ?? item;
          })
        },
        approvalHistory:
          current.selectedRunId && result.updatedRuns.some((run) => run.id === current.selectedRunId)
            ? {
                items: [
                  {
                    id: `${current.selectedRunId}-${update.isApproved ? "approved" : "unapproved"}-batch-local`,
                    runId: current.selectedRunId,
                    action,
                    actorName: "Local Development User",
                    notes: update.notes,
                    createdAt: "2026-03-06T12:30:00Z"
                  },
                  ...current.approvalHistory.items
                ]
              }
            : current.approvalHistory,
        scheduleApprovalHistory: {
          items: [
            ...result.updatedRuns.map((run) => ({
              id: `${run.id}-${update.isApproved ? "approved" : "unapproved"}-batch-local`,
              runId: run.id,
              action,
              actorName: "Local Development User",
              notes: update.notes,
              createdAt: "2026-03-06T12:30:00Z"
            })),
            ...current.scheduleApprovalHistory.items
          ]
        },
        isSaving: false
      }));
      return result;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  async function initializeRunsForDate(request: TrainRunInitializeRequest) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const result = await initializeTrainRuns(propertyCode, request);
      setState((current) => {
        const existingIds = new Set(current.runs.items.map((item) => item.id));

        return {
          ...current,
          runs: {
            items: [
              ...result.createdRuns.filter((item) => !existingIds.has(item.id)),
              ...current.runs.items
            ]
          },
          selectedRunId: result.createdRuns[0]?.id ?? current.selectedRunId,
          isSaving: false
        };
      });

      if (result.createdRuns[0]) {
        await selectRun(result.createdRuns[0].id);
      }

      return result;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  async function resetRun(runId: string) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const run = await resetTrainRun(propertyCode, runId);
      setState((current) => ({
        ...current,
        runs: {
          items: current.runs.items.map((item) => (item.id === runId ? run : item))
        },
        delayEvents: {
          items: []
        },
        delayAdditionalInfo: {},
        consist: {
          items: []
        },
        crew: {
          items: []
        },
        fareEnforcement: {
          items: []
        },
        isSaving: false
      }));
      return run;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  async function removeRun(runId: string) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const result = await deleteTrainRun(propertyCode, runId);
      setState((current) => {
        const nextRuns = current.runs.items.filter((item) => item.id !== runId);
        const nextSelectedRunId = current.selectedRunId === runId ? nextRuns[0]?.id ?? null : current.selectedRunId;

        return {
          ...current,
          runs: {
            items: nextRuns
          },
          selectedRunId: nextSelectedRunId,
          approvalHistory:
            current.selectedRunId === runId ? { items: [] } : current.approvalHistory,
          scheduleApprovalHistory:
            current.selectedRunId === runId ? { items: [] } : current.scheduleApprovalHistory,
          delayEvents:
            current.selectedRunId === runId ? { items: [] } : current.delayEvents,
          delayAdditionalInfo:
            current.selectedRunId === runId ? {} : current.delayAdditionalInfo,
          consist:
            current.selectedRunId === runId ? { items: [] } : current.consist,
          crew:
            current.selectedRunId === runId ? { items: [] } : current.crew,
          stationStops:
            current.selectedRunId === runId ? { items: [] } : current.stationStops,
          fareEnforcement:
            current.selectedRunId === runId ? { items: [] } : current.fareEnforcement,
          isSaving: false
        };
      });
      return result;
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

  async function saveDelayMetadata(delayId: string, update: DelayAdditionalInfoUpdate) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const next = await updateDelayAdditionalInfo(propertyCode, delayId, update);
      setState((current) => ({
        ...current,
        delayAdditionalInfo: {
          ...current.delayAdditionalInfo,
          [delayId]: next
        },
        isSaving: false
      }));
      return next;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  async function createDelayBatch(runId: string, input: DelayEventBatchCreate) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const created = await createDelayEvents(propertyCode, runId, input);
      setState((current) => {
        const nextItems = [...created.items, ...current.delayEvents.items];
        const nextDelayMinutes = nextItems.reduce((total, candidate) => total + candidate.minutes, 0);

        return {
          ...current,
          delayEvents: {
            items: nextItems
          },
          delayAdditionalInfo: {
            ...current.delayAdditionalInfo,
            ...Object.fromEntries(
              created.items.map((delay) => [
                delay.id,
                {
                  delayId: delay.id,
                  locationDetail: "",
                  responsibleParty: "",
                  notableDelayType: "",
                  specialMovementId: null,
                  workOrderId: null,
                  mechanicalNotes: "",
                  passengerImpactSummary: ""
                }
              ])
            )
          },
          runs: {
            items: current.runs.items.map((item) =>
              item.id === runId
                ? {
                    ...item,
                    delayMinutes: nextDelayMinutes,
                    status: nextDelayMinutes > 0 ? "delayed" : item.status
                  }
                : item
            )
          },
          isSaving: false
        };
      });
      return created;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  async function createDelayTemplate(runId: string, templateId: string, reportedAt: string) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const delay = await createDelayFromTemplate(propertyCode, runId, {
        templateId,
        reportedAt
      });
      const additionalInfo = await fetchDelayAdditionalInfo(propertyCode, delay.id);
      setState((current) => {
        const nextItems = [delay, ...current.delayEvents.items];
        const nextDelayMinutes = nextItems.reduce((total, candidate) => total + candidate.minutes, 0);

        return {
          ...current,
          delayEvents: {
            items: nextItems
          },
          delayAdditionalInfo: {
            ...current.delayAdditionalInfo,
            [delay.id]: additionalInfo
          },
          runs: {
            items: current.runs.items.map((item) =>
              item.id === runId
                ? {
                    ...item,
                    delayMinutes: nextDelayMinutes,
                    status: nextDelayMinutes > 0 ? "delayed" : item.status
                  }
                : item
            )
          },
          isSaving: false
        };
      });
      return delay;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  async function removeDelay(runId: string, delayId: string) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const result = await deleteDelayEvent(propertyCode, runId, delayId);
      setState((current) => ({
        ...current,
        delayEvents: {
          items: current.delayEvents.items.filter((item) => item.id !== delayId)
        },
        delayAdditionalInfo: Object.fromEntries(
          Object.entries(current.delayAdditionalInfo).filter(([id]) => id !== delayId)
        ),
        runs: {
          items: current.runs.items.map((item) =>
            item.id === runId
              ? {
                  ...item,
                  delayMinutes: result.delayMinutes,
                  status: result.delayMinutes > 0 ? "delayed" : "in_progress"
                }
              : item
          )
        },
        isSaving: false
      }));
      return result;
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
      const [record, fareDashboard] = await Promise.all([
        updateFareEnforcement(propertyCode, recordId, update),
        fetchFareEnforcementDashboard(propertyCode)
      ]);
      setState((current) => {
        const nextItems = current.fareEnforcement.items.map((item) => (item.id === recordId ? record : item));

        return {
          ...current,
          fareEnforcement: {
            items: nextItems
          },
          fareDashboard,
          fareSummary: {
            items: current.fareSummary.items.map((item) =>
              item.runId === record.runId ? summarizeFareRun(nextItems, record.runId) : item
            )
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

  async function createFare(input: FareEnforcementCreate) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const [record, fareDashboard] = await Promise.all([
        createFareEnforcement(propertyCode, input),
        fetchFareEnforcementDashboard(propertyCode)
      ]);
      setState((current) => {
        const nextFareItems =
          current.selectedRunId === record.runId
            ? [record, ...current.fareEnforcement.items]
            : current.fareEnforcement.items;
        const propertyRunItems = [
          ...nextFareItems.filter((item) => item.runId === record.runId),
          ...(current.selectedRunId === record.runId ? [] : [record])
        ];
        const nextSummaryItem = summarizeFareRun(propertyRunItems, record.runId);
        const existingSummary = current.fareSummary.items.find((item) => item.runId === record.runId);

        return {
          ...current,
          fareEnforcement: {
            items: nextFareItems
          },
          fareDashboard,
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

  async function swapConsist(runId: string, templateId: string) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const consist = await swapConsistEquipment(propertyCode, runId, { templateId });
      setState((current) => ({
        ...current,
        consist,
        isSaving: false
      }));
      return consist;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  async function swapCrew(runId: string, templateId: string) {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const crew = await swapCrewAssignments(propertyCode, runId, { templateId });
      setState((current) => ({
        ...current,
        crew,
        isSaving: false
      }));
      return crew;
    } catch (error) {
      setState((current) => ({ ...current, isSaving: false }));
      throw error;
    }
  }

  return {
    ...state,
    selectRun,
    saveRunApproval,
    saveBatchRunApproval,
    initializeRuns: initializeRunsForDate,
    resetRun,
    deleteRun: removeRun,
    saveStop,
    saveDelay,
    saveDelayAdditionalInfo: saveDelayMetadata,
    createDelayBatch,
    createDelayTemplate,
    deleteDelay: removeDelay,
    saveConsist,
    saveCrew,
    swapConsist,
    swapCrew,
    saveFare,
    createFare
  };
}
