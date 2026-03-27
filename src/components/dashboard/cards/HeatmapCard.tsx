import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import type { FeatureCollection, Point } from 'geojson';
import type { HeatmapLayer } from 'react-map-gl/mapbox';
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { MapsLocation01Icon } from "@hugeicons/core-free-icons";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import 'mapbox-gl/dist/mapbox-gl.css';

const heatmapLayer: HeatmapLayer = {
    id: 'heatmap',
    maxzoom: 15,
    type: 'heatmap',
    paint: {
        'heatmap-weight': [
            'interpolate', ['linear'], ['get', 'mag'],
            0, 0, 1, 1
        ],
        'heatmap-intensity': [
            'interpolate', ['linear'], ['zoom'],
            0, 1, 9, 3
        ],
        'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
        ],
        'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            0, 2, 9, 20
        ],
        'heatmap-opacity': [
            'interpolate', ['linear'], ['zoom'],
            14, 1, 15, 0
        ]
    }
};

const severityWeight: Record<string, number> = {
    high: 1,
    medium: 0.6,
    low: 0.3,
};

export const HeatmapCard = ({ className }: { className?: string }) => {
    const issuesQuery = useQuery({
        queryKey: ["issues"],
        queryFn: () => api.listIssues(),
    });

    const geoData = useMemo<FeatureCollection<Point>>(() => {
        const issues = issuesQuery.data ?? [];
        return {
            type: 'FeatureCollection',
            features: issues.map((issue, i) => ({
                type: 'Feature' as const,
                properties: {
                    id: i,
                    mag: severityWeight[issue.severity] ?? 0.5,
                },
                geometry: {
                    type: 'Point' as const,
                    coordinates: [issue.longitude, issue.latitude],
                },
            })),
        };
    }, [issuesQuery.data]);

    // Center on Lagos
    const center = useMemo(() => {
        const issues = issuesQuery.data ?? [];
        if (issues.length === 0) return { lat: 6.5244, lng: 3.3792 };
        const avgLat = issues.reduce((s, i) => s + i.latitude, 0) / issues.length;
        const avgLng = issues.reduce((s, i) => s + i.longitude, 0) / issues.length;
        return { lat: avgLat, lng: avgLng };
    }, [issuesQuery.data]);

    return (
        <div className={cn("border bg-white p-2 rounded-lg border-gray-200 shadow-md overflow-hidden flex flex-col relative group", className)}>
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                <div>
                    <h3 className="font-semibold text-lg text-white drop-shadow-md">Issue Density Heatmap</h3>
                </div>
                <Link to="/console/dashboard/map" className="pointer-events-auto">
                    <button className="bg-white/90 hover:bg-white text-primary text-xs font-medium px-3 py-1.5 rounded-full shadow-sm transition-colors backdrop-blur-sm flex items-center gap-1.5">
                        <HugeiconsIcon icon={MapsLocation01Icon} className="w-3.5 h-3.5" />
                        View Live Map
                    </button>
                </Link>
            </div>
            <div className="flex-1 w-full h-full relative rounded-lg overflow-hidden border border-border/5">
                <Map
                    initialViewState={{
                        latitude: center.lat,
                        longitude: center.lng,
                        zoom: 11
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                    attributionControl={false}
                >
                    <Source type="geojson" data={geoData}>
                        <Layer {...heatmapLayer} />
                    </Source>
                </Map>
            </div>
        </div>
    );
};
