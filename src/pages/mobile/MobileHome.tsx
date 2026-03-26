import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Layer, MapRef, Marker, Source, type LayerProps } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Award01Icon,
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  LocationUser03Icon,
  MapsLocation01Icon,
  Notification01Icon,
  TemperatureIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "@/components/ui/sonner";
import { MobileIssueSheet } from "@/components/mobile/sheets/MobileIssueSheet";
import { useCitizenAuth } from "@/hooks/use-auth";
import {
  getLocationErrorMessage,
  useCitizenLocation,
} from "@/hooks/use-citizen-location";
import {
  useCommunityLeaderboardSpotlight,
  useIssueReaction,
  useIssueReactionMutation,
  useLiveIssues,
} from "@/hooks/use-live-issues";
import { LAGOS_DEFAULT_ZOOM } from "@/lib/lagos";
import { MapIssue, toIssueGeoJson, toMapIssue } from "@/lib/map-issues";
import { cn } from "@/lib/utils";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const heatmapLayer: LayerProps = {
  id: "heatmap-layer",
  type: "heatmap",
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "confidence"], 0, 0, 1, 1],
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 15, 3],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(0,0,0,0)",
      0.2,
      "rgba(239, 68, 68, 0.12)",
      0.4,
      "rgba(249, 115, 22, 0.24)",
      0.7,
      "rgba(245, 158, 11, 0.42)",
      1,
      "rgba(220, 38, 38, 0.7)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 6, 15, 30],
    "heatmap-opacity": 0.85,
  },
};

