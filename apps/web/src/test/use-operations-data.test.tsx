import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useOperationsData } from "../hooks/use-operations-data.js";

describe("useOperationsData", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to seeded data when API requests fail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      })
    );

    const { result } = renderHook(() => useOperationsData("caltrain"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.source).toBe("fallback");
    expect(result.current.runs.items[0]?.id).toBe("caltrain-run-1");
    expect(result.current.fareDashboard.totalRecords).toBeGreaterThan(0);
  });
});
