"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type PlaceResult = {
  address: string;
  lat?: number;
  lng?: number;
  placeId?: string;
};

type PredictionSource = "google" | "nominatim" | "local" | "photon";

type PredictionItem = {
  id: string;
  description: string;
  raw: unknown;
  source: PredictionSource;
  lat?: number;
  lon?: number;
};

type GooglePrediction = {
  place_id: string;
  description: string;
};

type GoogleAutocompleteService = {
  getPlacePredictions: (
    request: {
      input: string;
      componentRestrictions?: { country: string };
      types?: string[];
    },
    callback: (predictions: GooglePrediction[] | null) => void,
  ) => void;
};

type GooglePlaceDetail = {
  formatted_address?: string;
  geometry?: {
    location?: {
      lat?: () => number;
      lng?: () => number;
    };
  };
};

type GooglePlacesService = {
  getDetails: (
    request: { placeId?: string },
    callback: (detail: GooglePlaceDetail | null) => void,
  ) => void;
};

type GooglePlacesApi = {
  AutocompleteService: new () => GoogleAutocompleteService;
  PlacesService: new (container: HTMLElement) => GooglePlacesService;
};

type GoogleMapsWindow = Window & {
  google?: {
    maps?: {
      places?: GooglePlacesApi;
    };
  };
};

type ApiPrediction = {
  id: string;
  description: string;
  raw?: unknown;
  provider?: string;
  lat?: number;
  lon?: number;
};

type NominatimRaw = {
  display_name?: string;
  lat?: string | number;
  lon?: string | number;
  place_id?: string | number;
  osm_type?: string;
  osm_id?: string | number;
};

type LocalRaw = {
  province?: string;
  name?: string;
  city?: string;
  lat?: number;
  lon?: number;
  lng?: number;
};

type PhotonRaw = {
  properties?: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry?: {
    coordinates?: number[];
  };
};

function getGooglePlacesApi(): GooglePlacesApi | null {
  if (typeof window === "undefined") return null;
  const googleWindow = window as GoogleMapsWindow;
  return googleWindow.google?.maps?.places ?? null;
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function normalizeSource(
  provider: string | undefined,
  fallback: PredictionSource,
): PredictionSource {
  if (
    provider === "google" ||
    provider === "nominatim" ||
    provider === "local" ||
    provider === "photon"
  ) {
    return provider;
  }
  return fallback;
}

interface Props {
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
  onSelect?: (place: PlaceResult) => void;
  className?: string;
  showDropdown?: boolean;
  onlySuggested?: boolean;
}

function loadGoogleScript(key: string) {
  if (typeof window === "undefined") return Promise.reject();
  if (getGooglePlacesApi()) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-google-maps]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject());
      return;
    }
    const s = document.createElement("script");
    s.setAttribute("data-google-maps", "1");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });
}

