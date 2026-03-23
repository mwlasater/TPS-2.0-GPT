import type {
  ConsistEquipmentList,
  ConsistTemplateList,
  ConsistEquipmentUpdate,
  CrewAssignmentList,
  CrewTemplateList,
  CrewAssignmentUpdate,
  DelayAdditionalInfo,
  DelayAdditionalInfoUpdate,
  DelayPropagationPreview,
  DelayWorkOrder,
  DelayWorkOrderCreate,
  DelayEventCreate,
  DelayEventBatchCreate,
  DelayCommonLocationList,
  DelayEventDeleteResult,
  DelayEventList,
  DelayTemplateList,
  DelayEventUpdate,
  FareEnforcementCreate,
  FareEnforcementHistoryList,
  FareEnforcementDashboard,
  FareEnforcementList,
  FareEnforcementSummaryList,
  FareEnforcementUpdate,
  NotableDelayTypeList,
  PropertySummary,
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
  TrainRunApprovalHistoryList,
  TrainRunApprovalUpdate,
  TrainRunEventHistoryList,
  TrainRunImpactSummary,
  TrainScheduleApprovalSummary,
  TrainRunList,
  TrainRunStatusRecord,
  TrainRunStatusUpdate,
  TrainScheduleList
} from "@tps/types";
import { useEffect, useState } from "react";

import { Panel } from "../components/panel.js";
import { StatusBadge } from "../components/status-badge.js";

interface OperationsPageProps {
  property: PropertySummary;
  consist: ConsistEquipmentList;
  consistTemplates: ConsistTemplateList;
  crew: CrewAssignmentList;
  crewTemplates: CrewTemplateList;
  currentUserPermissions: string[];
  delayEvents: DelayEventList;
  fareEnforcement: FareEnforcementList;
  fareHistory: FareEnforcementHistoryList;
  fareDashboard: FareEnforcementDashboard;
  fareSummary: FareEnforcementSummaryList;
  isSaving: boolean;
  referenceData: ReferenceDataset;
  runs: TrainRunList;
  approvalHistory: TrainRunApprovalHistoryList;
  scheduleApprovalHistory: TrainRunApprovalHistoryList;
  eventHistory: TrainRunEventHistoryList;
  impactSummary: TrainRunImpactSummary;
  scheduleApprovalSummary: TrainScheduleApprovalSummary;
  trainRunStatus: TrainRunStatusRecord;
  delayAdditionalInfo: Record<string, DelayAdditionalInfo>;
  delayPropagationPreview: DelayPropagationPreview;
  delayCommonLocations: DelayCommonLocationList;
  notableDelayTypes: NotableDelayTypeList;
  delayWorkOrders: Record<string, DelayWorkOrder>;
  delayTemplates: DelayTemplateList;
  specialMovements: SpecialMovementList;
  schedules: TrainScheduleList;
  selectedRunId: string | null;
  selectRun: (runId: string) => Promise<void>;
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
  swapConsist: (runId: string, templateId: string) => Promise<ConsistEquipmentList | undefined>;
  swapCrew: (runId: string, templateId: string) => Promise<CrewAssignmentList | undefined>;
  saveDelay: (
    runId: string,
    delayId: string,
    update: DelayEventUpdate
  ) => Promise<DelayEventList["items"][number] | undefined>;
  saveFare: (
    recordId: string,
    update: FareEnforcementUpdate
  ) => Promise<FareEnforcementList["items"][number] | undefined>;
  createFare: (
    input: FareEnforcementCreate
  ) => Promise<FareEnforcementList["items"][number] | undefined>;
  loadFareHistory: (recordId: string | null) => Promise<void>;
  deleteFare: (recordId: string) => Promise<{ deletedRecordId: string; runId: string } | undefined>;
  saveRunApproval: (
    runId: string,
    update: TrainRunApprovalUpdate
  ) => Promise<TrainRun | undefined>;
  saveBatchRunApproval: (
    update: TrainRunBatchApprovalUpdate
  ) => Promise<TrainRunBatchApprovalResult | undefined>;
  initializeRuns: (
    request: TrainRunInitializeRequest
  ) => Promise<TrainRunInitializeResult | undefined>;
  saveRunStatus: (
    runId: string,
    update: TrainRunStatusUpdate
  ) => Promise<TrainRunStatusRecord | undefined>;
  resetRun: (runId: string) => Promise<TrainRun | undefined>;
  deleteRun: (runId: string) => Promise<TrainRunDeleteResult | undefined>;
  saveStop: (
    runId: string,
    stopId: string,
    update: StationStopUpdate
  ) => Promise<StationStop | undefined>;
  createDelayBatch: (
    runId: string,
    input: DelayEventBatchCreate
  ) => Promise<DelayEventList | undefined>;
  createDelayTemplate: (
    runId: string,
    templateId: string,
    reportedAt: string
  ) => Promise<DelayEventList["items"][number] | undefined>;
  createWorkOrder: (
    delayId: string,
    input: DelayWorkOrderCreate
  ) => Promise<DelayWorkOrder | undefined>;
  saveDelayAdditionalInfo: (
    delayId: string,
    update: DelayAdditionalInfoUpdate
  ) => Promise<DelayAdditionalInfo | undefined>;
  clearDelayAdditionalInfo: (
    delayId: string
  ) => Promise<{ delayId: string } | undefined>;
  deleteDelay: (
    runId: string,
    delayId: string
  ) => Promise<DelayEventDeleteResult | undefined>;
  stationStops: StationStopList;
  source: "api" | "fallback";
}

