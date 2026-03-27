import { useEffect, useState } from "react";
import { LAGOS_CENTER } from "@/lib/lagos";

type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocationPermissionState =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "timeout"
  | "unavailable"
  | "error";

const STORAGE_KEY = "citypulse.citizen-location";

type StoredLocationState = {
  hasPrompted: boolean;
  permissionState: LocationPermissionState;
  coordinates?: Coordinates;
};

function readStoredLocationState(): StoredLocationState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredLocationState;
  } catch {
    return null;
  }
}

function writeStoredLocationState(value: StoredLocationState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function getLocationErrorMessage(state: LocationPermissionState) {
  switch (state) {
    case "denied":
      return "Location access was denied. You can still explore Lagos and place the pin manually.";
    case "timeout":
      return "Location took too long to load. We kept you on the Lagos map so you can continue.";
    case "unavailable":
      return "Your browser could not provide a location. You can continue with the Lagos map.";
    case "error":
      return "We could not get your location right now. You can continue with the Lagos map.";
    default:
      return null;
  }
}

export function useCitizenLocation() {
  const storedInit = readStoredLocationState();
  const [coordinates, setCoordinates] = useState<Coordinates>(
    storedInit?.coordinates ?? LAGOS_CENTER,
  );
  const [source, setSource] = useState<"lagos" | "user">(
    storedInit?.coordinates ? "user" : "lagos",
  );
  const [permissionState, setPermissionState] =
    useState<LocationPermissionState>(storedInit?.permissionState ?? "idle");
  const [hasPrompted, setHasPrompted] = useState(
    storedInit?.hasPrompted ?? false,
  );

  const persistState = (nextState: StoredLocationState) => {
    setHasPrompted(nextState.hasPrompted);
    setPermissionState(nextState.permissionState);
    if (nextState.coordinates) {
      setCoordinates(nextState.coordinates);
      setSource("user");
    } else {
      setCoordinates(LAGOS_CENTER);
      setSource("lagos");
    }
    writeStoredLocationState(nextState);
  };

  const requestLocation = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("geolocation" in navigator)) {
      persistState({
        hasPrompted: true,
        permissionState: "unavailable",
      });
      return;
    }

    setHasPrompted(true);
    setPermissionState("requesting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        persistState({
          hasPrompted: true,
          permissionState: "granted",
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        const nextState: LocationPermissionState =
          error.code === error.PERMISSION_DENIED
            ? "denied"
            : error.code === error.TIMEOUT
              ? "timeout"
              : error.code === error.POSITION_UNAVAILABLE
                ? "unavailable"
                : "error";

        persistState({
          hasPrompted: true,
          permissionState: nextState,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const dismissPrompt = () => {
    persistState({
      hasPrompted: true,
      permissionState: permissionState === "idle" ? "idle" : permissionState,
    });
  };

  return {
    coordinates,
    source,
    permissionState,
    hasPrompted,
    canRequestLocation:
      typeof window !== "undefined" && "geolocation" in navigator,
    requestLocation,
    dismissPrompt,
    fallbackCoordinates: LAGOS_CENTER,
    locationErrorMessage: getLocationErrorMessage(permissionState),
  };
}