export default function LocationAutocomplete({
  value,
  placeholder = "",
  onChange,
  onSelect,
  className,
  showDropdown = true,
  onlySuggested = false,
}: Props) {
  const hintId = useId();
  const [query, setQuery] = useState(value || "");
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const svcRef = useRef<GoogleAutocompleteService | null>(null);
  const sourceRef = useRef<"google" | "nominatim" | null>(null);
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const committedValueRef = useRef(value || "");

  const normalizedQuery = query.trim().toLowerCase();
  const normalizedValue = (value || "").trim().toLowerCase();
  const showOnlySuggestedHint =
    onlySuggested &&
    normalizedQuery.length > 0 &&
    normalizedQuery !== normalizedValue;

  useEffect(() => {
    const nextValue = value || "";
    committedValueRef.current = nextValue;
    setQuery(nextValue);
  }, [value]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      sourceRef.current = "nominatim";
      svcRef.current = null;
      return;
    }
    let mounted = true;
    loadGoogleScript(key)
      .then(() => {
        if (!mounted) return;
        const placesApi = getGooglePlacesApi();
        if (!placesApi) {
          sourceRef.current = "nominatim";
          svcRef.current = null;
          return;
        }
        svcRef.current = new placesApi.AutocompleteService();
        sourceRef.current = "google";
      })
      .catch(() => {
        svcRef.current = null;
        sourceRef.current = "nominatim";
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!showDropdown) {
      setPredictions([]);
      return;
    }
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (!query) {
      setPredictions([]);
      return;
    }
    timerRef.current = window.setTimeout(async () => {
      const source = sourceRef.current;
      if (source === "google" && svcRef.current) {
        svcRef.current.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: "ar" },
            types: ["geocode"],
          },
          (preds: GooglePrediction[] | null) => {
            setPredictions(
              (preds || []).map((p) => ({
                id: p.place_id,
                description: p.description,
                raw: p,
                source: "google",
              })),
            );
          },
        );
        return;
      }

      // Nominatim fallback
      try {
        // First try local barrios dataset
        try {
          const localRes = await fetch(
            `/api/barrios/search?q=${encodeURIComponent(query)}`,
          );
          if (localRes.ok) {
            const localData = await localRes.json();
            if (Array.isArray(localData) && localData.length > 0) {
              const items = localData as ApiPrediction[];
              setPredictions(
                items.map((d) => ({
                  id: d.id,
                  description: d.description,
                  raw: d.raw,
                  source: normalizeSource(d.provider, "local"),
                  lat: d.lat,
                  lon: d.lon,
                })),
              );
              return;
            }
          }
        } catch (e) {
          console.error("Local barrios proxy failed", e);
        }

        // Fallback to external proxy
        const res = await fetch(
          `/api/autocomplete?q=${encodeURIComponent(query)}`,
        );
        if (!res.ok) {
          console.error("Autocomplete proxy error", res.status);
          setPredictions([]);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const items = data as ApiPrediction[];
          setPredictions(
            items.map((d) => ({
              id: d.id,
              description: d.description,
              raw: d.raw,
              source: normalizeSource(d.provider, "nominatim"),
              lat: d.lat,
              lon: d.lon,
            })),
          );
        } else {
          setPredictions([]);
        }
      } catch (err) {
        console.error("Autocomplete fetch failed", err);
        setPredictions([]);
      }
    }, 250);
  }, [query]);

  const handleSelect = async (p: PredictionItem) => {
    let address = p.description || "";
    let lat: number | undefined = p.lat;
    let lng: number | undefined = p.lon;
    let placeId = p.id;

    if (p.source === "google") {
      placeId = p.id;
      const placesApi = getGooglePlacesApi();
      if (!placesApi) return;
      const svc = new placesApi.PlacesService(document.createElement("div"));
      svc.getDetails({ placeId }, (detail: GooglePlaceDetail | null) => {
        const a = detail?.formatted_address || p.description || "";
        const plat = detail?.geometry?.location?.lat?.();
        const plng = detail?.geometry?.location?.lng?.();
        committedValueRef.current = a;
        setQuery(a);
        setPredictions([]);
        onChange?.(a);
        onSelect?.({ address: a, lat: plat, lng: plng, placeId });
        // blur input to stabilize focus and avoid double-selection behaviour
        setTimeout(() => inputRef.current?.blur(), 0);
      });
      return;
    }

    // Handle other providers (nominatim, photon, local)
    const raw = p.raw ?? {};
    // Nominatim
    if (p.source === "nominatim") {
      const nominatimRaw = raw as NominatimRaw;
      address = nominatimRaw.display_name || address || "";
      lat = lat ?? parseNumber(nominatimRaw.lat);
      lng = lng ?? parseNumber(nominatimRaw.lon);
      placeId =
        placeId ||
        `nominatim:${nominatimRaw.place_id || `${nominatimRaw.osm_type}_${nominatimRaw.osm_id}`}`;
    }

    // Local dataset
    if (p.source === "local") {
      // raw expected: { province, name, city, lat, lng }
      const localRaw = raw as LocalRaw;
      address =
        address ||
        (localRaw.name
          ? `${localRaw.name}${localRaw.city ? ", " + localRaw.city : ""}${localRaw.province ? ", " + localRaw.province : ""}`
          : "");
      lat = lat ?? localRaw.lat;
      // ensure correct precedence: use nullish coalescing then fallback to raw.lng
      lng = lng ?? localRaw.lon ?? localRaw.lng;
    }

    // Photon
    if (p.source === "photon") {
      // raw is feature
      const photonRaw = raw as PhotonRaw;
      address =
        address ||
        (photonRaw.properties
          ? [
              photonRaw.properties.name,
              photonRaw.properties.city,
              photonRaw.properties.state,
              photonRaw.properties.country,
            ]
              .filter(Boolean)
              .join(", ")
          : "");
      if (!lat && photonRaw.geometry?.coordinates) {
        lng = lng ?? photonRaw.geometry.coordinates[0];
        lat = lat ?? photonRaw.geometry.coordinates[1];
      }
    }

    // Ensure address is string
    address = address || "";
    committedValueRef.current = address;
    setQuery(address);
    setPredictions([]);
    onChange?.(address);
    onSelect?.({ address, lat, lng, placeId });
    // blur input to stabilize focus and avoid double-selection behaviour
    setTimeout(() => inputRef.current?.blur(), 0);
  };

  return (
    <div className={cn("relative")}>
      <input
        ref={inputRef}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        placeholder={placeholder}
        value={query}
        aria-describedby={showOnlySuggestedHint ? hintId : undefined}
        onChange={(e) => {
          const nextValue = e.target.value;
          setQuery(nextValue);
          if (!onlySuggested) {
            onChange?.(nextValue);
          }
        }}
        onBlur={() => {
          if (onlySuggested) {
            setQuery(committedValueRef.current);
          }
        }}
        onKeyDown={(e) => {
          if (onlySuggested && e.key === "Enter") {
            e.preventDefault();
          }
        }}
        onFocus={() => {
          /* show predictions if any */
        }}
      />
      {predictions.length > 0 && (
        <ul className="absolute z-[200] mt-1 w-full rounded-md bg-popover shadow-md max-h-52 overflow-auto">
          {predictions.map((p) => (
            <li
              key={`${p.source}-${p.id}`}
              className="p-2 hover:bg-muted cursor-pointer text-sm text-foreground"
              onPointerDown={(e) => {
                e.preventDefault();
                handleSelect(p);
              }}
            >
              {p.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
