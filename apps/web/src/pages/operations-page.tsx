import type {
  ConsistEquipmentList,
  CrewAssignmentList,
  DelayEventList,
  PropertySummary,
  ReferenceDataset,
  StationStopList,
  TrainRunList,
  TrainSchedule,
  TrainScheduleList
} from "@tps/types";

import { Panel } from "../components/panel.js";
import { StatusBadge } from "../components/status-badge.js";

interface OperationsPageProps {
  property: PropertySummary;
  consist: ConsistEquipmentList;
  crew: CrewAssignmentList;
  delayEvents: DelayEventList;
  referenceData: ReferenceDataset;
  runs: TrainRunList;
  schedules: TrainScheduleList;
  stationStops: StationStopList;
  source: "api" | "fallback";
}

export function OperationsPage({
  consist,
  crew,
  delayEvents,
  property,
  referenceData,
  runs,
  schedules,
  stationStops,
  source
}: OperationsPageProps) {
  const selectedSchedule: TrainSchedule | undefined = schedules.items[0];
  const scheduleRuns = runs.items.filter((run) => run.scheduleId === selectedSchedule?.id);

  return (
    <div className="page-stack">
      <Panel title="Operations staging" eyebrow={property.name}>
        <p>
          This route is the handoff point for train schedules, train runs,
          delays, consist, and crew modules from the SRD migration order.
        </p>
        <StatusBadge tone={source === "api" ? "success" : "neutral"} label={source} />
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
        </Panel>
      </div>
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
