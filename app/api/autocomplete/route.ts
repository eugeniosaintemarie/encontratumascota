import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || ''
    if (!q) return NextResponse.json([], { status: 200 })

    const email = process.env.NOMINATIM_EMAIL || process.env.NEXT_PUBLIC_NOMINATIM_EMAIL || ''
    const emailParam = email ? `&email=${encodeURIComponent(email)}` : ''

    // Try Nominatim first
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=ar&q=${encodeURIComponent(q)}${emailParam}`
    try {
      const res = await fetch(nomUrl, { headers: { 'Accept-Language': 'es', 'User-Agent': 'encontratumascota/1.0 (https://example.com)' } })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const out = data.map((d: any) => ({
            id: d.place_id || `${d.osm_type}_${d.osm_id}`,
            description: d.display_name,
            lat: parseFloat(d.lat),
            lon: parseFloat(d.lon),
            provider: 'nominatim',
            raw: d,
          }))
          return NextResponse.json(out)
        }
      }
    } catch (e) {
      // ignore and fall through to photon
      console.error('Nominatim proxy error', e)
    }

    // Photon fallback
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=es`
      const pres = await fetch(photonUrl, { headers: { 'Accept-Language': 'es', 'User-Agent': 'encontratumascota/1.0 (https://example.com)' } })
      if (pres.ok) {
        const pdata = await pres.json()
        const feats = pdata.features || []
        const out = feats.map((f: any) => ({
          id: `photon_${f.properties.osm_id || f.properties.osm_key || f.properties.osm_type}`,
          description: [f.properties.name, f.properties.city, f.properties.state, f.properties.country].filter(Boolean).join(', '),
          lat: f.geometry?.coordinates?.[1],
          lon: f.geometry?.coordinates?.[0],
          provider: 'photon',
          raw: f,
        }))
        return NextResponse.json(out)
      }
    } catch (e) {
      console.error('Photon proxy error', e)
    }

    return NextResponse.json([], { status: 200 })
  } catch (err) {
    console.error('autocomplete route error', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
