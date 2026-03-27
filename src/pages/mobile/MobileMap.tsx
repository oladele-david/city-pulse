import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, MapRef, Marker, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FilterIcon,
  LocationUser03Icon,
  MapsLocation01Icon,
  TemperatureIcon,
} from "@hugeicons/core-free-icons";
import { MobileIssueSheet } from "@/components/mobile/sheets/MobileIssueSheet";
import { MobileMapFilters } from "@/components/mobile/ui/MobileMapFilters";
import { toast } from "@/components/ui/sonner";
import { useCitizenAuth } from "@/hooks/use-auth";
import { useCitizenLocation } from "@/hooks/use-citizen-location";
import {
  useIssueReaction,
  useIssueReactionMutation,
  useLiveIssues,
} from "@/hooks/use-live-issues";
import { LAGOS_DEFAULT_ZOOM } from "@/lib/lagos";
import {
  MapIssue,
  separateOverlappingMapIssues,
  toIssueGeoJson,
  toMapIssue,
} from "@/lib/map-issues";
import { cn } from "@/lib/utils";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const heatmapLayer = {
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
      "rgba(239,68,68,0.1)",
      0.4,
      "rgba(239,68,68,0.2)",
      0.6,
      "rgba(239,68,68,0.4)",
      0.8,
      "rgba(239,68,68,0.6)",
      1,
      "rgba(239,68,68,0.8)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 15, 15, 60],
    "heatmap-opacity": 0.8,
  },
};

const MobileMap = () => {
  const mapRef = useRef<MapRef>(null);
  const location = useCitizenLocation();
  const { isAuthenticated } = useCitizenAuth();
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    severity: "all",
    type: "all",
  });
  const issuesQuery = useLiveIssues("mobile-map");
  const reactionMutation = useIssueReactionMutation();
  const selectedReactionQuery = useIssueReaction(selectedIssue?.id ?? null);

  const issues = useMemo(
    () => separateOverlappingMapIssues((issuesQuery.data ?? []).map(toMapIssue)),
    [issuesQuery.data],
  );

  const filteredIssues = useMemo(
    () =>
      issues.filter((issue) => {
        if (
          activeFilters.severity !== "all" &&
          issue.severity !== activeFilters.severity
        ) {
          return false;
        }
        if (activeFilters.type !== "all" && issue.type !== activeFilters.type) {
          return false;
        }
        return true;
      }),
    [activeFilters, issues],
  );

  const geojsonData = useMemo(
    () => toIssueGeoJson(filteredIssues),
    [filteredIssues],
  );

  useEffect(() => {
    mapRef.current?.flyTo({
      center: [location.coordinates.longitude, location.coordinates.latitude],
      zoom: location.source === "user" ? 13.2 : LAGOS_DEFAULT_ZOOM,
      duration: 1200,
    });
  }, [location.coordinates.latitude, location.coordinates.longitude, location.source]);

  const handleFilterChange = (key: "severity" | "type", value: string) => {
    setActiveFilters((previous) => ({ ...previous, [key]: value }));
  };

  const handleReaction = async (reaction: "confirm" | "disagree") => {
    if (!selectedIssue || !isAuthenticated) {
      toast.info("Sign in to react to this issue.");
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
          ? "Your reaction was removed."
          : nextReaction === "confirm"
            ? "Your agreement was recorded."
            : "Your disagreement was recorded.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update reaction.");
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <div className="pointer-events-none fixed left-0 right-0 top-6 z-40 px-4">
        <div className="pointer-events-auto mx-auto flex max-w-[380px] flex-col gap-3">
          {!location.hasPrompted && (
            <div className="rounded-2xl border border-border/50 bg-background/95 p-4 shadow-xl backdrop-blur-md">
              <p className="text-sm font-bold text-foreground">Center the map around you</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Allow location to jump to nearby Lagos issues. If you skip, the map stays centered on Lagos.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={location.requestLocation}
                  className="rounded-full bg-primary px-4 py-2 text-[11px] font-bold text-white"
                >
                  Use My Location
                </button>
                <button
                  onClick={location.dismissPrompt}
                  className="rounded-full border border-border/60 px-4 py-2 text-[11px] font-bold text-foreground"
                >
                  Not Now
                </button>
              </div>
            </div>
          )}

          {location.locationErrorMessage && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900 shadow-lg">
              {location.locationErrorMessage}
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border/40 bg-background/95 px-4 shadow-xl backdrop-blur-md">
              <HugeiconsIcon
                icon={MapsLocation01Icon}
                className="h-5 w-5 shrink-0 text-muted-foreground"
              />
              <span className="truncate text-[14px] font-bold text-muted-foreground">
                {issuesQuery.isFetching ? "Syncing live Lagos reports" : "Lagos issue map"}
              </span>
            </div>

            <button
              onClick={() => {
                setShowHeatmap((previous) => !previous);
                toast.info(showHeatmap ? "Map markers visible" : "Heatmap enabled");
              }}
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-xl transition-all active:scale-95",
                showHeatmap
                  ? "border-primary bg-primary text-white"
                  : "border-border/40 bg-background/95 text-foreground backdrop-blur-md",
              )}
            >
              <HugeiconsIcon icon={TemperatureIcon} className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsFilterOpen((previous) => !previous)}
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-xl transition-all active:scale-95",
                isFilterOpen
                  ? "border-primary bg-primary text-white"
                  : "border-border/40 bg-background/95 text-foreground backdrop-blur-md",
              )}
            >
              <HugeiconsIcon icon={FilterIcon} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <MobileMapFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

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

        {showHeatmap && filteredIssues.length > 0 && (
          <Source id="heatmap" type="geojson" data={geojsonData}>
            <Layer {...heatmapLayer} />
          </Source>
        )}

        {!showHeatmap &&
          filteredIssues.map((issue) => (
            <Marker
              key={issue.id}
              latitude={issue.displayLatitude}
              longitude={issue.displayLongitude}
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                setSelectedIssue(issue);
                setIsSheetOpen(true);
              }}
            >
              <div className="group relative cursor-pointer transition-transform hover:scale-110 active:scale-90">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl border-2 border-white shadow-sm ring-1 ring-black/10",
                    issue.severity === "high"
                      ? "bg-red-500/90"
                      : issue.severity === "medium"
                        ? "bg-orange-500/90"
                        : "bg-yellow-500/90",
                  )}
                />
                {(issue.photoUrls.length > 0 || issue.videoUrl) && (
                  <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border border-white bg-sky-500" />
                )}
              </div>
            </Marker>
          ))}
      </Map>

      <div className="pointer-events-none absolute bottom-28 left-4 right-4 z-30">
        <div className="rounded-2xl border border-border/50 bg-background/95 p-4 shadow-xl backdrop-blur-md">
          <p className="text-sm font-bold text-foreground">
            {issuesQuery.isLoading
              ? "Loading reports..."
              : `${filteredIssues.length} issue${filteredIssues.length === 1 ? "" : "s"} match your filters`}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            New issues from other users are refetched automatically so the map stays current.
          </p>
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
    </div>
  );
};

export default MobileMap;
