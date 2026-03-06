import { describe, expect, it } from "vitest";

import { loadSeeds } from "../db/seed-service.js";

describe("seed service", () => {
  it("loads sql seeds in sorted order", async () => {
    const seeds = await loadSeeds();

    expect(seeds.length).toBeGreaterThan(0);
    expect(seeds.map((seed) => seed.id)).toEqual(["0001_bootstrap"]);
  });
});
