import { formatDistanceToNowStrict } from "date-fns";
import { IssueRecord } from "@/types/api";

export interface MapIssueUpdate {
  status: string;
  timestamp: string;
  description: string;
}

export interface MapIssue {
  id: string;
  type: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: IssueRecord["severity"];
  status: IssueRecord["status"];
  confidence: number;
  reportsCount: number;
  confirmationsCount: number;
  disagreementsCount: number;
  fixedSignalsCount: number;
  locationName: string;
  photoUrls: string[];
  videoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  updates: MapIssueUpdate[];
}

function formatRelativeTime(value: string) {
  return `${formatDistanceToNowStrict(new Date(value), { addSuffix: true })}`;
}

function formatStatusLabel(status: IssueRecord["status"]) {
  return status === "in_progress"
    ? "In Progress"
    : status === "resolved"
      ? "Resolved"
      : "Open";
}

export function toMapIssue(issue: IssueRecord): MapIssue {
  const reportsCount =
    issue.confirmationsCount +
    issue.disagreementsCount +
    issue.fixedSignalsCount +
    1;

  return {
    id: issue.id,
    type: issue.type,
    title: issue.title,
    description: issue.description,
    latitude: issue.latitude,
    longitude: issue.longitude,
    severity: issue.severity,
    status: issue.status,
    confidence: issue.confidenceScore / 100,
    reportsCount,
    confirmationsCount: issue.confirmationsCount,
    disagreementsCount: issue.disagreementsCount,
    fixedSignalsCount: issue.fixedSignalsCount,
    locationName: issue.streetOrLandmark,
    photoUrls: issue.photoUrls,
    videoUrl: issue.videoUrl,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    updates: [
      {
        status: formatStatusLabel(issue.status),
        timestamp: formatRelativeTime(issue.updatedAt),
        description: issue.needsResolutionReview
          ? "Community signals suggest this report may need another verification pass."
          : issue.status === "resolved"
            ? "This issue has been marked resolved by the CityPulse operations team."
            : issue.status === "in_progress"
              ? "This issue is currently under review or active response."
              : "This issue is awaiting official review from the CityPulse operations team.",
      },
      {
        status: "Issue Reported",
        timestamp: formatRelativeTime(issue.createdAt),
        description: "A citizen submitted this Lagos issue through CityPulse.",
      },
    ],
  };
}

export function toIssueGeoJson(issues: MapIssue[]) {
  return {
    type: "FeatureCollection" as const,
    features: issues.map((issue) => ({
      type: "Feature" as const,
      properties: {
        id: issue.id,
        severity: issue.severity,
        confidence: issue.confidence,
        type: issue.type,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [issue.longitude, issue.latitude],
      },
    })),
  };
}