const MobileHome = () => {
  const navigate = useNavigate();
  const { session, isAuthenticated } = useCitizenAuth();
  const mapRef = useRef<MapRef>(null);
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const location = useCitizenLocation();
  const issuesQuery = useLiveIssues("mobile-home");
  const reactionMutation = useIssueReactionMutation();
  const selectedReactionQuery = useIssueReaction(selectedIssue?.id ?? null);
  const leaderboard = useCommunityLeaderboardSpotlight(session?.user.communityId);

  const issues = useMemo(
    () => (issuesQuery.data ?? []).map(toMapIssue),
    [issuesQuery.data],
  );

  const recentIssues = useMemo(
    () =>
      [...issues]
        .sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
        )
        .slice(0, 4),
    [issues],
  );

  const geojsonData = useMemo(() => toIssueGeoJson(issues), [issues]);

  useEffect(() => {
    mapRef.current?.flyTo({
      center: [location.coordinates.longitude, location.coordinates.latitude],
      zoom: location.source === "user" ? 13.2 : LAGOS_DEFAULT_ZOOM,
      duration: 1200,
    });
  }, [location.coordinates.latitude, location.coordinates.longitude, location.source]);

  const handleReaction = async (reaction: "confirm" | "disagree") => {
    if (!selectedIssue) return;
    if (!isAuthenticated) {
      navigate("/mobile/auth");
      return;
    }

    try {
      const nextReaction =
        selectedReactionQuery.data?.reaction === reaction ? "none" : reaction;
      await reactionMutation.mutateAsync({
        issueId: selectedIssue.id,
        reaction: nextReaction,
      });
      toast.success(
        nextReaction === "none"
          ? "Your previous reaction was removed."
          : nextReaction === "confirm"
            ? "Your agreement was recorded."
            : "Your disagreement was recorded.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update reaction.");
    }
  };

  const locationMessage = getLocationErrorMessage(location.permissionState);

  return (
    <div className="flex flex-col bg-[radial-gradient(circle_at_top,#fff7ed,transparent_36%),linear-gradient(180deg,#fffdf8_0%,#f8fafc_55%,#ffffff_100%)] pb-40">
      <div className="px-6 pb-3 pt-6">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[12px] font-medium text-muted-foreground">
                {isAuthenticated ? "Welcome back," : "Citizen access"}
              </span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {session?.user.fullName?.split(" ")[0] ?? "CityPulse"}
              </h1>
              <p className="mt-2 max-w-[16rem] text-sm leading-6 text-muted-foreground">
                Track live reports near you, verify what is real, and help Lagos teams respond faster.
              </p>
            </div>

            {isAuthenticated ? (
              <button className="relative flex h-11 w-11 items-center justify-center rounded-full border bg-background shadow-sm transition-transform active:scale-95">
                <HugeiconsIcon
                  icon={Notification01Icon}
                  className="h-5 w-5 text-foreground"
                />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-background bg-primary" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/mobile/auth")}
                className="rounded-full border border-border/60 bg-background px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[1.5rem] bg-primary px-4 py-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                Live issues
              </p>
              <p className="mt-2 text-2xl font-bold">{issues.length}</p>
              <p className="mt-1 text-xs text-white/75">Across Lagos right now</p>
            </div>
            <div className="rounded-[1.5rem] bg-amber-50 px-4 py-4 text-amber-950">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Award01Icon} className="h-4 w-4 text-amber-700" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
                    Community rank
                  </p>
                </div>
                <button
                  onClick={() => navigate("/mobile/leaderboard")}
                  className="rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-700"
                >
                  See More
                </button>
              </div>
              <p className="mt-2 text-2xl font-bold">
                {leaderboard.spotlightRank ? `#${leaderboard.spotlightRank}` : "--"}
              </p>
              <p className="mt-1 text-xs text-amber-900/70">
                {leaderboard.spotlightEntry?.communityName ?? "Waiting for leaderboard"}
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/mobile/levies")}
                className="rounded-[1.25rem] border border-border/60 bg-background px-4 py-3 text-left shadow-sm"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Levies
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  Pay local civic dues
                </p>
              </button>
              <button
                onClick={() => navigate("/mobile/payments")}
                className="rounded-[1.25rem] border border-border/60 bg-background px-4 py-3 text-left shadow-sm"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Payments
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  See receipts and status
                </p>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 px-6 pb-1">
        {!location.hasPrompted && (
          <div className="rounded-[1.5rem] border border-border/50 bg-primary/5 p-4 shadow-sm">
            <p className="text-sm font-bold text-foreground">
              Use your location for nearby Lagos reports
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              CityPulse can center the map around you so nearby incidents and report pins start in the right place.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={location.requestLocation}
                className="rounded-full bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white"
              >
                Use My Location
              </button>
              <button
                onClick={location.dismissPrompt}
                className="rounded-full border border-border/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground"
              >
                Not Now
              </button>
            </div>
          </div>
        )}

        {locationMessage && (
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium leading-relaxed text-amber-900">
            {locationMessage}
          </div>
        )}
      </div>

      <div className="mb-6 px-6">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border bg-muted shadow-inner-lg ring-1 ring-border/30">
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 p-3">
            <div className="pointer-events-auto flex items-center gap-2">
              <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/50 bg-background/92 px-4 shadow-xl backdrop-blur-md">
                <HugeiconsIcon
                  icon={MapsLocation01Icon}
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                />
                <span className="truncate text-xs font-bold text-muted-foreground">
                  {issuesQuery.isFetching ? "Syncing live Lagos reports" : "Lagos issue map"}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowHeatmap((previous) => !previous);
                  toast.info(showHeatmap ? "Map markers visible" : "Heatmap enabled");
                }}
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-xl transition-all active:scale-95",
                  showHeatmap
                    ? "border-primary bg-primary text-white"
                    : "border-white/50 bg-background/92 text-foreground backdrop-blur-md",
                )}
              >
                <HugeiconsIcon icon={TemperatureIcon} className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Map
            ref={mapRef}
            initialViewState={{
              latitude: location.coordinates.latitude,
              longitude: location.coordinates.longitude,
              zoom: location.source === "user" ? 13.2 : LAGOS_DEFAULT_ZOOM,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            attributionControl={false}
            scrollZoom={false}
            dragPan
            doubleClickZoom={false}
          >
            {location.source === "user" && (
              <Marker
                latitude={location.coordinates.latitude}
                longitude={location.coordinates.longitude}
                anchor="center"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-12 w-12 animate-ping rounded-full bg-primary/20" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-primary shadow-xl">
                    <HugeiconsIcon
                      icon={LocationUser03Icon}
                      className="h-5 w-5 text-white"
                    />
                  </div>
                </div>
              </Marker>
            )}

            {issues.length > 0 && (
              <Source id="issues" type="geojson" data={geojsonData}>
                <Layer {...heatmapLayer} />
              </Source>
            )}
          </Map>

          <button
            onClick={() => navigate("/mobile/report")}
            className="absolute bottom-24 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-primary text-white shadow-2xl shadow-primary/40 transition-all active:scale-90"
          >
            <HugeiconsIcon icon={Add01Icon} className="h-6 w-6" />
          </button>

          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-background/90 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-foreground">
                  {issuesQuery.isLoading
                    ? "Loading live Lagos issues"
                    : issues.length > 0
                      ? `${issues.length} live issues synced`
                      : "No live issues yet"}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reports added by other users will appear here automatically.
                </p>
              </div>
              <button
                onClick={() => navigate("/mobile/map")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border/50 bg-background"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Recent issue movement
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">
              What neighbors are reporting now
            </h2>
          </div>
          {leaderboard.spotlightEntry && (
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-amber-700">
              <HugeiconsIcon icon={CheckmarkBadge01Icon} className="h-4 w-4" />
              Score {leaderboard.spotlightEntry.score}
            </div>
          )}
        </div>

        {recentIssues.map((issue) => (
          <button
            key={issue.id}
            onClick={() => {
              setSelectedIssue(issue);
              setIsSheetOpen(true);
            }}
            className="w-full rounded-[1.75rem] border border-border/60 bg-white/90 p-4 text-left shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-foreground">{issue.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {issue.locationName}
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {issue.status.replace("_", " ")}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{issue.confirmationsCount} agree</span>
              <span>{issue.disagreementsCount} disagree</span>
              <span>{issue.photoUrls.length > 0 || issue.videoUrl ? "media attached" : "text only"}</span>
            </div>
          </button>
        ))}
      </div>

      <MobileIssueSheet
        issue={selectedIssue}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onConfirm={() => void handleReaction("confirm")}
        onDisagree={() => void handleReaction("disagree")}
        userReaction={selectedReactionQuery.data?.reaction}
        canReact={isAuthenticated}
        isSubmittingReaction={reactionMutation.isPending}
      />
    </div>
  );
};

export default MobileHome;
