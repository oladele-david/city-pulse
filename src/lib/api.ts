import {
  AuthResponse,
  IssueRecord,
  IssueSeverity,
  IssueStatus,
  LoginPayload,
  ResolvedLocation,
  ApiEnvelope,
  ApiErrorResponse,
} from "@/types/api";
import {
  getStoredCitizenSession,
  setStoredCitizenSession,
} from "@/lib/auth-storage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001/api/v1";

const DEMO_CITIZEN_EMAIL =
  import.meta.env.VITE_DEMO_CITIZEN_EMAIL ?? "citizen@citypulse.ng";
const DEMO_CITIZEN_PASSWORD =
  import.meta.env.VITE_DEMO_CITIZEN_PASSWORD ?? "CitizenPass123!";

export class ApiError extends Error {
  code: string;
  details: ApiErrorResponse["error"]["details"];
  status: number;

  constructor(
    message: string,
    options: {
      code: string;
      details?: ApiErrorResponse["error"]["details"];
      status: number;
    },
  ) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.details = options.details ?? [];
    this.status = options.status;
  }
}

type RequestOptions = RequestInit & {
  token?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, body, ...restOptions } = options;
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    body,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse | null;
    throw new ApiError(errorPayload?.error.message ?? "Request failed", {
      code: errorPayload?.error.code ?? "request_failed",
      details: errorPayload?.error.details,
      status: response.status,
    });
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

export const api = {
  loginAdmin(payload: LoginPayload) {
    return request<AuthResponse>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getAdminProfile(token: string) {
    return request<AuthResponse["user"]>("/auth/me", {
      token,
    });
  },

  listIssues(filters?: {
    status?: string;
    severity?: string;
    lgaId?: string;
    communityId?: string;
  }) {
    const searchParams = new URLSearchParams();

    if (filters?.status && filters.status !== "all") {
      searchParams.set("status", filters.status);
    }
    if (filters?.severity && filters.severity !== "all") {
      searchParams.set("severity", filters.severity);
    }
    if (filters?.lgaId) {
      searchParams.set("lgaId", filters.lgaId);
    }
    if (filters?.communityId) {
      searchParams.set("communityId", filters.communityId);
    }

    const queryString = searchParams.toString();
    return request<IssueRecord[]>(`/issues${queryString ? `?${queryString}` : ""}`);
  },

  updateIssueStatus(issueId: string, status: IssueStatus, token: string) {
    return request<IssueRecord>(`/issues/${issueId}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
  },

  resolveLocation(payload: {
    latitude: number;
    longitude: number;
    street?: string;
  }) {
    return request<ResolvedLocation>("/locations/resolve", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async createIssue(
    payload: {
      type: string;
      title: string;
      description: string;
      severity: IssueSeverity;
      lgaId: string;
      communityId: string;
      streetOrLandmark: string;
      latitude: number;
      longitude: number;
      imageFile?: File | null;
    },
    token: string,
  ) {
    const formData = new FormData();

    formData.append("type", payload.type);
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("severity", payload.severity);
    formData.append("lgaId", payload.lgaId);
    formData.append("communityId", payload.communityId);
    formData.append("streetOrLandmark", payload.streetOrLandmark);
    formData.append("latitude", String(payload.latitude));
    formData.append("longitude", String(payload.longitude));

    if (payload.imageFile) {
      formData.append("images", payload.imageFile);
    }

    return request<IssueRecord>("/issues", {
      method: "POST",
      token,
      body: formData,
    });
  },

  async ensureCitizenSession() {
    const storedSession = getStoredCitizenSession();
    if (storedSession?.accessToken) {
      return storedSession;
    }

    const session = await request<AuthResponse>("/auth/citizen/login", {
      method: "POST",
      body: JSON.stringify({
        email: DEMO_CITIZEN_EMAIL,
        password: DEMO_CITIZEN_PASSWORD,
      }),
    });

    setStoredCitizenSession(session);
    return session;
  },
};
