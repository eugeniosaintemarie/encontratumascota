import { NextRequest, NextResponse } from "next/server";

type NominatimPlace = {
  place_id?: string | number;
  osm_type?: string;
  osm_id?: string | number;
  display_name?: string;
  lat?: string | number;
  lon?: string | number;
};

type PhotonFeature = {
  properties?: {
    osm_id?: string | number;
    osm_key?: string;
    osm_type?: string;
    name?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry?: {
    coordinates?: number[];
  };
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    if (!q) return NextResponse.json([], { status: 200 });

    const email =
      process.env.NOMINATIM_EMAIL ||
      process.env.NEXT_PUBLIC_NOMINATIM_EMAIL ||
      "";
    const emailParam = email ? `&email=${encodeURIComponent(email)}` : "";

    // Try Nominatim first
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=ar&q=${encodeURIComponent(q)}${emailParam}`;
    try {
      const res = await fetch(nomUrl, {
        headers: {
          "Accept-Language": "es",
          "User-Agent": "encontratumascota/1.0 (https://example.com)",
        },
      });
      if (res.ok) {
        const data = (await res.json()) as unknown;
        if (Array.isArray(data) && data.length > 0) {
          const out = data.map((item) => {
            const d = item as NominatimPlace;
            return {
              id: d.place_id || `${d.osm_type}_${d.osm_id}`,
              description: d.display_name,
              lat: parseFloat(String(d.lat ?? "0")),
              lon: parseFloat(String(d.lon ?? "0")),
              provider: "nominatim",
              raw: d,
            };
          });
          return NextResponse.json(out);
        }
      }
    } catch (e) {
      // ignore and fall through to photon
      console.error("Nominatim proxy error", e);
    }

    // Photon fallback
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=es`;
      const pres = await fetch(photonUrl, {
        headers: {
          "Accept-Language": "es",
          "User-Agent": "encontratumascota/1.0 (https://example.com)",
        },
      });
      if (pres.ok) {
        const pdata = (await pres.json()) as {
          features?: PhotonFeature[];
        };
        const feats = pdata.features || [];
        const out = feats.map((f) => {
          const props = f.properties || {};
          const coordinates = f.geometry?.coordinates || [];
          return {
            id: `photon_${props.osm_id || props.osm_key || props.osm_type}`,
            description: [props.name, props.city, props.state, props.country]
              .filter(Boolean)
              .join(", "),
            lat: coordinates[1],
            lon: coordinates[0],
            provider: "photon",
            raw: f,
          };
        });
        return NextResponse.json(out);
      }
    } catch (e) {
      console.error("Photon proxy error", e);
    }

    return NextResponse.json([], { status: 200 });
  } catch (err) {
    console.error("autocomplete route error", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
