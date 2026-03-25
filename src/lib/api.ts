import {
  ActivityEntry,
  AuthResponse,
  IssueRecord,
  IssueReactionRecord,
  IssueReactionUpdate,
  IssueSeverity,
  IssueStatus,
  LeaderboardEntry,
  LoginPayload,
  Lga,
  Community,
  ReactionType,
  RegisterCitizenPayload,
  ResolvedLocation,
  ApiEnvelope,
  ApiErrorResponse,
} from "@/types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001/api/v1";

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

  loginCitizen(payload: LoginPayload) {
    return request<AuthResponse>("/auth/citizen/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  registerCitizen(payload: RegisterCitizenPayload) {
    return request<AuthResponse>("/auth/citizen/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getProfile(token: string) {
    return request<AuthResponse["user"]>("/auth/me", {
      token,
    });
  },

  listLgas() {
    return request<Lga[]>("/locations/lgas");
  },

  listCommunitiesByLga(lgaId: string) {
    return request<Community[]>(`/locations/lgas/${lgaId}/communities`);
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
      imageFiles?: File[];
      videoFile?: File | null;
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

    payload.imageFiles?.forEach((file) => {
      formData.append("images", file);
    });

    if (payload.videoFile) {
      formData.append("video", payload.videoFile);
    }

    return request<IssueRecord>("/issues", {
      method: "POST",
      token,
      body: formData,
    });
  },

  listLeaderboard(scope?: { lgaId?: string; communityId?: string }) {
    if (scope?.communityId) {
      return request<LeaderboardEntry[]>(
        `/leaderboard/communities/${scope.communityId}`,
      );
    }

    if (scope?.lgaId) {
      return request<LeaderboardEntry[]>(`/leaderboard/lgas/${scope.lgaId}`);
    }

    return request<LeaderboardEntry[]>("/leaderboard");
  },

  getMyActivity(token: string) {
    return request<ActivityEntry[]>("/activity/me", {
      token,
    });
  },

  getIssueReaction(issueId: string, token: string) {
    return request<IssueReactionRecord>(`/issues/${issueId}/reaction`, {
      token,
    });
  },

  updateIssueReaction(issueId: string, reaction: ReactionType, token: string) {
    return request<IssueReactionUpdate>(`/issues/${issueId}/reaction`, {
      method: "PUT",
      token,
      body: JSON.stringify({ reaction }),
    });
  },
};
