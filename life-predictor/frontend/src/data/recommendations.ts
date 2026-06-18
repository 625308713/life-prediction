import type { Language } from "../types";

/**
 * Native sponsored recommendations shown at the bottom of the result page.
 *
 * Product stance: these are relevant, clearly-labeled "赞助/Sponsored" cards
 * (checkups, wearables, movement/sleep/nutrition services) — never programmatic
 * banner ads, which would damage the trust the product depends on.
 *
 * To go live: replace each `href` with a real affiliate/sponsor URL. Empty the
 * array (or leave all hrefs blank) to hide the slot entirely.
 */

export type RecommendationCategory =
  | "checkup"
  | "wearable"
  | "movement"
  | "sleep"
  | "nutrition";

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  // Result archetypes this recommendation is relevant to (keys from
  // ResultReport's ArchetypeKey). Empty = general (any archetype).
  archetypes: string[];
  href: string;
  zh: { label: string; body: string; cta: string };
  en: { label: string; body: string; cta: string };
}

export const recommendationCategoryIcon: Record<RecommendationCategory, string> = {
  checkup: "🩺",
  wearable: "⌚",
  movement: "🏃",
  sleep: "🌙",
  nutrition: "🥗",
};

// Ready-to-use templates. `href` is intentionally BLANK for launch: items with
// an empty href are hidden, so the whole slot stays invisible until real
// sponsor/affiliate URLs are filled in (e.g. JD Union links once the site has a
// live domain). To go live with a recommendation, paste its URL into `href`.
export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "checkup-basic",
    category: "checkup",
    archetypes: ["metabolic_tune", "prevention_catchup", "substance_reset"],
    href: "",
    zh: {
      label: "基础体检套餐",
      body: "把血压、血糖、血脂等关键指标做一次系统检查，让结果更有据可依。",
      cta: "查看体检方案",
    },
    en: {
      label: "Basic health checkup",
      body: "Get blood pressure, glucose, and lipids checked so your numbers are grounded in real data.",
      cta: "See checkup plans",
    },
  },
  {
    id: "wearable-tracker",
    category: "wearable",
    archetypes: ["movement_unlock", "recovery_first", "steady_builder"],
    href: "",
    zh: {
      label: "智能手环 / 手表",
      body: "持续记录活动量、心率和睡眠，让 7 天挑战和复测更容易坚持。",
      cta: "了解可穿戴设备",
    },
    en: {
      label: "Fitness tracker / smartwatch",
      body: "Track activity, heart rate, and sleep so the 7-day challenge and retests are easier to keep.",
      cta: "Explore wearables",
    },
  },
  {
    id: "sleep-service",
    category: "sleep",
    archetypes: ["recovery_first"],
    href: "",
    zh: {
      label: "睡眠改善方案",
      body: "如果恢复感是你的优先杠杆，结构化的睡眠改善课程会比单靠自律更有效。",
      cta: "查看睡眠方案",
    },
    en: {
      label: "Sleep improvement program",
      body: "If recovery is your key lever, a structured sleep program beats willpower alone.",
      cta: "See sleep programs",
    },
  },
  {
    id: "nutrition-service",
    category: "nutrition",
    archetypes: ["metabolic_tune"],
    href: "",
    zh: {
      label: "营养 / 膳食指导",
      body: "针对体重、腰围和血糖方向，循序渐进地调整饮食结构。",
      cta: "了解营养指导",
    },
    en: {
      label: "Nutrition guidance",
      body: "Adjust your food structure gradually for weight, waist, and glucose direction.",
      cta: "Explore nutrition help",
    },
  },
];

/** Pick up to `max` recommendations relevant to the user's archetype. */
export function pickRecommendations(
  archetypeKey: string,
  max = 2
): Recommendation[] {
  const live = RECOMMENDATIONS.filter((r) => r.href.trim() !== "");
  const relevant = live.filter(
    (r) => r.archetypes.length === 0 || r.archetypes.includes(archetypeKey)
  );
  const fallback = live.filter((r) => r.category === "checkup");
  const ordered = [...relevant, ...fallback];
  const seen = new Set<string>();
  const result: Recommendation[] = [];
  for (const r of ordered) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    result.push(r);
    if (result.length >= max) break;
  }
  return result;
}

export function recommendationText(rec: Recommendation, language: Language) {
  return language === "zh" ? rec.zh : rec.en;
}
