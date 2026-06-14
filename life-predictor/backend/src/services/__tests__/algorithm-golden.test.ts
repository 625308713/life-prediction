import { describe, expect, it } from "vitest";
import { calculateLifeExpectancy } from "../algorithm";
import { goldenProfiles } from "./golden-profiles";
import expectedOutputs from "./algorithm-golden.expected.json";

/**
 * Golden regression tests: lock the algorithm's observable behavior across
 * refactors. If a change here is intentional (weights tuned, factors added),
 * re-capture with `npx tsx scripts/capture-golden.ts` and review the diff.
 */

function normalize(value: unknown): unknown {
  if (typeof value === "number") return Math.round(value * 1e8) / 1e8;
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        normalize(v),
      ])
    );
  }
  return value;
}

describe("algorithm golden regression", () => {
  for (const [name, profile] of Object.entries(goldenProfiles)) {
    it(`matches captured output for ${name}`, () => {
      const actual = calculateLifeExpectancy(profile as never);
      const expected = (expectedOutputs as Record<string, unknown>)[name];
      expect(normalize(actual)).toEqual(normalize(expected));
    });
  }
});
