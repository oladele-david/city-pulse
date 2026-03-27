import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Map, { Layer, MapRef, Marker, Source, type LayerProps } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Award01Icon,
  CheckmarkBadge01Icon,
  Invoice03Icon,
  LocationUser03Icon,
  TemperatureIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
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

  // Scroll detection for sticky header
  useEffect(() => {
    const el = scrollRef.current?.closest(".mobile-main-content");
    if (!el) return;
    const handler = () => setIsScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

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
    <div ref={scrollRef} className="flex flex-col bg-white pb-40">
      {/* Sticky header */}
      <div
        className={cn(
          "sticky top-0 z-30 px-4 py-3 flex items-center justify-between transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/30 shadow-sm"
            : "bg-transparent",
        )}
      >
        <div>
          <span className="text-[11px] font-medium text-muted-foreground">
            {isAuthenticated ? "Welcome back," : "Citizen access"}
          </span>
          <h1 className="text-lg font-bold text-foreground leading-tight">
            {session?.user.fullName?.split(" ")[0] ?? "CityPulse"}
          </h1>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/mobile/levies")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-background transition-transform active:scale-95"
            >
              <HugeiconsIcon icon={Invoice03Icon} className="h-5 w-5 text-foreground" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white">
                !
              </span>
            </button>
            <button
              onClick={() => navigate("/mobile/payments")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-background transition-transform active:scale-95"
            >
              <HugeiconsIcon icon={Wallet01Icon} className="h-5 w-5 text-foreground" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-white">
                !
              </span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/mobile/auth")}
            className="rounded-full border border-border/60 bg-background px-4 py-2 text-[11px] font-bold text-primary"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Location request modal */}
      <Dialog open={!location.hasPrompted} onOpenChange={(open) => { if (!open) location.dismissPrompt(); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Use your location?</DialogTitle>
            <DialogDescription>
              CityPulse will center the map on you so nearby reports load first.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 rounded-xl" onClick={location.requestLocation}>
              Allow
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl" onClick={location.dismissPrompt}>
              Not Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {locationMessage && (
        <div className="mx-4 mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
          {locationMessage}
        </div>
      )}

      {/* Map preview */}
      <div className="mb-6 px-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border bg-muted ring-1 ring-border/30">
          {/* Top overlay: Community rank pill */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 p-3">
            <div className="pointer-events-auto flex items-center justify-end">
              <button
                onClick={() => navigate("/mobile/leaderboard")}
                className="flex h-10 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/92 px-3 shadow-xl backdrop-blur-md transition-all active:scale-95"
              >
                <HugeiconsIcon icon={Award01Icon} className="h-4 w-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-800">
                  {leaderboard.spotlightRank ? `#${leaderboard.spotlightRank}` : "--"}
                </span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="h-3.5 w-3.5 text-amber-600 animate-[bounceX_1.5s_ease-in-out_infinite]"
                />
              </button>
            </div>
          </div>

          {/* Map */}
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

            {showHeatmap && issues.length > 0 && (
              <Source id="issues" type="geojson" data={geojsonData}>
                <Layer {...heatmapLayer} />
              </Source>
            )}
          </Map>

          {/* Bottom overlay: live issues pill (left) + heatmap toggle (right) */}
          <div className="absolute bottom-4 right-4 left-4 z-20 flex items-center justify-between">
            {/* Live issues pill — bottom left */}
            {issuesQuery.isLoading || issuesQuery.isFetching ? (
              <Skeleton className="h-8 w-28 rounded-full" />
            ) : (
              <button
                onClick={() => navigate("/mobile/map")}
                className="flex items-center gap-1.5 rounded-full border border-white/40 bg-background/90 px-3 py-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] font-bold text-foreground">
                  {issues.length} live {issues.length === 1 ? "issue" : "issues"}
                </span>
              </button>
            )}

            {/* Heatmap toggle — bottom right */}
            <button
              onClick={() => {
                setShowHeatmap((prev) => !prev);
                toast.info(!showHeatmap ? "Heatmap enabled" : "Heatmap disabled");
              }}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-lg transition-all active:scale-90",
                showHeatmap
                  ? "border-primary bg-primary text-white"
                  : "border-white/40 bg-background/90 text-foreground backdrop-blur-md",
              )}
            >
              <HugeiconsIcon icon={TemperatureIcon} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent reports */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Recent reports</h2>
          {leaderboard.spotlightEntry && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700">
              <HugeiconsIcon icon={CheckmarkBadge01Icon} className="h-3.5 w-3.5" />
              Score {leaderboard.spotlightEntry.score}
            </div>
          )}
        </div>

        <div className="divide-y divide-border/60">
          {recentIssues.map((issue) => (
            <button
              key={issue.id}
              onClick={() => {
                setSelectedIssue(issue);
                setIsSheetOpen(true);
              }}
              className="w-full py-3.5 text-left first:pt-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{issue.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {issue.locationName}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                  {issue.status.replace("_", " ")}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{issue.createdAtLabel}</span>
                <span>·</span>
                <span>{issue.confirmationsCount} agree</span>
                <span>·</span>
                <span>{issue.disagreementsCount} disagree</span>
              </div>
            </button>
          ))}
        </div>
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

      <style>{`
        @keyframes bounceX {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
};

export default MobileHome;