export function OperationsPage({
  consist,
  consistTemplates,
  crew,
  crewTemplates,
  currentUserPermissions,
  delayEvents,
  fareEnforcement,
  fareHistory,
  fareDashboard,
  fareSummary,
  isSaving,
  property,
  referenceData,
  runs,
  approvalHistory,
  scheduleApprovalHistory,
  eventHistory,
  impactSummary,
  scheduleApprovalSummary,
  trainRunStatus,
  delayAdditionalInfo,
  delayPropagationPreview,
  delayCommonLocations,
  notableDelayTypes,
  delayWorkOrders,
  delayTemplates,
  specialMovements,
  schedules,
  selectedRunId,
  selectRun,
  saveConsist,
  saveCrew,
  swapConsist,
  swapCrew,
  saveDelay,
  createFare,
  loadFareHistory,
  deleteFare,
  saveFare,
  saveRunApproval,
  saveBatchRunApproval,
  initializeRuns,
  saveRunStatus,
  resetRun,
  deleteRun,
  saveStop,
  createDelayBatch,
  createDelayTemplate,
  createWorkOrder,
  saveDelayAdditionalInfo,
  clearDelayAdditionalInfo,
  deleteDelay,
  stationStops,
  source
}: OperationsPageProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("Ready for dispatch closeout.");
  const [initializeDate, setInitializeDate] = useState("2026-03-07");
  const [runStatusForm, setRunStatusForm] = useState<TrainRunStatusUpdate>({
    status: trainRunStatus.status,
    comment: trainRunStatus.comment
  });
  const canInitializeSchedules = currentUserPermissions.includes("schedules.write");
  const canApproveRuns = currentUserPermissions.includes("runs.approve");
  const canEditRuns = currentUserPermissions.includes("runs.write");
  const canEditStops = currentUserPermissions.includes("stops.write");
  const canEditDelays = currentUserPermissions.includes("delays.write");
  const canEditConsist = currentUserPermissions.includes("consist.write");
  const canAssignCrew = currentUserPermissions.includes("crew.assign");
  const canEditFare = currentUserPermissions.includes("fare.write");
  const selectedRun = runs.items.find((run) => run.id === selectedRunId) ?? runs.items[0];
  const selectedSchedule =
    schedules.items.find((schedule) => schedule.id === selectedRun?.scheduleId) ?? schedules.items[0];
  const scheduleRuns = runs.items.filter((run) => run.scheduleId === selectedSchedule?.id);
  const batchReadyRunIds = scheduleRuns
    .filter((run) => !run.isApproved && run.approvalBlockers.length === 0)
    .map((run) => run.id);
  const batchApprovedRunIds = scheduleRuns.filter((run) => run.isApproved).map((run) => run.id);

  const [selectedStopId, setSelectedStopId] = useState<string | null>(stationStops.items[0]?.id ?? null);
  const [selectedDelayId, setSelectedDelayId] = useState<string | null>(delayEvents.items[0]?.id ?? null);
  const [selectedDelayTemplateId, setSelectedDelayTemplateId] = useState<string>(
    delayTemplates.items[0]?.id ?? ""
  );
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(consist.items[0]?.id ?? null);
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(crew.items[0]?.id ?? null);
  const [selectedConsistTemplateId, setSelectedConsistTemplateId] = useState(
    consistTemplates.items[0]?.id ?? ""
  );
  const [selectedCrewTemplateId, setSelectedCrewTemplateId] = useState(
    crewTemplates.items[0]?.id ?? ""
  );
  const [selectedFareId, setSelectedFareId] = useState<string | null>(fareEnforcement.items[0]?.id ?? null);

  const selectedStop = stationStops.items.find((item) => item.id === selectedStopId) ?? stationStops.items[0];
  const selectedDelay = delayEvents.items.find((item) => item.id === selectedDelayId) ?? delayEvents.items[0];
  const selectedEquipment =
    consist.items.find((item) => item.id === selectedEquipmentId) ?? consist.items[0];
  const selectedCrew = crew.items.find((item) => item.id === selectedCrewId) ?? crew.items[0];
  const selectedFare =
    fareEnforcement.items.find((item) => item.id === selectedFareId) ?? fareEnforcement.items[0];

  const [stopForm, setStopForm] = useState<StationStopUpdate>({
    actualTime: selectedStop?.actualTime ?? null,
    boardings: selectedStop?.boardings ?? 0,
    alightings: selectedStop?.alightings ?? 0
  });
  const [delayForm, setDelayForm] = useState<DelayEventUpdate>({
    category: selectedDelay?.category ?? "",
    minutes: selectedDelay?.minutes ?? 0,
    notes: selectedDelay?.notes ?? "",
    reportedAt: selectedDelay?.reportedAt ?? ""
  });
  const [delayAdditionalForm, setDelayAdditionalForm] = useState<DelayAdditionalInfoUpdate>({
    locationDetail: delayAdditionalInfo[selectedDelay?.id ?? ""]?.locationDetail ?? "",
    responsibleParty: delayAdditionalInfo[selectedDelay?.id ?? ""]?.responsibleParty ?? "",
    notableDelayType: delayAdditionalInfo[selectedDelay?.id ?? ""]?.notableDelayType ?? "",
    specialMovementId: delayAdditionalInfo[selectedDelay?.id ?? ""]?.specialMovementId ?? null,
    workOrderId: delayAdditionalInfo[selectedDelay?.id ?? ""]?.workOrderId ?? null,
    mechanicalNotes: delayAdditionalInfo[selectedDelay?.id ?? ""]?.mechanicalNotes ?? "",
    passengerImpactSummary:
      delayAdditionalInfo[selectedDelay?.id ?? ""]?.passengerImpactSummary ?? ""
  });
  const [workOrderForm, setWorkOrderForm] = useState<DelayWorkOrderCreate>({
    notableDelayType: delayAdditionalInfo[selectedDelay?.id ?? ""]?.notableDelayType ?? "",
    assetId: null,
    repairType: "Inspection",
    priority: "medium"
  });
  const [equipmentForm, setEquipmentForm] = useState<ConsistEquipmentUpdate>({
    position: selectedEquipment?.position ?? 1,
    status: selectedEquipment?.status ?? "active"
  });
  const [crewForm, setCrewForm] = useState<CrewAssignmentUpdate>({
    role: selectedCrew?.role ?? "",
    onDutyTime: selectedCrew?.onDutyTime ?? "",
    status: selectedCrew?.status ?? "assigned"
  });
  const [fareForm, setFareForm] = useState<FareEnforcementUpdate>({
    inspectorName: selectedFare?.inspectorName ?? "",
    firstLocation: selectedFare?.firstLocation ?? "",
    secondLocation: selectedFare?.secondLocation ?? "",
    activityCount: selectedFare?.activityCount ?? 0,
    amtrakTransfers: selectedFare?.amtrakTransfers ?? 0,
    amtrakTickets: selectedFare?.amtrakTickets ?? 0,
    upassCount: selectedFare?.upassCount ?? 0,
    ticketsSold: selectedFare?.ticketsSold ?? 0,
    notes: selectedFare?.notes ?? "",
    capturedAt: selectedFare?.capturedAt ?? ""
  });
  const [newFareForm, setNewFareForm] = useState<FareEnforcementCreate>({
    runId: selectedRun?.id ?? "",
    inspectorName: "Morgan Lee",
    firstLocation: stationStops.items[0]?.stationCode ?? "",
    secondLocation: stationStops.items.at(-1)?.stationCode ?? "",
    activityCount: 0,
    amtrakTransfers: 0,
    amtrakTickets: 0,
    upassCount: 0,
    ticketsSold: 0,
    notes: "New fare inspection pass.",
    capturedAt: "2026-03-06T09:00:00Z"
  });
  const [fareInspectorFilter, setFareInspectorFilter] = useState("");
  const [newDelayBatch, setNewDelayBatch] = useState<DelayEventBatchCreate>({
    delays: [
      {
        category: referenceData.delayReasons[0] ?? "Signal delay",
        minutes: 2,
        notes: "Additional delay event.",
        reportedAt: "2026-03-06T06:40:00Z"
      },
      {
        category: referenceData.delayReasons[1] ?? "Passenger loading",
        minutes: 1,
        notes: "Trailing platform hold.",
        reportedAt: "2026-03-06T06:43:00Z"
      }
    ]
  });
  const [delayTemplateReportedAt, setDelayTemplateReportedAt] = useState("2026-03-06T06:28:00Z");

  useEffect(() => {
    void loadFareHistory(selectedFare?.id ?? null);
  }, [selectedFare?.id]);

  function updateBatchDelay(index: number, update: Partial<DelayEventCreate>) {
    setNewDelayBatch((current) => ({
      delays: current.delays.map((delay, candidateIndex) =>
        candidateIndex === index ? { ...delay, ...update } : delay
      )
    }));
  }

  useEffect(() => {
    setSelectedStopId(stationStops.items[0]?.id ?? null);
  }, [stationStops]);

  useEffect(() => {
    setSelectedDelayId(delayEvents.items[0]?.id ?? null);
  }, [delayEvents]);

  useEffect(() => {
    setSelectedDelayTemplateId(delayTemplates.items[0]?.id ?? "");
  }, [delayTemplates]);

  useEffect(() => {
    setSelectedEquipmentId(consist.items[0]?.id ?? null);
  }, [consist]);

  useEffect(() => {
    setSelectedCrewId(crew.items[0]?.id ?? null);
  }, [crew]);

  useEffect(() => {
    setSelectedConsistTemplateId(consistTemplates.items[0]?.id ?? "");
  }, [consistTemplates]);

  useEffect(() => {
    setSelectedCrewTemplateId(crewTemplates.items[0]?.id ?? "");
  }, [crewTemplates]);

  useEffect(() => {
    setSelectedFareId(fareEnforcement.items[0]?.id ?? null);
  }, [fareEnforcement]);

  useEffect(() => {
    setStopForm({
      actualTime: selectedStop?.actualTime ?? null,
      boardings: selectedStop?.boardings ?? 0,
      alightings: selectedStop?.alightings ?? 0
    });
  }, [selectedStop]);

  useEffect(() => {
    setDelayForm({
      category: selectedDelay?.category ?? "",
      minutes: selectedDelay?.minutes ?? 0,
      notes: selectedDelay?.notes ?? "",
      reportedAt: selectedDelay?.reportedAt ?? ""
    });
  }, [selectedDelay]);

  useEffect(() => {
    const current = selectedDelay ? delayAdditionalInfo[selectedDelay.id] : null;
    setDelayAdditionalForm({
      locationDetail: current?.locationDetail ?? "",
      responsibleParty: current?.responsibleParty ?? "",
      notableDelayType: current?.notableDelayType ?? "",
      specialMovementId: current?.specialMovementId ?? null,
      workOrderId: current?.workOrderId ?? null,
      mechanicalNotes: current?.mechanicalNotes ?? "",
      passengerImpactSummary: current?.passengerImpactSummary ?? ""
    });
    setWorkOrderForm({
      notableDelayType: current?.notableDelayType ?? "",
      assetId: null,
      repairType: "Inspection",
      priority: "medium"
    });
  }, [selectedDelay, delayAdditionalInfo]);

  useEffect(() => {
    setEquipmentForm({
      position: selectedEquipment?.position ?? 1,
      status: selectedEquipment?.status ?? "active"
    });
  }, [selectedEquipment]);

  useEffect(() => {
    setCrewForm({
      role: selectedCrew?.role ?? "",
      onDutyTime: selectedCrew?.onDutyTime ?? "",
      status: selectedCrew?.status ?? "assigned"
    });
  }, [selectedCrew]);

  useEffect(() => {
    setFareForm({
      inspectorName: selectedFare?.inspectorName ?? "",
      firstLocation: selectedFare?.firstLocation ?? "",
      secondLocation: selectedFare?.secondLocation ?? "",
      activityCount: selectedFare?.activityCount ?? 0,
      amtrakTransfers: selectedFare?.amtrakTransfers ?? 0,
      amtrakTickets: selectedFare?.amtrakTickets ?? 0,
      upassCount: selectedFare?.upassCount ?? 0,
      ticketsSold: selectedFare?.ticketsSold ?? 0,
      notes: selectedFare?.notes ?? "",
      capturedAt: selectedFare?.capturedAt ?? ""
    });
  }, [selectedFare]);

  useEffect(() => {
    setNewFareForm((current) => ({
      ...current,
      runId: selectedRun?.id ?? "",
      firstLocation: stationStops.items[0]?.stationCode ?? current.firstLocation,
      secondLocation: stationStops.items.at(-1)?.stationCode ?? current.secondLocation
    }));
  }, [selectedRun?.id, stationStops]);

  useEffect(() => {
    setApprovalNotes(selectedRun?.isApproved ? "Reopened for correction." : "Ready for dispatch closeout.");
  }, [selectedRunId, selectedRun?.isApproved]);

  useEffect(() => {
    setRunStatusForm({
      status: trainRunStatus.status,
      comment: trainRunStatus.comment
    });
  }, [trainRunStatus]);

  const filteredFareRecords = fareEnforcement.items.filter((record) =>
    fareInspectorFilter
      ? record.inspectorName.toLowerCase().includes(fareInspectorFilter.toLowerCase())
      : true
  );

  async function runAction(action: () => Promise<unknown>, successMessage: string) {
    setFeedback(null);

    try {
      await action();
      setFeedback(successMessage);
    } catch (error) {
      setFeedback(`Action failed: ${error instanceof Error ? error.message : "request.failed"}`);
    }
  }

  return (
    <div className="page-stack">
      <Panel title="Operations staging" eyebrow={property.name}>
        <p>
          The operations route is now selection-driven: choose a run, load its dependent resources,
          then edit the currently selected record in each run-detail module.
        </p>
        <div className="badge-row">
          <StatusBadge tone={source === "api" ? "success" : "neutral"} label={source} />
          {selectedRun?.isApproved ? (
            <StatusBadge tone="warning" label="run locked" />
          ) : selectedRun?.approvalBlockers.length ? (
            <StatusBadge tone="warning" label={`${selectedRun.approvalBlockers.length} blockers`} />
          ) : (
            <StatusBadge tone="neutral" label="run editable" />
          )}
          {isSaving ? <StatusBadge tone="neutral" label="saving" /> : null}
        </div>
        {feedback ? <p className="inline-feedback">{feedback}</p> : null}
      </Panel>
      <div className="two-column-grid">
        <Panel title="Train schedules" eyebrow={`${schedules.items.length} loaded`}>
          <div className="list-stack">
            {schedules.items.length ? (
              schedules.items.map((schedule) => (
                <article
                  className={`list-row selectable-row ${schedule.id === selectedSchedule?.id ? "selected-row" : ""}`}
                  key={schedule.id}
                >
                  <div>
                    <strong>{schedule.trainNumber}</strong>
                    <p>{schedule.routeName}</p>
                  </div>
                  <div className="list-meta">
                    <span>{schedule.direction}</span>
                    <span>{schedule.stopCount} stops</span>
                  </div>
                </article>
              ))
            ) : (
              <p>No train schedules seeded for this property yet.</p>
            )}
          </div>
        </Panel>
        <Panel
          title={selectedSchedule ? `Run detail for ${selectedSchedule.trainNumber}` : "Train run detail"}
          eyebrow="Selection-driven detail"
        >
          {selectedSchedule ? (
            <div className="detail-stack">
              <p>{selectedSchedule.routeName}</p>
              <div className="badge-row">
                {selectedSchedule.serviceDays.map((day) => (
                  <StatusBadge key={day} tone="neutral" label={day} />
                ))}
              </div>
              <div className="editor-grid">
                <label className="field-stack">
                  <span>Initialize Date</span>
                  <input
                    onChange={(event) => {
                      setInitializeDate(event.target.value);
                    }}
                    type="date"
                    value={initializeDate}
                  />
                </label>
                <button
                  className="action-button"
                  disabled={isSaving || !canInitializeSchedules}
                  onClick={() => {
                    void runAction(
                      async () => {
                        const result = await initializeRuns({
                          operatingDate: initializeDate,
                          scheduleIds: selectedSchedule ? [selectedSchedule.id] : []
                        });

                        if (!result?.createdRuns.length) {
                          throw new Error(
                            `no runs initialized${result?.skippedScheduleIds.length ? `; skipped ${result.skippedScheduleIds.join(", ")}` : ""}`
                          );
                        }
                      },
                      `Initialized ${selectedSchedule.trainNumber} for ${initializeDate}.`
                    );
                  }}
                  type="button"
                >
                  Initialize selected schedule
                </button>
              </div>
              <div className="list-stack">
                {scheduleRuns.map((run) => (
                  <button
                    className={`selection-card ${run.id === selectedRun?.id ? "is-selected" : ""}`}
                    key={run.id}
                    onClick={() => {
                      void selectRun(run.id);
                    }}
                    type="button"
                  >
                    <div>
                      <strong>{run.operatingDate}</strong>
                      <p>{run.trainNumber}</p>
                      <p>{run.isApproved ? `Approved ${run.approvedAt ?? ""}` : "Editable until approved"}</p>
                      {run.approvalBlockers.length ? (
                        <p>{run.approvalBlockers.join(" ")}</p>
                      ) : null}
                    </div>
                    <div className="list-meta">
                      <StatusBadge
                        tone={
                          run.status === "approved"
                            ? "success"
                            : run.status === "delayed"
                              ? "warning"
                              : "neutral"
                        }
                        label={run.status}
                      />
                      <span>{run.delayMinutes} min</span>
                    </div>
                  </button>
                ))}
              </div>
              {selectedRun ? (
                <div className="editor-grid">
                  <article className="metric-card">
                    <span>Schedule readiness</span>
                    <strong>
                      {scheduleApprovalSummary.readyCount}/{scheduleApprovalSummary.totalRuns}
                    </strong>
                  </article>
                  <article className="metric-card">
                    <span>Blocked runs</span>
                    <strong>{scheduleApprovalSummary.blockedCount}</strong>
                  </article>
                  <article className="metric-card">
                    <span>Schedule delay total</span>
                    <strong>{scheduleApprovalSummary.totalDelayMinutes} min</strong>
                  </article>
                  <label className="field-stack editor-span">
                    <span>Run Status</span>
                    <select
                      onChange={(event) => {
                        setRunStatusForm((current) => ({
                          ...current,
                          status: event.target.value as TrainRunStatusUpdate["status"]
                        }));
                      }}
                      value={runStatusForm.status}
                    >
                      <option value="scheduled">scheduled</option>
                      <option value="in_progress">in_progress</option>
                      <option value="delayed">delayed</option>
                      <option value="approved">approved</option>
                    </select>
                  </label>
                  <label className="field-stack editor-span">
                    <span>Status Comment</span>
                    <textarea
                      onChange={(event) => {
                        setRunStatusForm((current) => ({ ...current, comment: event.target.value }));
                      }}
                      rows={2}
                      value={runStatusForm.comment}
                    />
                  </label>
                  <button
                    className="action-button"
                    disabled={isSaving || !canEditRuns}
                    onClick={() => {
                      void runAction(
                        () => saveRunStatus(selectedRun.id, runStatusForm),
                        "Run status and comment updated."
                      );
                    }}
                    type="button"
                  >
                    Save run status
                  </button>
                  {selectedRun.approvalBlockers.length ? (
                    <p className="inline-feedback editor-span">{selectedRun.approvalBlockers.join(" ")}</p>
                  ) : null}
                  <label className="field-stack editor-span">
                    <span>Approval Notes</span>
                    <textarea
                      onChange={(event) => {
                        setApprovalNotes(event.target.value);
                      }}
                      rows={3}
                      value={approvalNotes}
                    />
                  </label>
                  <button
                    className="action-button"
                    disabled={
                      selectedRun.isApproved ||
                      isSaving ||
                      selectedRun.approvalBlockers.length > 0 ||
                      !canApproveRuns
                    }
                    onClick={() => {
                      void runAction(
                        () => saveRunApproval(selectedRun.id, { isApproved: true, notes: approvalNotes }),
                        "Run approved and lock applied."
                      );
                    }}
                    type="button"
                  >
                    Approve selected run
                  </button>
                  <button
                    className="action-button"
                    disabled={isSaving || batchReadyRunIds.length === 0 || !canApproveRuns}
                    onClick={() => {
                      void runAction(
                        async () => {
                          const result = await saveBatchRunApproval({
                            runIds: batchReadyRunIds,
                            isApproved: true,
                            notes: approvalNotes
                          });

                          if (result?.blockedRuns.length) {
                            throw new Error(
                              `batch blocked for ${result.blockedRuns.map((entry) => entry.runId).join(", ")}`
                            );
                          }
                        },
                        `Approved ${batchReadyRunIds.length} run(s) for this schedule.`
                      );
                    }}
                    type="button"
                  >
                    Approve ready runs in schedule
                  </button>
                  <button
                    className="action-button"
                    disabled={selectedRun.isApproved || isSaving || !canEditRuns}
                    onClick={() => {
                      void runAction(
                        () => resetRun(selectedRun.id),
                        "Run reset and operational data cleared."
                      );
                    }}
                    type="button"
                  >
                    Reset selected run
                  </button>
                  <button
                    className="action-button"
                    disabled={selectedRun.isApproved || isSaving || !canEditRuns}
                    onClick={() => {
                      void runAction(
                        () => deleteRun(selectedRun.id),
                        "Run deleted from the schedule."
                      );
                    }}
                    type="button"
                  >
                    Delete selected run
                  </button>
                  <button
                    className="action-button"
                    disabled={isSaving || batchApprovedRunIds.length === 0 || !canApproveRuns}
                    onClick={() => {
                      void runAction(
                        () =>
                          saveBatchRunApproval({
                            runIds: batchApprovedRunIds,
                            isApproved: false,
                            notes: approvalNotes
                          }),
                        `Reopened ${batchApprovedRunIds.length} approved run(s) in this schedule.`
                      );
                    }}
                    type="button"
                  >
                    Reopen approved runs in schedule
                  </button>
                  {selectedRun.isApproved ? (
                    <button
                      className="action-button"
                      disabled={isSaving || !canApproveRuns}
                      onClick={() => {
                        void runAction(
                          () => saveRunApproval(selectedRun.id, { isApproved: false, notes: approvalNotes }),
                          "Run reopened and editing restored."
                        );
                      }}
                      type="button"
                    >
                      Reopen selected run
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <p>Selecting schedules will drive detail panes here as train modules expand.</p>
          )}
        </Panel>
      </div>
      <div className="two-column-grid">
        <Panel title="Station stops" eyebrow={`${stationStops.items.length} stops`}>
          <div className="list-stack">
            {stationStops.items.map((stop) => (
              <button
                className={`selection-card ${stop.id === selectedStop?.id ? "is-selected" : ""}`}
                key={stop.id}
                onClick={() => {
                  setSelectedStopId(stop.id);
                }}
                type="button"
              >
                <div>
                  <strong>
                    {stop.sequence}. {stop.stationCode}
                  </strong>
                  <p>
                    Scheduled {stop.scheduledTime}
                    {stop.actualTime ? `, actual ${stop.actualTime}` : ", pending"}
                  </p>
                </div>
                <div className="list-meta">
                  <span>+{stop.boardings}</span>
                  <span>-{stop.alightings}</span>
                </div>
              </button>
            ))}
          </div>
          {selectedRun && selectedStop ? (
            <div className="editor-grid">
              <label className="field-stack">
                <span>Actual Time</span>
                <input
                  onChange={(event) => {
                    const value = event.target.value;
                    setStopForm((current) => ({ ...current, actualTime: value || null }));
                  }}
                  type="text"
                  value={stopForm.actualTime ?? ""}
                />
              </label>
              <label className="field-stack">
                <span>Boardings</span>
                <input
                  min="0"
                  onChange={(event) => {
                    setStopForm((current) => ({
                      ...current,
                      boardings: Number(event.target.value)
                    }));
                  }}
                  type="number"
                  value={stopForm.boardings}
                />
              </label>
              <label className="field-stack">
                <span>Alightings</span>
                <input
                  min="0"
                  onChange={(event) => {
                    setStopForm((current) => ({
                      ...current,
                      alightings: Number(event.target.value)
                    }));
                  }}
                  type="number"
                  value={stopForm.alightings}
                />
              </label>
              <div className="action-row">
                <button
                  className="action-button"
                  disabled={selectedRun.isApproved || isSaving || !canEditStops}
                  onClick={() => {
                    void runAction(
                      () => saveStop(selectedRun.id, selectedStop.id, stopForm),
                      "Station stop updated."
                    );
                  }}
                  type="button"
                >
                  Save selected stop
                </button>
              </div>
            </div>
          ) : null}
        </Panel>
        <Panel title="Delay log" eyebrow={`${delayEvents.items.length} events`}>
          <div className="list-stack">
            {delayEvents.items.map((delay) => (
              <button
                className={`selection-card ${delay.id === selectedDelay?.id ? "is-selected" : ""}`}
                key={delay.id}
                onClick={() => {
                  setSelectedDelayId(delay.id);
                }}
                type="button"
              >
                <div>
                  <strong>{delay.category}</strong>
                  <p>{delay.notes}</p>
                </div>
                <div className="list-meta">
                  <StatusBadge tone="warning" label={`${delay.minutes} min`} />
                  <span>{delay.reportedAt}</span>
                </div>
              </button>
            ))}
          </div>
          {selectedRun && selectedDelay ? (
            <div className="editor-grid">
              <label className="field-stack">
                <span>Category</span>
                <input
                  onChange={(event) => {
                    setDelayForm((current) => ({ ...current, category: event.target.value }));
                  }}
                  type="text"
                  value={delayForm.category}
                />
              </label>
              <label className="field-stack">
                <span>Minutes</span>
                <input
                  min="0"
                  onChange={(event) => {
                    setDelayForm((current) => ({ ...current, minutes: Number(event.target.value) }));
                  }}
                  type="number"
                  value={delayForm.minutes}
                />
              </label>
              <label className="field-stack editor-span">
                <span>Notes</span>
                <textarea
                  onChange={(event) => {
                    setDelayForm((current) => ({ ...current, notes: event.target.value }));
                  }}
                  rows={3}
                  value={delayForm.notes}
                />
              </label>
              <label className="field-stack editor-span">
                <span>Reported At</span>
                <input
                  onChange={(event) => {
                    setDelayForm((current) => ({ ...current, reportedAt: event.target.value }));
                  }}
                  type="text"
                  value={delayForm.reportedAt}
                />
              </label>
              <div className="action-row">
                <button
                  className="action-button"
                  disabled={selectedRun.isApproved || isSaving || !canEditDelays}
                  onClick={() => {
                    void runAction(
                      () => saveDelay(selectedRun.id, selectedDelay.id, delayForm),
                      "Delay event updated."
                    );
                  }}
                  type="button"
                >
                  Save selected delay
                </button>
                <button
                  className="action-button"
                  disabled={selectedRun.isApproved || isSaving || !canEditDelays}
                  onClick={() => {
                    void runAction(
                      () => deleteDelay(selectedRun.id, selectedDelay.id),
                      "Delay event deleted."
                    );
                  }}
                  type="button"
                >
                  Delete selected delay
                </button>
              </div>
              <label className="field-stack editor-span">
                <span>Location Detail</span>
                <input
                  list="delay-common-locations"
                  onChange={(event) => {
                    setDelayAdditionalForm((current) => ({
                      ...current,
                      locationDetail: event.target.value
                    }));
                  }}
                  type="text"
                  value={delayAdditionalForm.locationDetail}
                />
                <datalist id="delay-common-locations">
                  {delayCommonLocations.items.map((item) => (
                    <option key={item.id} value={item.label} />
                  ))}
                </datalist>
              </label>
              <label className="field-stack">
                <span>Responsible Party</span>
                <input
                  onChange={(event) => {
                    setDelayAdditionalForm((current) => ({
                      ...current,
                      responsibleParty: event.target.value
                    }));
                  }}
                  type="text"
                  value={delayAdditionalForm.responsibleParty}
                />
              </label>
              <label className="field-stack">
                <span>Notable Delay Type</span>
                <input
                  onChange={(event) => {
                    setDelayAdditionalForm((current) => ({
                      ...current,
                      notableDelayType: event.target.value
                    }));
                  }}
                  type="text"
                  value={delayAdditionalForm.notableDelayType}
                />
              </label>
              <label className="field-stack">
                <span>Special Movement</span>
                <select
                  onChange={(event) => {
                    setDelayAdditionalForm((current) => ({
                      ...current,
                      specialMovementId: event.target.value || null
                    }));
                  }}
                  value={delayAdditionalForm.specialMovementId ?? ""}
                >
                  <option value="">None</option>
                  {specialMovements.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Work Order</span>
                <input
                  onChange={(event) => {
                    setDelayAdditionalForm((current) => ({
                      ...current,
                      workOrderId: event.target.value || null
                    }));
                  }}
                  type="text"
                  value={delayAdditionalForm.workOrderId ?? ""}
                />
              </label>
              <label className="field-stack editor-span">
                <span>Mechanical Notes</span>
                <textarea
                  onChange={(event) => {
                    setDelayAdditionalForm((current) => ({
                      ...current,
                      mechanicalNotes: event.target.value
                    }));
                  }}
                  rows={2}
                  value={delayAdditionalForm.mechanicalNotes}
                />
              </label>
              <label className="field-stack editor-span">
                <span>Passenger Impact Summary</span>
                <textarea
                  onChange={(event) => {
                    setDelayAdditionalForm((current) => ({
                      ...current,
                      passengerImpactSummary: event.target.value
                    }));
                  }}
                  rows={2}
                  value={delayAdditionalForm.passengerImpactSummary}
                />
              </label>
              <div className="action-row">
                <button
                  className="action-button"
                  disabled={selectedRun.isApproved || isSaving || !canEditDelays}
                  onClick={() => {
                    void runAction(
                      () => saveDelayAdditionalInfo(selectedDelay.id, delayAdditionalForm),
                      "Delay additional info updated."
                    );
                  }}
                  type="button"
                >
                  Save delay metadata
                </button>
                <button
                  className="action-button"
                  disabled={selectedRun.isApproved || isSaving || !canEditDelays}
                  onClick={() => {
                    void runAction(
                      () => clearDelayAdditionalInfo(selectedDelay.id),
                      "Delay additional info cleared."
                    );
                  }}
                  type="button"
                >
                  Clear delay metadata
                </button>
              </div>
              <article className="metric-card editor-span">
                <span>Propagation preview</span>
                <strong>{delayPropagationPreview.totalProjectedDelayMinutes} min downstream</strong>
                <p>
                  {delayPropagationPreview.impactedStopCount} impacted stop(s)
                  {delayPropagationPreview.requiresCmmsFollowup ? " · CMMS follow-up suggested" : ""}
                </p>
              </article>
              <label className="field-stack">
                <span>Notable delay type catalog</span>
                <select
                  onChange={(event) => {
                    setWorkOrderForm((current) => ({
                      ...current,
                      notableDelayType: event.target.value
                    }));
                  }}
                  value={workOrderForm.notableDelayType}
                >
                  <option value="">Select type</option>
                  {notableDelayTypes.items.map((item) => (
                    <option key={item.id} value={item.label}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Repair Type</span>
                <input
                  onChange={(event) => {
                    setWorkOrderForm((current) => ({ ...current, repairType: event.target.value }));
                  }}
                  type="text"
                  value={workOrderForm.repairType}
                />
              </label>
              <label className="field-stack">
                <span>Priority</span>
                <select
                  onChange={(event) => {
                    setWorkOrderForm((current) => ({
                      ...current,
                      priority: event.target.value as DelayWorkOrderCreate["priority"]
                    }));
                  }}
                  value={workOrderForm.priority}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </label>
              <label className="field-stack">
                <span>Asset ID</span>
                <input
                  onChange={(event) => {
                    setWorkOrderForm((current) => ({
                      ...current,
                      assetId: event.target.value || null
                    }));
                  }}
                  type="text"
                  value={workOrderForm.assetId ?? ""}
                />
              </label>
              <div className="action-row editor-span">
                <button
                  className="action-button"
                  disabled={
                    selectedRun.isApproved ||
                    isSaving ||
                    !canEditDelays ||
                    !workOrderForm.notableDelayType
                  }
                  onClick={() => {
                    void runAction(
                      () => createWorkOrder(selectedDelay.id, workOrderForm),
                      "Delay work order created."
                    );
                  }}
                  type="button"
                >
                  {delayWorkOrders[selectedDelay.id] ? "Replace work order" : "Create work order"}
                </button>
                {delayWorkOrders[selectedDelay.id] ? (
                  <p className="inline-feedback">
                    {delayWorkOrders[selectedDelay.id]!.workOrderId} · {delayWorkOrders[selectedDelay.id]!.status}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
          {selectedRun ? (
            <div className="editor-grid">
              <label className="field-stack editor-span">
                <span>Delay Template</span>
                <select
                  onChange={(event) => {
                    setSelectedDelayTemplateId(event.target.value);
                  }}
                  value={selectedDelayTemplateId}
                >
                  <option value="">Select template</option>
                  {delayTemplates.items.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Template Reported At</span>
                <input
                  onChange={(event) => {
                    setDelayTemplateReportedAt(event.target.value);
                  }}
                  type="text"
                  value={delayTemplateReportedAt}
                />
              </label>
              <div className="action-row">
                <button
                  className="action-button"
                  disabled={
                    selectedRun.isApproved ||
                    isSaving ||
                    !selectedDelayTemplateId ||
                    !canEditDelays
                  }
                  onClick={() => {
                    void runAction(
                      () =>
                        createDelayTemplate(
                          selectedRun.id,
                          selectedDelayTemplateId,
                          delayTemplateReportedAt
                        ),
                      "Delay created from template."
                    );
                  }}
                  type="button"
                >
                  Add delay from template
                </button>
              </div>
              <label className="field-stack">
                <span>Delay 1 Category</span>
                <select
                  onChange={(event) => {
                    updateBatchDelay(0, { category: event.target.value });
                  }}
                  value={newDelayBatch.delays[0]?.category ?? ""}
                >
                  {referenceData.delayReasons.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Delay 1 Minutes</span>
                <input
                  min="0"
                  onChange={(event) => {
                    updateBatchDelay(0, { minutes: Number(event.target.value) });
                  }}
                  type="number"
                  value={newDelayBatch.delays[0]?.minutes ?? 0}
                />
              </label>
              <label className="field-stack">
                <span>Delay 2 Category</span>
                <select
                  onChange={(event) => {
                    updateBatchDelay(1, { category: event.target.value });
                  }}
                  value={newDelayBatch.delays[1]?.category ?? ""}
                >
                  {referenceData.delayReasons.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Delay 2 Minutes</span>
                <input
                  min="0"
                  onChange={(event) => {
                    updateBatchDelay(1, { minutes: Number(event.target.value) });
                  }}
                  type="number"
                  value={newDelayBatch.delays[1]?.minutes ?? 0}
                />
              </label>
              <label className="field-stack editor-span">
                <span>Delay 1 Notes</span>
                <textarea
                  onChange={(event) => {
                    updateBatchDelay(0, { notes: event.target.value });
                  }}
                  rows={2}
                  value={newDelayBatch.delays[0]?.notes ?? ""}
                />
              </label>
              <label className="field-stack editor-span">
                <span>Delay 2 Notes</span>
                <textarea
                  onChange={(event) => {
                    updateBatchDelay(1, { notes: event.target.value });
                  }}
                  rows={2}
                  value={newDelayBatch.delays[1]?.notes ?? ""}
                />
              </label>
              <div className="action-row">
                <button
                  className="action-button"
                  disabled={selectedRun.isApproved || isSaving || !canEditDelays}
                  onClick={() => {
                    void runAction(
                      () => createDelayBatch(selectedRun.id, newDelayBatch),
                      `Added ${newDelayBatch.delays.length} delay events.`
                    );
                  }}
                  type="button"
                >
                  Add multiple delays
                </button>
              </div>
            </div>
          ) : null}
        </Panel>
      </div>
      <div className="two-column-grid">
        <Panel title="Consist and equipment" eyebrow={`${consist.items.length} units`}>
          <div className="list-stack">
            {consist.items.map((equipment) => (
              <button
                className={`selection-card ${equipment.id === selectedEquipment?.id ? "is-selected" : ""}`}
                key={equipment.id}
                onClick={() => {
                  setSelectedEquipmentId(equipment.id);
                }}
                type="button"
              >
                <div>
                  <strong>
                    {equipment.position}. {equipment.equipmentNumber}
                  </strong>
                  <p>{equipment.equipmentType}</p>
                </div>
                <div className="list-meta">
                  <StatusBadge
                    tone={equipment.status === "active" ? "success" : "warning"}
                    label={equipment.status}
                  />
                </div>
              </button>
            ))}
          </div>
          {selectedRun && selectedEquipment ? (
            <div className="editor-grid">
              <label className="field-stack editor-span">
                <span>Swap Template</span>
                <select
                  onChange={(event) => {
                    setSelectedConsistTemplateId(event.target.value);
                  }}
                  value={selectedConsistTemplateId}
                >
                  <option value="">Select template</option>
                  {consistTemplates.items.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Position</span>
                <input
                  min="1"
                  onChange={(event) => {
                    setEquipmentForm((current) => ({
                      ...current,
                      position: Number(event.target.value)
                    }));
                  }}
                  type="number"
                  value={equipmentForm.position}
                />
              </label>
              <label className="field-stack">
                <span>Status</span>
                <select
                  onChange={(event) => {
                    setEquipmentForm((current) => ({
                      ...current,
                      status: event.target.value as ConsistEquipmentUpdate["status"]
                    }));
                  }}
                  value={equipmentForm.status}
                >
                  <option value="active">active</option>
                  <option value="bad_order">bad_order</option>
                  <option value="spare">spare</option>
                </select>
              </label>
              <div className="action-row">
                <button
                  className="action-button"
                  disabled={
                    selectedRun.isApproved ||
                    isSaving ||
                    !selectedConsistTemplateId ||
                    !canEditConsist
                  }
                  onClick={() => {
                    void runAction(
                      () => swapConsist(selectedRun.id, selectedConsistTemplateId),
                      "Consist swapped from template."
                    );
                  }}
                  type="button"
                >
                  Swap consist
                </button>
                <button
                  className="action-button"
                  disabled={selectedRun.isApproved || isSaving || !canEditConsist}
                  onClick={() => {
                    void runAction(
                      () => saveConsist(selectedRun.id, selectedEquipment.id, equipmentForm),
                      "Consist equipment updated."
                    );
                  }}
                  type="button"
                >
                  Save selected equipment
                </button>
              </div>
            </div>
          ) : null}
        </Panel>
        <Panel title="Crew assignment" eyebrow={`${crew.items.length} assigned`}>
          <div className="list-stack">
            {crew.items.map((assignment) => (
              <button
                className={`selection-card ${assignment.id === selectedCrew?.id ? "is-selected" : ""}`}
                key={assignment.id}
                onClick={() => {
                  setSelectedCrewId(assignment.id);
                }}
                type="button"
              >
                <div>
                  <strong>{assignment.employeeName}</strong>
                  <p>
                    {assignment.role} · On duty {assignment.onDutyTime}
                  </p>
                </div>
                <div className="list-meta">
                  <StatusBadge
                    tone={
                      assignment.status === "assigned"
                        ? "success"
                        : assignment.status === "pending_relief"
                          ? "warning"
                          : "neutral"
                    }
                    label={assignment.status}
                  />
                </div>
              </button>
            ))}
          </div>
          {selectedRun && selectedCrew ? (
            <div className="editor-grid">
              <label className="field-stack editor-span">
                <span>Swap Template</span>
                <select
                  onChange={(event) => {
                    setSelectedCrewTemplateId(event.target.value);
                  }}
                  value={selectedCrewTemplateId}
                >
                  <option value="">Select template</option>
                  {crewTemplates.items.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-stack">
                <span>Role</span>
                <input
                  onChange={(event) => {
                    setCrewForm((current) => ({ ...current, role: event.target.value }));
                  }}
                  type="text"
                  value={crewForm.role}
                />
              </label>
              <label className="field-stack">
                <span>On Duty</span>
                <input
                  onChange={(event) => {
                    setCrewForm((current) => ({ ...current, onDutyTime: event.target.value }));
                  }}
                  type="text"
                  value={crewForm.onDutyTime}
                />
              </label>
              <label className="field-stack">
                <span>Status</span>
                <select
                  onChange={(event) => {
                    setCrewForm((current) => ({
                      ...current,
                      status: event.target.value as CrewAssignmentUpdate["status"]
                    }));
                  }}
                  value={crewForm.status}
                >
                  <option value="assigned">assigned</option>
                  <option value="pending_relief">pending_relief</option>
                  <option value="complete">complete</option>
                </select>
              </label>
              <div className="action-row">
                <button
                  className="action-button"
                  disabled={
                    selectedRun.isApproved ||
                    isSaving ||
                    !selectedCrewTemplateId ||
                    !canAssignCrew
                  }
                  onClick={() => {
                    void runAction(
                      () => swapCrew(selectedRun.id, selectedCrewTemplateId),
                      "Crew assignment swapped from template."
                    );
                  }}
                  type="button"
                >
                  Swap crew
                </button>
                <button
                  className="action-button"
                  disabled={selectedRun.isApproved || isSaving || !canAssignCrew}
                  onClick={() => {
                    void runAction(
                      () => saveCrew(selectedRun.id, selectedCrew.id, crewForm),
                      "Crew assignment updated."
                    );
                  }}
                  type="button"
                >
                  Save selected crew
                </button>
              </div>
            </div>
          ) : null}
        </Panel>
      </div>
      <div className="two-column-grid">
        <Panel title="Fare enforcement dashboard" eyebrow="Property rollup">
          <div className="stats-grid">
            <article className="metric-card">
              <span>Total records</span>
              <strong>{fareDashboard.totalRecords}</strong>
            </article>
            <article className="metric-card">
              <span>Total activity</span>
              <strong>{fareDashboard.totalActivityCount}</strong>
            </article>
            <article className="metric-card">
              <span>Covered runs</span>
              <strong>{fareDashboard.coveredRuns}</strong>
            </article>
            <article className="metric-card">
              <span>Uncovered runs</span>
              <strong>{fareDashboard.uncoveredRuns.length}</strong>
            </article>
            <article className="metric-card">
              <span>Amtrak transfers</span>
              <strong>{fareDashboard.totalAmtrakTransfers}</strong>
            </article>
            <article className="metric-card">
              <span>Amtrak tickets</span>
              <strong>{fareDashboard.totalAmtrakTickets}</strong>
            </article>
            <article className="metric-card">
              <span>UPass total</span>
              <strong>{fareDashboard.totalUpassCount}</strong>
            </article>
            <article className="metric-card">
              <span>Tickets sold</span>
              <strong>{fareDashboard.totalTicketsSold}</strong>
            </article>
          </div>
          <div className="detail-stack">
            <div>
              <p className="eyebrow">Top inspectors</p>
              <div className="list-stack">
                {fareDashboard.topInspectors.length ? (
                  fareDashboard.topInspectors.map((inspector) => (
                    <article className="list-row" key={inspector.inspectorName}>
                      <div>
                        <strong>{inspector.inspectorName}</strong>
                        <p>{inspector.recordCount} records logged</p>
                      </div>
                      <div className="list-meta">
                        <span>{inspector.activityCount} activities</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <p>No inspectors have logged activity yet.</p>
                )}
              </div>
            </div>
            <div>
              <p className="eyebrow">Runs without coverage</p>
              <div className="badge-row">
                {fareDashboard.uncoveredRuns.length ? (
                  fareDashboard.uncoveredRuns.map((runId) => (
                    <StatusBadge key={runId} tone="warning" label={runId} />
                  ))
                ) : (
                  <StatusBadge tone="success" label="all runs covered" />
                )}
              </div>
            </div>
          </div>
        </Panel>
        <Panel title="Fare enforcement" eyebrow={`${fareEnforcement.items.length} records`}>
        <div className="three-column-grid">
          {fareSummary.items.length ? (
            fareSummary.items.map((summary) => (
              <button
                className={`selection-card ${summary.runId === selectedRun?.id ? "is-selected" : ""}`}
                key={summary.runId}
                onClick={() => {
                  void selectRun(summary.runId);
                }}
                type="button"
              >
                <div>
                  <strong>{summary.runId}</strong>
                  <p>{summary.recordCount} records</p>
                  <p>
                    Transfers {summary.amtrakTransfers} · Tickets {summary.amtrakTickets} · UPass{" "}
                    {summary.upassCount} · Sold {summary.ticketsSold}
                  </p>
                </div>
                <div className="list-meta">
                  <StatusBadge tone="neutral" label={`${summary.activityCount} checks`} />
                  <span>{summary.inspectors.join(", ")}</span>
                </div>
              </button>
            ))
          ) : (
            <p className="editor-span">No fare enforcement summaries available for this property yet.</p>
          )}
        </div>
        {selectedRun ? (
          <div className="editor-grid">
            <label className="field-stack">
              <span>Run</span>
              <input readOnly type="text" value={newFareForm.runId} />
            </label>
            <label className="field-stack">
              <span>Inspector</span>
              <input
                onChange={(event) => {
                  setNewFareForm((current) => ({ ...current, inspectorName: event.target.value }));
                }}
                type="text"
                value={newFareForm.inspectorName}
              />
            </label>
            <label className="field-stack">
              <span>First Location</span>
              <input
                onChange={(event) => {
                  setNewFareForm((current) => ({ ...current, firstLocation: event.target.value }));
                }}
                type="text"
                value={newFareForm.firstLocation}
              />
            </label>
            <label className="field-stack">
              <span>Second Location</span>
              <input
                onChange={(event) => {
                  setNewFareForm((current) => ({ ...current, secondLocation: event.target.value }));
                }}
                type="text"
                value={newFareForm.secondLocation}
              />
            </label>
            <label className="field-stack">
              <span>Activity Count</span>
              <input
                min="0"
                onChange={(event) => {
                  setNewFareForm((current) => ({
                    ...current,
                    activityCount: Number(event.target.value)
                  }));
                }}
                type="number"
                value={newFareForm.activityCount}
              />
            </label>
            <label className="field-stack">
              <span>Amtrak Transfers</span>
              <input
                min="0"
                onChange={(event) => {
                  setNewFareForm((current) => ({
                    ...current,
                    amtrakTransfers: Number(event.target.value)
                  }));
                }}
                type="number"
                value={newFareForm.amtrakTransfers}
              />
            </label>
            <label className="field-stack">
              <span>Amtrak Tickets</span>
              <input
                min="0"
                onChange={(event) => {
                  setNewFareForm((current) => ({
                    ...current,
                    amtrakTickets: Number(event.target.value)
                  }));
                }}
                type="number"
                value={newFareForm.amtrakTickets}
              />
            </label>
            <label className="field-stack">
              <span>UPass</span>
              <input
                min="0"
                onChange={(event) => {
                  setNewFareForm((current) => ({
                    ...current,
                    upassCount: Number(event.target.value)
                  }));
                }}
                type="number"
                value={newFareForm.upassCount}
              />
            </label>
            <label className="field-stack">
              <span>Tickets Sold</span>
              <input
                min="0"
                onChange={(event) => {
                  setNewFareForm((current) => ({
                    ...current,
                    ticketsSold: Number(event.target.value)
                  }));
                }}
                type="number"
                value={newFareForm.ticketsSold}
              />
            </label>
            <label className="field-stack editor-span">
              <span>Notes</span>
              <textarea
                onChange={(event) => {
                  setNewFareForm((current) => ({ ...current, notes: event.target.value }));
                }}
                rows={3}
                value={newFareForm.notes}
              />
            </label>
            <label className="field-stack editor-span">
              <span>Captured At</span>
              <input
                onChange={(event) => {
                  setNewFareForm((current) => ({ ...current, capturedAt: event.target.value }));
                }}
                type="text"
                value={newFareForm.capturedAt}
              />
            </label>
            <div className="action-row">
              <button
                className="action-button"
                disabled={isSaving || !canEditFare}
                onClick={() => {
                  void runAction(async () => {
                    const record = await createFare(newFareForm);
                    if (record) {
                      setSelectedFareId(record.id);
                    }
                    return record;
                  }, "Fare enforcement record created.");
                }}
                type="button"
              >
                Create fare record
              </button>
            </div>
          </div>
        ) : null}
        <label className="field-stack">
          <span>Inspector Filter</span>
          <input
            onChange={(event) => {
              setFareInspectorFilter(event.target.value);
            }}
            placeholder="Filter current run by inspector"
            type="text"
            value={fareInspectorFilter}
          />
        </label>
        <div className="list-stack">
          {filteredFareRecords.length ? (
            filteredFareRecords.map((record) => (
              <button
                className={`selection-card ${record.id === selectedFare?.id ? "is-selected" : ""}`}
                key={record.id}
                onClick={() => {
                  setSelectedFareId(record.id);
                }}
                type="button"
              >
                <div>
                  <strong>{record.inspectorName}</strong>
                  <p>
                    {record.firstLocation} to {record.secondLocation}
                  </p>
                  <p>
                    Transfers {record.amtrakTransfers} · Tickets {record.amtrakTickets} · UPass{" "}
                    {record.upassCount} · Sold {record.ticketsSold}
                  </p>
                  <p>{record.notes}</p>
                </div>
                <div className="list-meta">
                  <StatusBadge tone="neutral" label={`${record.activityCount} checks`} />
                  <span>{record.capturedAt}</span>
                </div>
              </button>
            ))
          ) : (
            <p>No fare enforcement records seeded for this run yet.</p>
          )}
        </div>
        {selectedFare ? (
          <div className="editor-grid">
            <label className="field-stack">
              <span>Inspector</span>
              <input
                onChange={(event) => {
                  setFareForm((current) => ({ ...current, inspectorName: event.target.value }));
                }}
                type="text"
                value={fareForm.inspectorName}
              />
            </label>
            <label className="field-stack">
              <span>First Location</span>
              <input
                onChange={(event) => {
                  setFareForm((current) => ({ ...current, firstLocation: event.target.value }));
                }}
                type="text"
                value={fareForm.firstLocation}
              />
            </label>
            <label className="field-stack">
              <span>Second Location</span>
              <input
                onChange={(event) => {
                  setFareForm((current) => ({ ...current, secondLocation: event.target.value }));
                }}
                type="text"
                value={fareForm.secondLocation}
              />
            </label>
            <label className="field-stack">
              <span>Activity Count</span>
              <input
                min="0"
                onChange={(event) => {
                  setFareForm((current) => ({
                    ...current,
                    activityCount: Number(event.target.value)
                  }));
                }}
                type="number"
                value={fareForm.activityCount}
              />
            </label>
            <label className="field-stack">
              <span>Amtrak Transfers</span>
              <input
                min="0"
                onChange={(event) => {
                  setFareForm((current) => ({
                    ...current,
                    amtrakTransfers: Number(event.target.value)
                  }));
                }}
                type="number"
                value={fareForm.amtrakTransfers}
              />
            </label>
            <label className="field-stack">
              <span>Amtrak Tickets</span>
              <input
                min="0"
                onChange={(event) => {
                  setFareForm((current) => ({
                    ...current,
                    amtrakTickets: Number(event.target.value)
                  }));
                }}
                type="number"
                value={fareForm.amtrakTickets}
              />
            </label>
            <label className="field-stack">
              <span>UPass</span>
              <input
                min="0"
                onChange={(event) => {
                  setFareForm((current) => ({
                    ...current,
                    upassCount: Number(event.target.value)
                  }));
                }}
                type="number"
                value={fareForm.upassCount}
              />
            </label>
            <label className="field-stack">
              <span>Tickets Sold</span>
              <input
                min="0"
                onChange={(event) => {
                  setFareForm((current) => ({
                    ...current,
                    ticketsSold: Number(event.target.value)
                  }));
                }}
                type="number"
                value={fareForm.ticketsSold}
              />
            </label>
            <label className="field-stack editor-span">
              <span>Notes</span>
              <textarea
                onChange={(event) => {
                  setFareForm((current) => ({ ...current, notes: event.target.value }));
                }}
                rows={3}
                value={fareForm.notes}
              />
            </label>
            <label className="field-stack editor-span">
              <span>Captured At</span>
              <input
                onChange={(event) => {
                  setFareForm((current) => ({ ...current, capturedAt: event.target.value }));
                }}
                type="text"
                value={fareForm.capturedAt}
              />
            </label>
            <div className="action-row">
              <button
                className="action-button"
                disabled={isSaving || !canEditFare}
                onClick={() => {
                  void runAction(
                    () => saveFare(selectedFare.id, fareForm),
                    "Fare enforcement record updated."
                  );
                }}
                type="button"
              >
                Save selected fare record
              </button>
              <button
                className="action-button secondary"
                disabled={isSaving || !canEditFare}
                onClick={() => {
                  void runAction(async () => {
                    const result = await deleteFare(selectedFare.id);
                    setSelectedFareId(null);
                    return result;
                  }, "Fare enforcement record deleted.");
                }}
                type="button"
              >
                Delete selected fare record
              </button>
            </div>
            <div className="editor-span">
              <h4>Fare history</h4>
              <div className="list-stack">
                {fareHistory.items.length ? (
                  fareHistory.items.map((entry) => (
                    <article className="selection-card" key={entry.id}>
                      <div>
                        <strong>{entry.action}</strong>
                        <p>{entry.notes}</p>
                      </div>
                      <div className="list-meta">
                        <StatusBadge label={entry.actorName} tone="neutral" />
                        <span>{entry.createdAt}</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <p>No fare history recorded for this selection yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
        </Panel>
      </div>
      <Panel title="Approval history" eyebrow={`${approvalHistory.items.length} events`}>
        <div className="list-stack">
          {approvalHistory.items.length ? (
            approvalHistory.items.map((entry) => (
              <article className="list-row" key={entry.id}>
                <div>
                  <strong>{entry.actorName}</strong>
                  <p>{entry.action}</p>
                  <p>{entry.notes}</p>
                </div>
                <div className="list-meta">
                  <StatusBadge
                    label={entry.action}
                    tone={entry.action === "approved" ? "success" : "warning"}
                  />
                  <span>{entry.createdAt}</span>
                </div>
              </article>
            ))
          ) : (
            <p>No approval events recorded for this run yet.</p>
          )}
        </div>
      </Panel>
      <Panel title="Operational impacts" eyebrow={`${impactSummary.impactedStationCount} downstream stop(s)`}>
        <div className="stats-grid">
          <article className="metric-card">
            <span>Total delay</span>
            <strong>{impactSummary.totalDelayMinutes} min</strong>
          </article>
          <article className="metric-card">
            <span>Max projected delay</span>
            <strong>{impactSummary.maxProjectedDelayMinutes} min</strong>
          </article>
          <article className="metric-card">
            <span>Affected passengers</span>
            <strong>{impactSummary.affectedPassengers}</strong>
          </article>
          <article className="metric-card">
            <span>Recovery target</span>
            <strong>{impactSummary.estimatedRecoveryTime ?? "None"}</strong>
          </article>
        </div>
        <div className="detail-stack">
          <div>
            <p className="eyebrow">Passenger impacts</p>
            <div className="list-stack">
              {impactSummary.passengerImpactSummaries.map((summary) => (
                <article className="list-row" key={summary}>
                  <div>
                    <p>{summary}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">Downstream stations</p>
            <div className="list-stack">
              {impactSummary.downstreamStations.length ? (
                impactSummary.downstreamStations.map((station) => (
                  <article className="list-row" key={`${station.stationCode}-${station.scheduledTime}`}>
                    <div>
                      <strong>{station.stationCode}</strong>
                      <p>
                        Scheduled {station.scheduledTime} · projected {station.projectedTime}
                      </p>
                    </div>
                    <div className="list-meta">
                      <StatusBadge tone="warning" label={`${station.projectedDelayMinutes} min`} />
                      <span>{station.boardings + station.alightings} riders</span>
                    </div>
                  </article>
                ))
              ) : (
                <p>No downstream impacts projected for the selected run.</p>
              )}
            </div>
          </div>
          <div>
            <p className="eyebrow">Blocked runs in this schedule</p>
            <div className="list-stack">
              {scheduleApprovalSummary.blockedRuns.length ? (
                scheduleApprovalSummary.blockedRuns.map((run) => (
                  <article className="list-row" key={run.runId}>
                    <div>
                      <strong>{run.trainNumber}</strong>
                      <p>{run.blockers.join(" ")}</p>
                    </div>
                    <div className="list-meta">
                      <span>{run.delayMinutes} current min</span>
                      <span>{run.maxProjectedDelayMinutes} projected min</span>
                    </div>
                  </article>
                ))
              ) : (
                <p>No blocked runs in the selected schedule.</p>
              )}
            </div>
          </div>
        </div>
      </Panel>
      <Panel title="Schedule approval history" eyebrow={`${scheduleApprovalHistory.items.length} events`}>
        <div className="list-stack">
          {scheduleApprovalHistory.items.length ? (
            scheduleApprovalHistory.items.map((entry) => (
              <article className="list-row" key={entry.id}>
                <div>
                  <strong>{entry.runId}</strong>
                  <p>
                    {entry.actorName} · {entry.action}
                  </p>
                  <p>{entry.notes}</p>
                </div>
                <div className="list-meta">
                  <StatusBadge
                    label={entry.action}
                    tone={entry.action === "approved" ? "success" : "warning"}
                  />
                  <span>{entry.createdAt}</span>
                </div>
              </article>
            ))
          ) : (
            <p>No schedule approval events recorded yet.</p>
          )}
        </div>
      </Panel>
      <Panel title="Run event history" eyebrow={`${eventHistory.items.length} events`}>
        <div className="list-stack">
          {eventHistory.items.length ? (
            eventHistory.items.map((entry) => (
              <article className="list-row" key={entry.id}>
                <div>
                  <strong>{entry.actorName}</strong>
                  <p>{entry.action}</p>
                  <p>{entry.notes}</p>
                </div>
                <div className="list-meta">
                  <StatusBadge tone="neutral" label={entry.action} />
                  <span>{entry.createdAt}</span>
                </div>
              </article>
            ))
          ) : (
            <p>No operational events recorded for this run yet.</p>
          )}
        </div>
      </Panel>
      <Panel title="Reference data" eyebrow="Seeded values">
        <div className="three-column-grid">
          <div>
            <p className="eyebrow">Delay reasons</p>
            <ul className="simple-list">
              {referenceData.delayReasons.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Crew roles</p>
            <ul className="simple-list">
              {referenceData.crewRoles.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Stations</p>
            <ul className="simple-list">
              {referenceData.stationCodes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>
    </div>
  );
}
