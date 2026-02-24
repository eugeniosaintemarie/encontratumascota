"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type PlaceResult = {
  address: string
  lat?: number
  lng?: number
  placeId?: string
}

interface Props {
  value?: string
  placeholder?: string
  onChange?: (v: string) => void
  onSelect?: (place: PlaceResult) => void
  className?: string
  showDropdown?: boolean
}

function loadGoogleScript(key: string) {
  if (typeof window === "undefined") return Promise.reject()
  if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-google-maps]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject())
      return
    }
    const s = document.createElement('script')
    s.setAttribute('data-google-maps', '1')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject()
    document.head.appendChild(s)
  })
}

export default function LocationAutocomplete({ value, placeholder = '', onChange, onSelect, className, showDropdown = true }: Props) {
  const [query, setQuery] = useState(value || '')
  const [predictions, setPredictions] = useState<any[]>([])
  const svcRef = useRef<any | null>(null)
  const sourceRef = useRef<'google' | 'nominatim' | null>(null)
  const timerRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => setQuery(value || ''), [value])

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key) {
      sourceRef.current = 'nominatim'
      svcRef.current = null
      return
    }
    let mounted = true
    loadGoogleScript(key).then(() => {
      if (!mounted) return
      svcRef.current = new (window as any).google.maps.places.AutocompleteService()
      sourceRef.current = 'google'
    }).catch(() => {
      svcRef.current = null
      sourceRef.current = 'nominatim'
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!showDropdown) { setPredictions([]); return }
    if (timerRef.current) window.clearTimeout(timerRef.current)
    if (!query) { setPredictions([]); return }
    timerRef.current = window.setTimeout(async () => {
      const source = sourceRef.current
      if (source === 'google' && svcRef.current) {
        svcRef.current.getPlacePredictions({ input: query, componentRestrictions: { country: 'ar' }, types: ['geocode'] }, (preds: any[]) => {
          setPredictions((preds || []).map(p => ({
            id: p.place_id,
            description: p.description,
            raw: p,
            source: 'google'
          })))
        })
        return
      }

      // Nominatim fallback
      try {
        // First try local barrios dataset
        try {
          const localRes = await fetch(`/api/barrios/search?q=${encodeURIComponent(query)}`)
          if (localRes.ok) {
            const localData = await localRes.json()
            if (Array.isArray(localData) && localData.length > 0) {
              setPredictions(localData.map((d: any) => ({
                id: d.id,
                description: d.description,
                raw: d.raw,
                source: d.provider || 'local',
                lat: d.lat,
                lon: d.lon,
              })))
              return
            }
          }
        } catch (e) {
          console.error('Local barrios proxy failed', e)
        }

        // Fallback to external proxy
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`)
        if (!res.ok) {
          console.error('Autocomplete proxy error', res.status)
          setPredictions([])
          return
        }
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setPredictions(data.map((d: any) => ({
            id: d.id,
            description: d.description,
            raw: d.raw,
            source: d.provider || 'nominatim',
            lat: d.lat,
            lon: d.lon,
          })))
        } else {
          setPredictions([])
        }
      } catch (err) {
        console.error('Autocomplete fetch failed', err)
        setPredictions([])
      }
    }, 250)
  }, [query])

  const handleSelect = async (p: any) => {
    let address = p.description || ''
    let lat: number | undefined = p.lat
    let lng: number | undefined = p.lon
    let placeId = p.id

    if (p.source === 'google') {
      placeId = p.id
      const svc = new (window as any).google.maps.places.PlacesService(document.createElement('div'))
      svc.getDetails({ placeId }, (detail: any) => {
        const a = detail.formatted_address || p.description || ''
        const plat = detail.geometry?.location?.lat?.()
        const plng = detail.geometry?.location?.lng?.()
        setQuery(a)
        setPredictions([])
        onChange?.(a)
        onSelect?.({ address: a, lat: plat, lng: plng, placeId })
        // blur input to stabilize focus and avoid double-selection behaviour
        setTimeout(() => inputRef.current?.blur(), 0)
      })
      return
    }

    // Handle other providers (nominatim, photon, local)
    const raw = p.raw || {}
    // Nominatim
    if (p.source === 'nominatim') {
      address = raw.display_name || address || ''
      lat = lat ?? (raw.lat ? parseFloat(raw.lat) : undefined)
      lng = lng ?? (raw.lon ? parseFloat(raw.lon) : undefined)
      placeId = placeId || `nominatim:${raw.place_id || `${raw.osm_type}_${raw.osm_id}`}`
    }

    // Local dataset
    if (p.source === 'local') {
      // raw expected: { province, name, city, lat, lng }
      address = address || (raw.name ? `${raw.name}${raw.city ? ', ' + raw.city : ''}${raw.province ? ', ' + raw.province : ''}` : '')
      lat = lat ?? raw.lat
      // ensure correct precedence: use nullish coalescing then fallback to raw.lng
      lng = (lng ?? raw.lon) ?? raw.lng
    }

    // Photon
    if (p.source === 'photon') {
      // raw is feature
      address = address || (raw.properties ? [raw.properties.name, raw.properties.city, raw.properties.state, raw.properties.country].filter(Boolean).join(', ') : '')
      if (!lat && raw.geometry && raw.geometry.coordinates) {
        lng = lng ?? raw.geometry.coordinates[0]
        lat = lat ?? raw.geometry.coordinates[1]
      }
    }

    // Ensure address is string
    address = address || ''
    setQuery(address)
    setPredictions([])
    onChange?.(address)
    onSelect?.({ address, lat, lng, placeId })
    // blur input to stabilize focus and avoid double-selection behaviour
    setTimeout(() => inputRef.current?.blur(), 0)
  }

  return (
    <div className={cn('relative')}>
      <input
        ref={inputRef}
        className={cn(
          "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-white/10 px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 placeholder:text-white/70 !text-white",
          className,
        )}
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange?.(e.target.value) }}
        onFocus={() => { /* show predictions if any */ }}
      />
      {predictions.length > 0 && (
        <ul className="absolute z-40 mt-1 w-full rounded-md bg-popover shadow-md max-h-52 overflow-auto">
          {predictions.map(p => (
            <li key={`${p.source}-${p.id}`} className="p-2 hover:bg-muted cursor-pointer text-sm text-foreground" onMouseDown={(e)=>{ e.preventDefault(); handleSelect(p); }}>
              {p.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
