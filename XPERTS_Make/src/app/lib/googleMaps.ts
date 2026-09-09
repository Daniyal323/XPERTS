/**
 * Loads the Google Maps JS API exactly once and resolves when ready.
 * Returns `null` if no API key is configured so callers can degrade to a
 * list-only view instead of rendering a broken map.
 *
 * Typed loosely as `any` to avoid pulling in the heavy @types/google.maps
 * package — the map surface we use (Map, Marker, InfoWindow) is small.
 */
type GoogleMaps = any; // eslint-disable-line @typescript-eslint/no-explicit-any

declare global {
  interface Window {
    google?: { maps: GoogleMaps };
  }
}

let loader: Promise<GoogleMaps | null> | null = null;

export function loadGoogleMaps(): Promise<GoogleMaps | null> {
  if (loader) return loader;

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) {
    loader = Promise.resolve(null);
    return loader;
  }

  loader = new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google?.maps) {
      resolve(window.google.maps);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google?.maps ?? null);
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return loader;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

/**
 * Converts a free-text place label (e.g. "München, DE") into coordinates so the
 * expert map can plot it. Resolves to `null` when Maps isn't configured, the
 * label is empty, or the address can't be resolved — callers should keep the
 * text label regardless and treat coordinates as best-effort enrichment.
 */
export async function geocodeLocation(label: string): Promise<GeocodeResult | null> {
  const trimmed = label.trim();
  if (!trimmed) return null;
  const maps = await loadGoogleMaps();
  if (!maps) return null;
  try {
    const geocoder = new maps.Geocoder();
    const { results } = await geocoder.geocode({ address: trimmed });
    const top = results?.[0];
    if (!top) return null;
    const loc = top.geometry.location;
    const component = (type: string): string | undefined =>
      top.address_components?.find((c: { types: string[]; long_name: string }) =>
        c.types.includes(type),
      )?.long_name;
    return {
      lat: typeof loc.lat === "function" ? loc.lat() : loc.lat,
      lng: typeof loc.lng === "function" ? loc.lng() : loc.lng,
      city: component("locality") ?? component("administrative_area_level_1"),
      country: component("country"),
    };
  } catch {
    return null;
  }
}
