import { calculateLifeExpectancy } from "../src/services/algorithm";
import { goldenProfiles } from "../src/services/__tests__/golden-profiles";
import expected from "../src/services/__tests__/algorithm-golden.expected.json";

const exp = expected as Record<string, Record<string, unknown>>;
const diffs: string[] = [];
for (const [name, profile] of Object.entries(goldenProfiles)) {
  const actual = calculateLifeExpectancy(profile as never) as Record<string, unknown>;
  const old = exp[name] || {};
  for (const f of Object.keys(actual)) {
    if (JSON.stringify(old[f]) !== JSON.stringify(actual[f])) {
      diffs.push(`${name}.${f}: ${JSON.stringify(old[f])} -> ${JSON.stringify(actual[f])}`);
    }
  }
}
console.log(diffs.length ? diffs.join("\n") : "NO DIFF");
