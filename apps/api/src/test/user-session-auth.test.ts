import { describe, expect, it, vi } from "vitest";

import { loadPersistedUserAuthorization } from "../lib/user-session-auth.js";

describe("loadPersistedUserAuthorization", () => {
  it("aggregates property access and deduplicated permission arrays", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ railroad_code: "caltrain" }, { railroad_code: "capmetro" }]
      })
      .mockResolvedValueOnce({
        rows: [
          {
            railroad_code: "caltrain",
            permissions: ["users.manage", "users.invite"]
          },
          {
            railroad_code: "caltrain",
            permissions: ["users.access.write", "users.manage"]
          }
        ]
      });

    const authorization = await loadPersistedUserAuthorization({ query }, "local-dev-user");

    expect(authorization).toEqual({
      allowedProperties: ["caltrain", "capmetro"],
      propertyPermissions: {
        caltrain: ["users.access.write", "users.invite", "users.manage"]
      }
    });
  });
});
