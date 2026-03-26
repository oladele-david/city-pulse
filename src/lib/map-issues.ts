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
  displayLatitude: number;
  displayLongitude: number;
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
  createdAtLabel: string;
  createdAtRelative: string;
  updatedAt: string;
  updatedAtLabel: string;
  updates: MapIssueUpdate[];
}

function formatRelativeTime(value: string) {
  return `${formatDistanceToNowStrict(new Date(value), { addSuffix: true })}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatusLabel(status: IssueRecord["status"]) {
  return status === "in_progress"
    ? "In Progress"
    : status === "resolved"
      ? "Resolved"
      : "Open";
}

function toCoordinateValue(value: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toMapIssue(issue: IssueRecord): MapIssue {
  const reportsCount =
    issue.confirmationsCount +
    issue.disagreementsCount +
    issue.fixedSignalsCount +
    1;
  const latitude = toCoordinateValue(issue.latitude);
  const longitude = toCoordinateValue(issue.longitude);

  return {
    id: issue.id,
    type: issue.type,
    title: issue.title,
    description: issue.description,
    latitude,
    longitude,
    displayLatitude: latitude,
    displayLongitude: longitude,
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
    createdAtLabel: formatDateTime(issue.createdAt),
    createdAtRelative: formatRelativeTime(issue.createdAt),
    updatedAt: issue.updatedAt,
    updatedAtLabel: formatDateTime(issue.updatedAt),
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

const DUPLICATE_COORDINATE_KEY_PRECISION = 6;
const DISPLAY_OFFSET_RADIUS_METERS = 24;
const METERS_PER_DEGREE_LATITUDE = 111_320;

function toCoordinateKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(DUPLICATE_COORDINATE_KEY_PRECISION)}:${longitude.toFixed(
    DUPLICATE_COORDINATE_KEY_PRECISION,
  )}`;
}

function offsetLatitude(latitude: number, meters: number) {
  return latitude + meters / METERS_PER_DEGREE_LATITUDE;
}

function offsetLongitude(latitude: number, longitude: number, meters: number) {
  const latitudeRadians = (latitude * Math.PI) / 180;
  const metersPerDegreeLongitude =
    METERS_PER_DEGREE_LATITUDE * Math.max(Math.cos(latitudeRadians), 0.0001);
  return longitude + meters / metersPerDegreeLongitude;
}

export function separateOverlappingMapIssues(issues: MapIssue[]) {
  const groupedIssues = new Map<string, MapIssue[]>();

  for (const issue of issues) {
    const key = toCoordinateKey(issue.latitude, issue.longitude);
    const group = groupedIssues.get(key);

    if (group) {
      group.push(issue);
    } else {
      groupedIssues.set(key, [issue]);
    }
  }

  return issues.map((issue) => {
    const group = groupedIssues.get(toCoordinateKey(issue.latitude, issue.longitude)) ?? [
      issue,
    ];

    if (group.length === 1) {
      return issue;
    }

    const sortedGroup = [...group].sort((left, right) => left.id.localeCompare(right.id));
    const issueIndex = sortedGroup.findIndex((candidate) => candidate.id === issue.id);
    const angle = (Math.PI * 2 * issueIndex) / group.length;
    const latitudeOffsetMeters = Math.sin(angle) * DISPLAY_OFFSET_RADIUS_METERS;
    const longitudeOffsetMeters = Math.cos(angle) * DISPLAY_OFFSET_RADIUS_METERS;

    return {
      ...issue,
      displayLatitude: offsetLatitude(issue.latitude, latitudeOffsetMeters),
      displayLongitude: offsetLongitude(
        issue.latitude,
        issue.longitude,
        longitudeOffsetMeters,
      ),
    };
  });
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
