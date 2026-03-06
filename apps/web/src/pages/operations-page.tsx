import type {
  PropertySummary,
  ReferenceDataset,
  TrainRunList,
  TrainSchedule,
  TrainScheduleList
} from "@tps/types";

import { Panel } from "../components/panel.js";
import { StatusBadge } from "../components/status-badge.js";

interface OperationsPageProps {
  property: PropertySummary;
  referenceData: ReferenceDataset;
  runs: TrainRunList;
  schedules: TrainScheduleList;
  source: "api" | "fallback";
}

export function OperationsPage({
  property,
  referenceData,
  runs,
  schedules,
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
