import { useEffect, useRef } from "react";
import Map, { MapRef, Marker } from "react-map-gl/mapbox";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert01Icon,
  MapsLocation01Icon,
} from "@hugeicons/core-free-icons";
import { ReportActions } from "./ReportActions";
import { ResolvedLocation } from "@/types/api";
import { LAGOS_CLOSE_ZOOM } from "@/lib/lagos";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface LocationStepProps {
  markerLocation: { latitude: number; longitude: number };
  resolvedLocation?: ResolvedLocation;
  isResolvingLocation: boolean;
  locationSource: "lagos" | "user";
  hasPromptedLocation: boolean;
  canRequestLocation: boolean;
  locationMessage: string | null;
  onRequestLocation: () => void;
  onDismissLocationPrompt: () => void;
  onLocationChange: (loc: { latitude: number; longitude: number }) => void;
  onBack: () => void;
  onNext: () => void;
}
export const LocationStep = ({
  markerLocation,
  resolvedLocation,
  isResolvingLocation,
  locationSource,
  hasPromptedLocation,
  canRequestLocation,
  locationMessage,
  onRequestLocation,
  onDismissLocationPrompt,
  onLocationChange,
  onBack,
  onNext,
}: LocationStepProps) => {
  const mapRef = useRef<MapRef>(null);
  const streetLabel =
    resolvedLocation?.street ??
    resolvedLocation?.community.name ??
    `${markerLocation.latitude.toFixed(4)}, ${markerLocation.longitude.toFixed(4)}`;

  useEffect(() => {
    mapRef.current?.flyTo({
      center: [markerLocation.longitude, markerLocation.latitude],
      zoom: locationSource === "user" ? 16 : LAGOS_CLOSE_ZOOM,
      duration: 900,
    });
  }, [locationSource, markerLocation.latitude, markerLocation.longitude]);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 flex flex-col px-6 duration-500">
      <div className="mb-4 pt-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Where is it?
        </h2>
        <p className="text-sm font-medium text-muted-foreground">
          Drag the pin if needed. We&apos;ll match it to the nearest Lagos community.
        </p>
      </div>

      {!hasPromptedLocation && canRequestLocation && (
        <div className="mb-4 rounded-2xl border border-border/50 bg-primary/5 p-4 shadow-sm">
          <p className="text-sm font-bold text-foreground">
            Start from your current location
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Allow location so the report pin opens near you. If you skip, we&apos;ll
            keep the map centered on Lagos and you can place the pin manually.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onRequestLocation}
              className="rounded-full bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white"
            >
              Use My Location
            </button>
            <button
              onClick={onDismissLocationPrompt}
              className="rounded-full border border-border/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground"
            >
              Not Now
            </button>
          </div>
        </div>
      )}

      {locationMessage && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <HugeiconsIcon
            icon={Alert01Icon}
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
          />
          <p className="text-xs font-medium leading-relaxed text-amber-900">
            {locationMessage}
          </p>
        </div>
      )}

      <div className="relative h-[400px] overflow-hidden rounded-2xl border border-border/40 shadow-inner">
        <Map
          ref={mapRef}
          initialViewState={{
            latitude: markerLocation.latitude,
            longitude: markerLocation.longitude,
            zoom: locationSource === "user" ? 16 : LAGOS_CLOSE_ZOOM,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
        >
          <Marker
            latitude={markerLocation.latitude}
            longitude={markerLocation.longitude}
            draggable
            onDragEnd={(event) =>
              onLocationChange({
                latitude: event.lngLat.lat,
                longitude: event.lngLat.lng,
              })
            }
            anchor="bottom"
          >
            <div className="relative flex flex-col items-center">
              <div className="mb-1 animate-bounce">
                <img
                  src="/assets/map-pin.png"
                  alt="Pin"
                  className="h-10 w-10 scale-125 object-contain drop-shadow-xl transition-transform"
                />
              </div>
              <div className="mt-[-4px] h-1.5 w-1.5 rounded-full bg-black/20 blur-[1px]" />
            </div>
          </Marker>

        </Map>

        <div className="pointer-events-none absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-background/95 p-3 shadow-xl backdrop-blur-md">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <HugeiconsIcon
                icon={MapsLocation01Icon}
                className="h-4 w-4 text-primary"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold text-foreground">
                {isResolvingLocation ? "Resolving Lagos location..." : streetLabel}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {resolvedLocation
                  ? `${resolvedLocation.community.name}, ${resolvedLocation.lga.name}`
                  : `${markerLocation.latitude.toFixed(4)}, ${markerLocation.longitude.toFixed(4)}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {resolvedLocation?.weakMatch && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <HugeiconsIcon
            icon={Alert01Icon}
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
          />
          <p className="text-xs font-medium leading-relaxed text-amber-900">
            This pin is a weaker Lagos match, so double-check the location before
            continuing.
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
