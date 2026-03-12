import type {
  ConsistEquipmentList,
  CrewAssignmentList,
  DelayEventList,
  DelayEventUpdate,
  FareEnforcementList,
  FareEnforcementUpdate,
  PropertySummary,
  ReferenceDataset,
  StationStopList,
  TrainRun,
  TrainRunApprovalUpdate,
  TrainRunList,
  TrainSchedule,
  TrainScheduleList
} from "@tps/types";
import { useState } from "react";

import { Panel } from "../components/panel.js";
import { StatusBadge } from "../components/status-badge.js";

interface OperationsPageProps {
  property: PropertySummary;
  consist: ConsistEquipmentList;
  crew: CrewAssignmentList;
  delayEvents: DelayEventList;
  fareEnforcement: FareEnforcementList;
  isSaving: boolean;
  referenceData: ReferenceDataset;
  runs: TrainRunList;
  saveDelay: (
    runId: string,
    delayId: string,
    update: DelayEventUpdate
  ) => Promise<DelayEventList["items"][number] | undefined>;
  saveFare: (
    recordId: string,
    update: FareEnforcementUpdate
  ) => Promise<FareEnforcementList["items"][number] | undefined>;
  saveRunApproval: (
    runId: string,
    update: TrainRunApprovalUpdate
  ) => Promise<TrainRun | undefined>;
  schedules: TrainScheduleList;
  stationStops: StationStopList;
  source: "api" | "fallback";
}

export function OperationsPage({
  consist,
  crew,
  delayEvents,
  fareEnforcement,
  isSaving,
  property,
  referenceData,
  runs,
  saveDelay,
  saveFare,
  saveRunApproval,
  schedules,
  stationStops,
  source
}: OperationsPageProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const selectedSchedule: TrainSchedule | undefined = schedules.items[0];
  const scheduleRuns = runs.items.filter((run) => run.scheduleId === selectedSchedule?.id);
  const selectedRun = scheduleRuns[0];

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
          This route now carries schedules, run detail, fare enforcement, and the first approved-run
          lock workflow from the SRD instead of staying read-only.
        </p>
        <div className="badge-row">
          <StatusBadge tone={source === "api" ? "success" : "neutral"} label={source} />
          {selectedRun?.isApproved ? (
            <StatusBadge tone="warning" label="run locked" />
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
                <article className="list-row" key={schedule.id}>
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
          eyebrow="Master/detail pattern"
        >
          {selectedSchedule ? (
            <div className="detail-stack">
              <p>{selectedSchedule.routeName}</p>
              <div className="badge-row">
                {selectedSchedule.serviceDays.map((day) => (
                  <StatusBadge key={day} tone="neutral" label={day} />
                ))}
              </div>
              <div className="list-stack">
                {scheduleRuns.map((run) => (
                  <article className="list-row" key={run.id}>
                    <div>
                      <strong>{run.operatingDate}</strong>
                      <p>{run.trainNumber}</p>
                      <p>{run.isApproved ? `Approved ${run.approvedAt ?? ""}` : "Editable until approved"}</p>
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
                  </article>
                ))}
              </div>
              {selectedRun ? (
                <div className="action-row">
                  <button
                    className="action-button"
                    disabled={selectedRun.isApproved || isSaving}
                    onClick={() => {
                      void runAction(
                        () => saveRunApproval(selectedRun.id, { isApproved: true }),
                        "Run approved and lock applied."
                      );
                    }}
                    type="button"
                  >
                    Approve selected run
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <p>Selecting schedules will drive detail panes here as train modules expand.</p>
          )}
        </Panel>
      </div>
      <div className="two-column-grid">
        <Panel title="Consist and equipment" eyebrow={`${consist.items.length} units`}>
          <div className="list-stack">
            {consist.items.map((equipment) => (
              <article className="list-row" key={equipment.id}>
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
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="Crew assignment" eyebrow={`${crew.items.length} assigned`}>
          <div className="list-stack">
            {crew.items.map((assignment) => (
              <article className="list-row" key={assignment.id}>
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
              </article>
            ))}
          </div>
        </Panel>
      </div>
      <div className="two-column-grid">
        <Panel title="Station stops" eyebrow={`${stationStops.items.length} stops`}>
          <div className="list-stack">
            {stationStops.items.map((stop) => (
              <article className="list-row" key={stop.id}>
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
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="Delay log" eyebrow={`${delayEvents.items.length} events`}>
          <div className="list-stack">
            {delayEvents.items.map((delay) => (
              <article className="list-row" key={delay.id}>
                <div>
                  <strong>{delay.category}</strong>
                  <p>{delay.notes}</p>
                </div>
                <div className="list-meta">
                  <StatusBadge tone="warning" label={`${delay.minutes} min`} />
                  <span>{delay.reportedAt}</span>
                </div>
              </article>
            ))}
          </div>
          {selectedRun && delayEvents.items[0] ? (
            <div className="action-row">
              <button
                className="action-button"
                disabled={selectedRun.isApproved || isSaving}
                onClick={() => {
                  const firstDelay = delayEvents.items[0];

                  if (!firstDelay) {
                    return;
                  }

                  void runAction(
                    () =>
                      saveDelay(selectedRun.id, firstDelay.id, {
                        category: firstDelay.category,
                        minutes: firstDelay.minutes + 1,
                        notes: `${firstDelay.notes} Updated from operations console.`,
                        reportedAt: firstDelay.reportedAt
                      }),
                    "Delay event updated."
                  );
                }}
                type="button"
              >
                Increment first delay event
              </button>
            </div>
          ) : null}
        </Panel>
      </div>
      <Panel title="Fare enforcement" eyebrow={`${fareEnforcement.items.length} records`}>
        <div className="list-stack">
          {fareEnforcement.items.length ? (
            fareEnforcement.items.map((record) => (
              <article className="list-row" key={record.id}>
                <div>
                  <strong>{record.inspectorName}</strong>
                  <p>
                    {record.firstLocation} to {record.secondLocation}
                  </p>
                  <p>{record.notes}</p>
                </div>
                <div className="list-meta">
                  <StatusBadge tone="neutral" label={`${record.activityCount} checks`} />
                  <span>{record.capturedAt}</span>
                </div>
              </article>
            ))
          ) : (
            <p>No fare enforcement records seeded for this run yet.</p>
          )}
        </div>
        {fareEnforcement.items[0] ? (
          <div className="action-row">
            <button
              className="action-button"
              disabled={isSaving}
              onClick={() => {
                const firstRecord = fareEnforcement.items[0];

                if (!firstRecord) {
                  return;
                }

                void runAction(
                  () =>
                    saveFare(firstRecord.id, {
                      inspectorName: firstRecord.inspectorName,
                      firstLocation: firstRecord.firstLocation,
                      secondLocation: stationStops.items.at(-1)?.stationCode ?? firstRecord.secondLocation,
                      activityCount: firstRecord.activityCount + 2,
                      notes: `${firstRecord.notes} Follow-up inspection logged.`,
                      capturedAt: firstRecord.capturedAt
                    }),
                  "Fare enforcement record updated."
                );
              }}
              type="button"
            >
              Update first fare record
            </button>
          </div>
        ) : null}
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
