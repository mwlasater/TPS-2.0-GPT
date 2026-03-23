import type {
  DelayAdditionalInfo,
  DelayEventList,
  StationStopList,
  TrainRun,
  TrainRunImpactSummary,
  TrainRunList,
  TrainScheduleApprovalSummary
} from "@tps/types";

function parseClockToMinutes(value: string): number {
  const [hoursRaw = "0", minutesRaw = "0"] = value.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  return hours * 60 + minutes;
}

function formatMinutesAsClock(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function deriveTrainRunImpactSummary(
  run: Pick<TrainRun, "id" | "delayMinutes">,
  stationStops: StationStopList,
  delayEvents: DelayEventList,
  delayAdditionalInfo: Record<string, DelayAdditionalInfo>
): TrainRunImpactSummary {
  const totalDelayMinutes =
    delayEvents.items.reduce((total, delay) => total + delay.minutes, 0) || run.delayMinutes;

  const downstreamStations = stationStops.items.map((stop, index) => {
    const scheduledMinutes = parseClockToMinutes(stop.scheduledTime);
    const actualDelayMinutes = stop.actualTime
      ? Math.max(parseClockToMinutes(stop.actualTime) - scheduledMinutes, 0)
      : 0;
    const projectedDelayMinutes = Math.max(totalDelayMinutes - index, actualDelayMinutes, 0);

    return {
      stationCode: stop.stationCode,
      scheduledTime: stop.scheduledTime,
      projectedTime: formatMinutesAsClock(scheduledMinutes + projectedDelayMinutes),
      projectedDelayMinutes,
      boardings: stop.boardings,
      alightings: stop.alightings,
      passengerLoadDelta: stop.boardings - stop.alightings
    };
  });

  const impactedStations = downstreamStations.filter((station) => station.projectedDelayMinutes > 0);
  const maxProjectedDelayMinutes = impactedStations.reduce(
    (max, station) => Math.max(max, station.projectedDelayMinutes),
    0
  );
  const affectedPassengers = impactedStations.reduce(
    (total, station) => total + station.boardings + station.alightings,
    0
  );
  const estimatedRecoveryTime =
    downstreamStations.find((station) => station.projectedDelayMinutes === 0)?.scheduledTime ??
    impactedStations.at(-1)?.projectedTime ??
    null;
  const passengerImpactSummaries = Array.from(
    new Set(
      Object.values(delayAdditionalInfo)
        .map((item) => item.passengerImpactSummary.trim())
        .filter((summary) => summary.length > 0)
    )
  );

  if (!passengerImpactSummaries.length) {
    passengerImpactSummaries.push(
      affectedPassengers > 0
        ? `${affectedPassengers} passenger movements are exposed across ${impactedStations.length} downstream stop(s).`
        : "No downstream passenger impacts are currently projected."
    );
  }

  return {
    runId: run.id,
    totalDelayMinutes,
    impactedStationCount: impactedStations.length,
    maxProjectedDelayMinutes,
    affectedPassengers,
    estimatedRecoveryTime,
    passengerImpactSummaries,
    downstreamStations
  };
}

export function deriveTrainScheduleApprovalSummary(
  scheduleId: string,
  runs: TrainRunList,
  impactsByRunId: Record<string, TrainRunImpactSummary>
): TrainScheduleApprovalSummary {
  const scheduleRuns = runs.items.filter((run) => run.scheduleId === scheduleId);
  const approvedRunIds = scheduleRuns.filter((run) => run.isApproved).map((run) => run.id);
  const readyRunIds = scheduleRuns
    .filter((run) => !run.isApproved && run.approvalBlockers.length === 0)
    .map((run) => run.id);
  const blockedRuns = scheduleRuns
    .filter((run) => !run.isApproved && run.approvalBlockers.length > 0)
    .map((run) => ({
      runId: run.id,
      trainNumber: run.trainNumber,
      delayMinutes: run.delayMinutes,
      maxProjectedDelayMinutes: impactsByRunId[run.id]?.maxProjectedDelayMinutes ?? run.delayMinutes,
      blockers: run.approvalBlockers
    }));

  return {
    scheduleId,
    totalRuns: scheduleRuns.length,
    approvedCount: approvedRunIds.length,
    readyCount: readyRunIds.length,
    blockedCount: blockedRuns.length,
    totalDelayMinutes: scheduleRuns.reduce((total, run) => total + run.delayMinutes, 0),
    readyRunIds,
    approvedRunIds,
    blockedRuns
  };
}
