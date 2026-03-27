import { LevyRecord } from "@/types/api";

export const ITEMS_PER_PAGE = 10;

export function formatLevyType(type: string) {
  return type
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getStatusColor(status: string) {
  switch (status) {
    case "published":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "draft":
      return "text-orange-700 bg-orange-50 border-orange-200";
    case "closed":
      return "text-gray-700 bg-gray-50 border-gray-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
}

export function getTargetName(levy: LevyRecord) {
  if (levy.targetType === "community") {
    return levy.targetCommunity?.name ?? levy.targetCommunityId ?? "—";
  }
  return levy.targetLga?.name ?? levy.targetLgaId ?? "—";
}
