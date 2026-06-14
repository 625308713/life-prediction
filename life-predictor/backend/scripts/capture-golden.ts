/**
 * One-off helper: print calculateLifeExpectancy outputs for the golden-test
 * fixtures so they can be embedded as expected values before refactoring.
 */
import { calculateLifeExpectancy } from "../src/services/algorithm";
import { goldenProfiles } from "../src/services/__tests__/golden-profiles";

const results: Record<string, unknown> = {};
for (const [name, profile] of Object.entries(goldenProfiles)) {
  results[name] = calculateLifeExpectancy(profile as never);
}
console.log(JSON.stringify(results, null, 2));
