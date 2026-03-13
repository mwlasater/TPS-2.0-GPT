import type { ErrorEnvelope } from "@tps/types";

export function createErrorResponse(
  statusCode: number,
  error: string,
  details?: unknown
): ErrorEnvelope {
  return {
    error,
    statusCode,
    details
  };
}

