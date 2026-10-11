import {
  PlanRecord,
  Weights,
  TrackEvent,
} from "../contract/types";

export interface LoginResult {
  token: string;
  officer_id: string;
  role: "dispatcher" | "admin";
  expires_at: string;
}

export interface ScenarioSummary {
  scenario_id: string;
  service_area_id: string;
  window_index: number;
  n_areas: number;
  supply_litres: number;
  tankers_available: number;
  alert_level: number;
}

export interface DecisionResponse {
  plan: PlanRecord;
  next_plan: PlanRecord | null;
  ledger_updated: boolean;
}

export class APIClientError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(message: string, code: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = "APIClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type UnauthorizedHandler = () => void;

class BClient {
  private onUnauthorized: UnauthorizedHandler | null = null;

  setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
    this.onUnauthorized = handler;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string | null
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      if (this.onUnauthorized) {
        this.onUnauthorized();
      }
      throw new APIClientError("Session expired or unauthorized", "UNAUTHORIZED", 401);
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const errObj = (data as { error?: { code?: string; message?: string; details?: Record<string, unknown> } })?.error;
      const code = errObj?.code || "HTTP_ERROR";
      const message = errObj?.message || `HTTP ${res.status}`;
      const details = errObj?.details;
      throw new APIClientError(message, code, res.status, details);
    }

    return data as T;
  }

  async login(username: string, password: string): Promise<LoginResult> {
    return this.request<LoginResult>("/b/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  async getMe(token: string): Promise<{ officer_id: string; role: "dispatcher" | "admin"; expires_at: string }> {
    return this.request<{ officer_id: string; role: "dispatcher" | "admin"; expires_at: string }>(
      "/b/v1/auth/me",
      { method: "GET" },
      token
    );
  }

  async listScenarios(token: string): Promise<{ scenarios: ScenarioSummary[] }> {
    return this.request<{ scenarios: ScenarioSummary[] }>(
      "/b/v1/scenarios",
      { method: "GET" },
      token
    );
  }

  async getLatestPlan(token: string, scenarioId: string): Promise<PlanRecord | null> {
    const res = await this.request<{ plans: PlanRecord[] }>(
      `/b/v1/plans?scenario_id=${encodeURIComponent(scenarioId)}&latest=true`,
      { method: "GET" },
      token
    );
    return res.plans && res.plans.length > 0 ? res.plans[0] : null;
  }

  async generatePlan(
    token: string,
    scenarioId: string,
    weights?: Weights | null
  ): Promise<PlanRecord> {
    const body: Record<string, unknown> = { scenario_id: scenarioId };
    if (weights) {
      body.weights = weights;
    }
    return this.request<PlanRecord>(
      "/b/v1/plans",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token
    );
  }

  async recordDecision(
    token: string,
    planId: string,
    decision: "approved" | "edited" | "rejected",
    note?: string | null,
    revisedWeights?: Weights | null
  ): Promise<DecisionResponse> {
    const body: Record<string, unknown> = { decision };
    if (note !== undefined) {
      body.note = note;
    }
    if (revisedWeights !== undefined) {
      body.revised_weights = revisedWeights;
    }
    return this.request<DecisionResponse>(
      `/b/v1/plans/${encodeURIComponent(planId)}/decision`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token
    );
  }

  async trackEvent(token: string, event: TrackEvent): Promise<{ event_id: string }> {
    return this.request<{ event_id: string }>(
      "/b/v1/events",
      {
        method: "POST",
        body: JSON.stringify({
          name: event.name,
          scenario_id: event.scenario_id,
          props: event.props,
        }),
      },
      token
    );
  }
}

export const bClient = new BClient();
