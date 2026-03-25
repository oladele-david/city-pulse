import { useRef } from 'react';
import Map, { Marker, MapRef } from 'react-map-gl/mapbox';
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon, MapsLocation01Icon } from "@hugeicons/core-free-icons";
import { ReportActions } from "./ReportActions";
import { ResolvedLocation } from '@/types/api';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface LocationStepProps {
    markerLocation: { latitude: number; longitude: number };
    resolvedLocation?: ResolvedLocation;
    isResolvingLocation: boolean;
    onLocationChange: (loc: { latitude: number; longitude: number }) => void;
    onBack: () => void;
    onNext: () => void;
}

export const LocationStep = ({
    markerLocation,
    resolvedLocation,
    isResolvingLocation,
    onLocationChange,
    onBack,
    onNext
}: LocationStepProps) => {
    const mapRef = useRef<MapRef>(null);
    const streetLabel = resolvedLocation?.street
        ?? resolvedLocation?.community.name
        ?? `${markerLocation.latitude.toFixed(4)}, ${markerLocation.longitude.toFixed(4)}`;

    return (
        <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 px-6">
            <div className="pt-4 mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Where is it?</h2>
                <p className="text-sm text-muted-foreground font-medium">Long press/drag to adjust the location pin.</p>
            </div>

            <div className="h-[400px] relative rounded-2xl overflow-hidden border border-border/40 shadow-inner">
                <Map
                    ref={mapRef}
                    initialViewState={{
                        latitude: markerLocation.latitude,
                        longitude: markerLocation.longitude,
                        zoom: 16
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/light-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    attributionControl={false}
                >
                    <Marker
                        latitude={markerLocation.latitude}
                        longitude={markerLocation.longitude}
                        draggable
                        onDragEnd={(e) => onLocationChange({ latitude: e.lngLat.lat, longitude: e.lngLat.lng })}
                        anchor="bottom"
                    >
                        <div className="relative flex flex-col items-center">
                            <div className="animate-bounce mb-1">
                                <img
                                    src="/assets/map-pin.png"
                                    alt="Pin"
                                    className="w-10 h-10 object-contain drop-shadow-xl scale-125 transition-transform"
                                />
                            </div>
                            <div className="w-1.5 h-1.5 bg-black/20 rounded-full mt-[-4px] blur-[1px]" />
                        </div>
                    </Marker>
                </Map>

                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <div className="bg-background/95 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-xl flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <HugeiconsIcon icon={MapsLocation01Icon} className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[12px] font-bold text-foreground truncate">
                                {isResolvingLocation ? "Resolving Lagos location..." : streetLabel}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {resolvedLocation
                                    ? `${resolvedLocation.community.name}, ${resolvedLocation.lga.name}`
                                    : `${markerLocation.latitude.toFixed(4)}, ${markerLocation.longitude.toFixed(4)}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {resolvedLocation?.weakMatch && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
                    <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-amber-900 leading-relaxed">
                        This pin is a weaker Lagos match, so double-check the location before continuing.
                    </p>
                </div>
            )}

            <ReportActions
                step={2}
                onBack={onBack}
                onNext={onNext}
                disabled={isResolvingLocation || !resolvedLocation}
            />
        </div>
    );
};
