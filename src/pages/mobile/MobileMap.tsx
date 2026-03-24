import { useRef, useMemo, useState } from 'react';
import Map, { Source, Layer, MapRef, Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HugeiconsIcon } from "@hugeicons/react";
import {
    MapsLocation01Icon,
    FilterIcon,
    LocationUser03Icon,
    RoadIcon,
    BlackHole01Icon,
    IdeaIcon,
    VolumeHighIcon,
    ThermometerWarmIcon,
    TemperatureIcon
} from "@hugeicons/core-free-icons";
import { mockIssues, Issue } from '@/data/mockIssues';
import { MobileIssueSheet } from '@/components/mobile/MobileIssueSheet';
import { MobileMapFilters } from '@/components/mobile/MobileMapFilters';
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

// Mapbox Token from environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const DUMMY_USER_LOCATION = {
    latitude: 25.1972,
    longitude: 55.2744
};

const MobileMap = () => {
    const mapRef = useRef<MapRef>(null);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);

    const [activeFilters, setActiveFilters] = useState({
        severity: 'all',
        type: 'all'
    });

    const handleFilterChange = (key: 'severity' | 'type', value: string) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
    };

    const getIconByIssueType = (type: string) => {
        switch (type) {
            case 'road': return RoadIcon;
            case 'drainage': return BlackHole01Icon;
            case 'lighting': return IdeaIcon;
            case 'noise': return VolumeHighIcon;
            case 'heat': return ThermometerWarmIcon;
            default: return RoadIcon;
        }
    };

    const filteredIssues = useMemo(() => {
        return mockIssues.filter(issue => {
            if (activeFilters.severity !== 'all' && issue.severity !== activeFilters.severity) return false;
            if (activeFilters.type !== 'all' && issue.type !== activeFilters.type) return false;
            return true;
        });
    }, [activeFilters]);

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
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 15, 60],
            'heatmap-opacity': 0.8
        }
    };

    const geojsonData = useMemo(() => ({
        type: 'FeatureCollection' as const,
        features: filteredIssues.map(issue => ({
            type: 'Feature' as const,
            properties: { id: issue.id, confidence: issue.confidence },
            geometry: { type: 'Point' as const, coordinates: [issue.longitude, issue.latitude] }
        }))
    }), [filteredIssues]);

    const handleConfirm = () => {
        toast.success("Issue verified successfully");
        setIsSheetOpen(false);
    };

    const handleDisagree = () => {
        toast.info("Thank you for your feedback");
        setIsSheetOpen(false);
    };

    return (
        <div className="relative w-full h-full bg-background overflow-hidden">
            {/* Top Bar - Centralized and Balanced */}
            <div className="fixed top-6 left-0 right-0 z-40 px-4 pointer-events-none">
                <div className="flex items-center gap-2 max-w-[380px] mx-auto pointer-events-auto">
                    {/* Search Bar - Slightly flexible */}
                    <div className="flex-1 min-w-0 h-14 bg-background/95 backdrop-blur-md rounded-2xl border border-border/40 shadow-xl flex items-center px-4 gap-3">
                        <HugeiconsIcon icon={MapsLocation01Icon} className="w-5 h-5 text-muted-foreground shrink-0" />
                        <span className="text-[14px] font-bold text-muted-foreground truncate">Search records...</span>
                    </div>

                    {/* Heatmap Toggle */}
                    <button
                        onClick={() => {
                            setShowHeatmap(!showHeatmap);
                            toast.info(showHeatmap ? "Map markers visible" : "Heatmap enabled");
                        }}
                        className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all border shadow-xl active:scale-95 shrink-0",
                            showHeatmap
                                ? "bg-primary text-white border-primary"
                                : "bg-background/95 backdrop-blur-md text-foreground border-border/40"
                        )}
                    >
                        <HugeiconsIcon icon={TemperatureIcon} className="w-5 h-5" />
                    </button>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all border shadow-xl active:scale-95 shrink-0",
                            isFilterOpen
                                ? "bg-primary text-white border-primary"
                                : "bg-background/95 backdrop-blur-md text-foreground border-border/40"
                        )}
                    >
                        <HugeiconsIcon icon={FilterIcon} className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Dropdown Filters */}
            <MobileMapFilters
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
            />

            <Map
                ref={mapRef}
                initialViewState={{
                    latitude: DUMMY_USER_LOCATION.latitude,
                    longitude: DUMMY_USER_LOCATION.longitude,
                    zoom: 12.5
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
                attributionControl={false}
            >
                {/* Heatmap Layer */}
                {showHeatmap && (
                    <Source id="heatmap" type="geojson" data={geojsonData}>
                        <Layer {...heatmapLayer} />
                    </Source>
                )}

                {/* Issue Markers - Subtle Style */}
                {!showHeatmap && filteredIssues.map((issue) => (
                    <Marker
                        key={issue.id}
                        latitude={issue.latitude}
                        longitude={issue.longitude}
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            setSelectedIssue(issue);
                            setIsSheetOpen(true);
                        }}
                    >
                        <div className="relative group cursor-pointer transition-transform hover:scale-110 active:scale-90">
                            <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-black/10",
                                issue.severity === 'high' ? "bg-red-500/90" :
                                    issue.severity === 'medium' ? "bg-orange-500/90" : "bg-yellow-500/90"
                            )}>
                                <HugeiconsIcon icon={getIconByIssueType(issue.type)} className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </Marker>
                ))}

                {/* User Location Marker */}
                <Marker
                    latitude={DUMMY_USER_LOCATION.latitude}
                    longitude={DUMMY_USER_LOCATION.longitude}
                    anchor="center"
                >
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-12 h-12 bg-primary/20 rounded-full animate-ping" />
                        <div className="relative w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                            <HugeiconsIcon icon={LocationUser03Icon} className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </Marker>
            </Map>

            <MobileIssueSheet
                issue={selectedIssue}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onConfirm={handleConfirm}
                onDisagree={handleDisagree}
            />
        </div>
    );
};

export default MobileMap;
