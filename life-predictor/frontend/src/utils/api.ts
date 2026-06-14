// Typed API client: the single place the frontend talks to the backend.
// All calls return parsed JSON or throw ApiError with the server's message.

import type {
  AdminPredictionList,
  AdminStats,
  PredictionDetail,
  PredictionResult,
  PredictionShare,
  QuestionnaireData,
} from "../types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body && typeof body.error === "string") message = body.error;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}

function jsonInit(method: string, body: unknown, token?: string): RequestInit {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  };
}

// ---- Public API ----

export function submitPrediction(
  data: QuestionnaireData & { language: string }
): Promise<PredictionResult> {
  return request("/api/predictions", jsonInit("POST", data));
}

export function getPrediction(id: string): Promise<PredictionDetail> {
  return request(`/api/predictions/${encodeURIComponent(id)}`);
}

export function getShareSummary(id: string): Promise<PredictionShare> {
  return request(`/api/predictions/${encodeURIComponent(id)}/share`);
}

export function submitLead(payload: {
  email: string;
  predictionId?: string;
  language?: string;
  source?: string;
}): Promise<{ ok: boolean }> {
  return request("/api/leads", jsonInit("POST", payload));
}

export function getPublicStats(): Promise<{ totalCount: number }> {
  return request("/api/stats/public");
}

// ---- Admin API ----

export function adminLogin(
  password: string
): Promise<{ token: string; expiresAt: string }> {
  return request("/api/admin/login", jsonInit("POST", { password }));
}

export function adminLogout(token: string): Promise<{ success: boolean }> {
  return request("/api/admin/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function adminStats(token: string): Promise<AdminStats> {
  return request("/api/admin/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function adminPredictions(
  token: string,
  params: URLSearchParams
): Promise<AdminPredictionList> {
  return request(`/api/admin/predictions?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function adminPredictionDetail(
  token: string,
  id: string
): Promise<Record<string, unknown>> {
  return request(`/api/admin/predictions/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Download an authenticated CSV endpoint and trigger a browser download. */
export async function downloadCsv(
  path: string,
  token: string,
  filename: string
): Promise<void> {
  const res = await fetch(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
