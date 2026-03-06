import type { AppBootstrap } from "@tps/types";

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
