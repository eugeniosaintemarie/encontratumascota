import { NextRequest, NextResponse } from "next/server";

type VerifyResponse = {
  ok: boolean;
  provider?: "google" | "nominatim";
  place?: unknown;
  error?: string;
};

type VerifyBody = {
  placeId?: string;
  lat?: number;
  lng?: number;
};

type NominatimReverse = {
  display_name?: string;
  lat?: string;
  lon?: string;
};

type GoogleDetailsResponse = {
  status?: string;
  result?: {
    place_id?: string;
    formatted_address?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  };
};

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VerifyBody;
    const { placeId, lat, lng } = body || {};
    if (!placeId)
      return NextResponse.json(
        { ok: false, error: "missing placeId" } as VerifyResponse,
        { status: 400 },
      );

    // Nominatim IDs are returned by client as `nominatim:...`
    if (String(placeId).startsWith("nominatim:")) {
      // For public Nominatim we verify by reverse-geocoding the provided coords (if available)
      if (typeof lat !== "number" || typeof lng !== "number") {
        return NextResponse.json(
          {
            ok: false,
            error: "lat/lng required for nominatim validation",
          } as VerifyResponse,
          { status: 400 },
        );
      }
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}&zoom=18&addressdetails=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "es" } });
      if (!res.ok)
        return NextResponse.json(
          { ok: false, error: "nominatim error" } as VerifyResponse,
          { status: 502 },
        );
      const data = (await res.json()) as NominatimReverse;
      const verified = !!data && !!data.display_name;
      return NextResponse.json({
        ok: true,
        provider: "nominatim",
        place: {
          placeId,
          address: data.display_name,
          lat: parseFloat(String(data.lat ?? lat ?? 0)),
          lng: parseFloat(String(data.lon ?? lng ?? 0)),
          raw: data,
          verified,
        },
      } as VerifyResponse);
    }

    // Otherwise assume Google Place ID
    const key = process.env.GOOGLE_MAPS_SERVER_KEY;
    if (!key)
      return NextResponse.json(
        {
          ok: false,
          error: "server Google key not configured",
        } as VerifyResponse,
        { status: 500 },
      );
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(String(placeId))}&key=${encodeURIComponent(key)}&fields=place_id,formatted_address,geometry`;
    const res = await fetch(url);
    if (!res.ok)
      return NextResponse.json(
        { ok: false, error: "google api error" } as VerifyResponse,
        { status: 502 },
      );
    const data = (await res.json()) as GoogleDetailsResponse;
    if (data.status !== "OK")
      return NextResponse.json(
        { ok: false, error: data.status || "no details" } as VerifyResponse,
        { status: 400 },
      );
    const detail = data.result;
    if (!detail) {
      return NextResponse.json(
        { ok: false, error: "no details" } as VerifyResponse,
        { status: 400 },
      );
    }
    const address = detail.formatted_address;
    const plat = detail.geometry?.location?.lat;
    const plng = detail.geometry?.location?.lng;

    let verified = true;
    if (
      typeof lat === "number" &&
      typeof lng === "number" &&
      typeof plat === "number" &&
      typeof plng === "number"
    ) {
      const dist = haversineDistance(lat, lng, plat, plng);
      // if client coords differ by more than 1000m, mark unverified
      verified = dist <= 1000;
    }

    return NextResponse.json({
      ok: true,
      provider: "google",
      place: {
        placeId: detail.place_id,
        address,
        lat: plat,
        lng: plng,
        verified,
      },
    } as VerifyResponse);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: errorMessage } as VerifyResponse,
      { status: 500 },
    );
  }
}
