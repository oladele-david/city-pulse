import { format, formatDistanceToNowStrict } from "date-fns";
import { ActivityEntry } from "@/types/api";

export interface ActivityContribution {
  id: string;
  type: "report" | "confirmation" | "resolution";
  title: string;
  location: string;
  timestamp: string;
  fullDate: string;
  points: number;
  status: "pending" | "verified" | "resolved" | "rejected";
  description: string;
  category: string;
}

const LEDGER_REASON_COPY: Record<
  ActivityEntry["reason"],
  Pick<ActivityContribution, "type" | "status" | "category"> & {
    title: (entry: ActivityEntry) => string;
    description: (entry: ActivityEntry) => string;
  }
> = {
  report_submitted: {
    type: "report",
    status: "pending",
    category: "Issue Report",
    title: () => "Issue submitted",
    description: () =>
      "Your report was submitted and is waiting for review from the CityPulse team.",
  },
  report_validated: {
    type: "report",
    status: "verified",
    category: "Issue Review",
    title: () => "Issue validated",
    description: () =>
      "An operator reviewed your issue and moved it into active handling.",
  },
  report_kept_valid: {
    type: "resolution",
    status: "resolved",
    category: "Issue Resolution",
    title: () => "Issue resolved",
    description: () =>
      "Your report stayed valid through resolution and earned you additional points.",
  },
  confirm_issue: {
    type: "confirmation",
    status: "verified",
    category: "Community Verification",
    title: () => "Issue confirmed",
    description: () =>
      "You confirmed a live issue to strengthen confidence for responders.",
  },
  valid_confirmation: {
    type: "confirmation",
    status: "verified",
    category: "Community Verification",
    title: () => "Confirmation rewarded",
    description: () =>
      "Your earlier confirmation was validated by later review.",
  },
  correct_disagreement: {
    type: "confirmation",
    status: "verified",
    category: "Community Verification",
    title: () => "Disagreement rewarded",
    description: () =>
      "Your disagreement helped flag an issue that needed re-checking.",
  },
  fixed_signal_match: {
    type: "resolution",
    status: "resolved",
    category: "Resolution Signal",
    title: () => "Fixed signal matched",
    description: () =>
      "Your fixed signal matched the issue outcome and improved the trust trail.",
  },
  false_report: {
    type: "report",
    status: "rejected",
    category: "Issue Review",
    title: () => "Report rejected",
    description: () =>
      "This report was marked invalid after review.",
  },
  invalid_reaction: {
    type: "confirmation",
    status: "rejected",
    category: "Community Verification",
    title: () => "Reaction reversed",
    description: () =>
      "A reaction was reversed after later review showed it was inaccurate.",
  },
  fraud_abuse: {
    type: "report",
    status: "rejected",
    category: "Account Review",
    title: () => "Account flagged",
    description: () =>
      "This entry was created during an abuse review event.",
  },
};

function toLocation(entry: ActivityEntry) {
  const metadata = entry.metadata ?? {};
  const rawLocation =
    metadata.streetOrLandmark ??
    metadata.locationName ??
    metadata.communityName ??
    metadata.issueTitle;

  return typeof rawLocation === "string" ? rawLocation : "Lagos community activity";
}

export function toActivityContribution(entry: ActivityEntry): ActivityContribution {
  const copy = LEDGER_REASON_COPY[entry.reason];

  return {
    id: entry.id,
    type: copy.type,
    title: copy.title(entry),
    location: toLocation(entry),
    timestamp: formatDistanceToNowStrict(new Date(entry.createdAt), {
      addSuffix: true,
    }),
    fullDate: format(new Date(entry.createdAt), "MMMM d, yyyy • hh:mm a"),
    points: entry.pointsDelta,
    status: copy.status,
    description: copy.description(entry),
    category: copy.category,
  };
}
