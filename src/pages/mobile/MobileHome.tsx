import { useRef, useMemo } from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Notification01Icon,
    Road01Icon,
    DropletIcon,
    IdeaIcon,
    VolumeHighIcon,
    ThermometerIcon,
    ArrowRight01Icon
} from "@hugeicons/core-free-icons";
import { mockIssues } from '@/data/mockIssues';

// Mapbox Token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MobileHome = () => {
    const mapRef = useRef<MapRef>(null);

    // Convert mockIssues to GeoJSON for the heatmap
    const geojsonData = useMemo(() => ({
        type: 'FeatureCollection' as const,
        features: mockIssues.map(issue => ({
            type: 'Feature' as const,
            properties: {
                id: issue.id,
                severity: issue.severity,
                confidence: issue.confidence,
                type: issue.type
            },
            geometry: {
                type: 'Point' as const,
                coordinates: [issue.longitude, issue.latitude]
            }
        }))
    }), []);

    const heatmapLayer: any = {
        id: 'heatmap-layer',
        type: 'heatmap',
        paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'confidence'], 0, 0, 1, 1],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0,0,0,0)',
                0.2, 'rgba(239, 68, 68, 0.1)',
                0.4, 'rgba(239, 68, 68, 0.2)',
                0.6, 'rgba(239, 68, 68, 0.4)',
                0.8, 'rgba(239, 68, 68, 0.6)',
                1, 'rgba(239, 68, 68, 0.8)'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 4, 15, 30],
            'heatmap-opacity': 0.8
        }
    };

    const getIconByIssueType = (type: string) => {
        switch (type) {
            case 'road': return Road01Icon;
            case 'drainage': return DropletIcon;
            case 'lighting': return IdeaIcon;
            case 'noise': return VolumeHighIcon;
            case 'heat': return ThermometerIcon;
            default: return Road01Icon;
        }
    };

    // Get 3 most recent issues
    const recentIssues = useMemo(() => {
        return [...mockIssues]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3);
    }, []);

    return (
        <div className="flex flex-col h-full bg-background pb-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 pt-6">
                <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-muted-foreground">Welcome back,</span>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Ahmed</h1>
                </div>
                <button className="h-10 w-10 flex items-center justify-center border rounded-full relative bg-background active:scale-95 transition-transform shadow-sm">
                    <HugeiconsIcon icon={Notification01Icon} className="w-5 h-5 text-foreground" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                </button>
            </div>

            {/* Mini Map Container */}
            <div className="px-6 mb-6">
                <div className="relative aspect-[4/5] bg-muted rounded-[2.5rem] overflow-hidden border shadow-inner-lg ring-1 ring-border/30">
                    <Map
                        ref={mapRef}
                        initialViewState={{
                            latitude: 25.2048,
                            longitude: 55.2708,
                            zoom: 11
                        }}
                        style={{ width: '100%', height: '100%' }}
                        mapStyle="mapbox://styles/mapbox/light-v11"
                        mapboxAccessToken={MAPBOX_TOKEN}
                        attributionControl={false}
                        scrollZoom={false}
                        dragPan={true}
                        doubleClickZoom={false}
                    >
                        <Source id="issues" type="geojson" data={geojsonData}>
                            <Layer {...heatmapLayer} />
                        </Source>
                    </Map>

                    {/* Status Strip */}
                    <div className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between border border-white/20 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
                            </div>
                            <span className="text-xs font-bold tracking-wide text-foreground">SYSTEM ACTIVE</span>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-widest leading-none">
                            Sync: Just now
                        </span>
                    </div>
                </div>
            </div>

            {/* Nearby Issues Section */}
            <div className="px-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">Recent Activity</h2>
                    <button className="text-xs font-bold text-primary px-3 py-1 hover:bg-primary/5 rounded-full transition-colors leading-none">
                        EXPLORE MAP
                    </button>
                </div>

                <div className="space-y-3">
                    {recentIssues.map((issue) => (
                        <div
                            key={issue.id}
                            className="group p-4 bg-background border rounded-2xl flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-muted/10"
                        >
                            <div className="w-9 h-9 flex items-center justify-center rounded-xl text-foreground bg-muted/40">
                                <HugeiconsIcon
                                    icon={getIconByIssueType(issue.type)}
                                    className="w-4.5 h-4.5"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground leading-tight truncate">{issue.title}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                                    {issue.location_name} • {Math.round(issue.confidence * 100)}% RELIABILITY
                                </p>
                            </div>
                            <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-muted-foreground/40" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MobileHome;
