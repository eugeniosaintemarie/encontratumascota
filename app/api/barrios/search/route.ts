import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    if (!q) return NextResponse.json([], { status: 200 });

    const file = path.join(process.cwd(), "data", "argentina-barrios.json");
    if (!fs.existsSync(file)) return NextResponse.json([], { status: 200 });
    const raw = fs.readFileSync(file, "utf-8");
    const data = JSON.parse(raw);

    const needle = q.toLowerCase();
    const results: any[] = [];
    for (const prov of data.provinces || []) {
      for (const b of prov.barrios || []) {
        const label = `${b.name}, ${b.city || prov.name}`;
        if (label.toLowerCase().includes(needle)) {
          results.push({
            id: `local_${prov.code || prov.name}_${b.name}`,
            description: label,
            lat: b.lat,
            lon: b.lng,
            provider: "local",
            raw: { province: prov.name, ...b },
          });
        }
      }
    }

    return NextResponse.json(results.slice(0, 10));
  } catch (err) {
    console.error("barrios search error", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
