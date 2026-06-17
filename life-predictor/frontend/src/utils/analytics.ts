// First-party funnel tracking: no cookies, no third parties, never blocks UX.

export type EventType =
  | "home_view"
  | "quiz_start"
  | "quiz_submit"
  | "result_view"
  | "share_view"
  | "share_copy"
  | "poster_download"
  | "challenge_copy"
  | "challenge_done"
  | "lead_submit"
  | "recommendation_click";

export function track(type: EventType, predictionId?: string): void {
  try {
    const body = JSON.stringify({ type, predictionId });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/events",
        new Blob([body], { type: "application/json" })
      );
      return;
    }
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics must never break the product.
  }
}

/** Track a view-type event at most once per browser session. */
export function trackOncePerSession(type: EventType, predictionId?: string): void {
  try {
    const key = `ls_tracked_${type}_${predictionId || "page"}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // sessionStorage unavailable: still send the event.
  }
  track(type, predictionId);
}
