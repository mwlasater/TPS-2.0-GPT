import type {
  AppBootstrap,
  DelayEventList,
  ManagedUserList,
  PropertyCode,
  PropertySettings,
  ReferenceDataset,
  StationStopList,
  TrainRunList,
  TrainScheduleList
} from "@tps/types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";
const developmentToken = import.meta.env.VITE_DEV_BEARER_TOKEN ?? "local-dev-token";

export async function fetchBootstrap(): Promise<AppBootstrap> {
  const response = await fetch(`${apiBaseUrl}/auth/session`, {
    headers: {
      Authorization: `Bearer ${developmentToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`bootstrap.failed.${response.status}`);
  }

  return (await response.json()) as AppBootstrap;
}

async function fetchPropertyScoped<T>(path: string, propertyCode: PropertyCode): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${developmentToken}`,
      "X-Property": propertyCode
    }
  });

  if (!response.ok) {
    throw new Error(`request.failed.${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchPropertySettings(propertyCode: PropertyCode): Promise<PropertySettings> {
  return fetchPropertyScoped<PropertySettings>("/settings/property", propertyCode);
}

export function fetchManagedUsers(propertyCode: PropertyCode): Promise<ManagedUserList> {
  return fetchPropertyScoped<ManagedUserList>("/users", propertyCode);
}

export function fetchReferenceData(propertyCode: PropertyCode): Promise<ReferenceDataset> {
  return fetchPropertyScoped<ReferenceDataset>("/reference-data", propertyCode);
}

export function fetchTrainSchedules(propertyCode: PropertyCode): Promise<TrainScheduleList> {
  return fetchPropertyScoped<TrainScheduleList>("/train-schedules", propertyCode);
}

export function fetchTrainRuns(propertyCode: PropertyCode): Promise<TrainRunList> {
  return fetchPropertyScoped<TrainRunList>("/train-runs", propertyCode);
}

export function fetchStationStops(
  propertyCode: PropertyCode,
  runId: string
): Promise<StationStopList> {
  return fetchPropertyScoped<StationStopList>(`/train-runs/${runId}/stops`, propertyCode);
}

export function fetchDelayEvents(
  propertyCode: PropertyCode,
  runId: string
): Promise<DelayEventList> {
  return fetchPropertyScoped<DelayEventList>(`/train-runs/${runId}/delays`, propertyCode);
}
