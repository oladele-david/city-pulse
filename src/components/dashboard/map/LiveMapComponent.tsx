import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapFilters } from "./MapFilters";
import { IssueDrawer } from "./IssueDrawer";
import { api } from "@/lib/api";
import { LAGOS_CENTER, LAGOS_DEFAULT_ZOOM } from "@/lib/lagos";
import { MapIssue, toMapIssue } from "@/lib/map-issues";

export const LiveMapComponent = () => {
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
  const [filters, setFilters] = useState({ severity: "all", status: "all" });
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("dark");

  const issuesQuery = useQuery({
    queryKey: ["issues", "admin-map"],
    queryFn: () => api.listIssues(),
  });

  const issues = useMemo(
    () => (issuesQuery.data ?? []).map(toMapIssue),
    [issuesQuery.data],
  );

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (filters.severity !== "all" && issue.severity !== filters.severity) {
        return false;
      }
      if (filters.status !== "all" && issue.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [filters, issues]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  return (
    <div className="relative h-full w-full bg-slate-950">
      <MapFilters
        isDrawerOpen={!!selectedIssue}
        filters={filters}
        onFilterChange={handleFilterChange}
        mapTheme={mapTheme}
        onThemeToggle={() =>
          setMapTheme((previous) => (previous === "dark" ? "light" : "dark"))
        }
      />
      <IssueDrawer
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        issue={selectedIssue}
      />

      <Map
        initialViewState={{
          latitude: LAGOS_CENTER.latitude,
          longitude: LAGOS_CENTER.longitude,
          zoom: LAGOS_DEFAULT_ZOOM,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={
          mapTheme === "dark"
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/light-v11"
        }
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        attributionControl={false}
      >
        {filteredIssues.map((issue) => (
          <Marker
            key={issue.id}
            longitude={issue.longitude}
            latitude={issue.latitude}
            anchor="bottom"
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              setSelectedIssue(issue);
            }}
          >
            <div
              className="cursor-pointer transition-transform hover:scale-125"
              style={{
                width: issue.confidence * 20 + 8,
                height: issue.confidence * 20 + 8,
                backgroundColor:
                  issue.severity === "high"
                    ? "#ef4444"
                    : issue.severity === "medium"
                      ? "#f97316"
                      : "#eab308",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.8)",
                boxShadow: `0 0 10px ${
                  issue.severity === "high"
                    ? "rgba(239,68,68,0.5)"
                    : issue.severity === "medium"
                      ? "rgba(249,115,22,0.5)"
                      : "rgba(234,179,8,0.5)"
                }`,
              }}
            />
          </Marker>
        ))}
      </Map>

      <div className="absolute bottom-4 left-4 z-10 max-w-sm rounded-xl border border-white/10 bg-background/90 px-4 py-3 text-sm text-foreground shadow-2xl backdrop-blur-md">
        <p className="font-semibold">
          {issuesQuery.isLoading
            ? "Loading live Lagos issue markers..."
            : issuesQuery.isError
              ? "Live Lagos issue markers are unavailable."
              : filteredIssues.length > 0
                ? `${filteredIssues.length} live Lagos issues on the map`
                : "No live Lagos issues match the current filters."}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Admin map markers now come from the public `GET /issues` feed.
        </p>
      </div>
    </div>
  );
};
