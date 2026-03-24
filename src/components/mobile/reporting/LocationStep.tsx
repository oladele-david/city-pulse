import { useState, useEffect, useRef } from 'react';
import Map, { Marker, MapRef } from 'react-map-gl/mapbox';
import { HugeiconsIcon } from "@hugeicons/react";
import { MapsLocation01Icon } from "@hugeicons/core-free-icons";
import { ReportActions } from "./ReportActions";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface LocationStepProps {
    markerLocation: { latitude: number; longitude: number };
    onLocationChange: (loc: { latitude: number; longitude: number }) => void;
    onBack: () => void;
    onNext: () => void;
}

export const LocationStep = ({
    markerLocation,
    onLocationChange,
    onBack,
    onNext
}: LocationStepProps) => {
    const mapRef = useRef<MapRef>(null);
    const [streetName, setStreetName] = useState<string>("Fetching location...");

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${markerLocation.longitude},${markerLocation.latitude}.json?access_token=${MAPBOX_TOKEN}&types=address,poi&language=en`
                );
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                    setStreetName(data.features[0].place_name.split(',')[0]);
                } else {
                    setStreetName(`${markerLocation.latitude.toFixed(4)}, ${markerLocation.longitude.toFixed(4)}`);
                }
            } catch (error) {
                console.error("Error fetching address:", error);
                setStreetName(`${markerLocation.latitude.toFixed(4)}, ${markerLocation.longitude.toFixed(4)}`);
            }
        };

        fetchAddress();
    }, [markerLocation.latitude, markerLocation.longitude]);

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
                                {streetName}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {markerLocation.latitude.toFixed(4)}, {markerLocation.longitude.toFixed(4)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <ReportActions
                step={2}
                onBack={onBack}
                onNext={onNext}
                disabled={streetName === "Fetching location..."}
            />
        </div>
    );
};
