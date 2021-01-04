/* eslint-disable no-var */
import 'mapbox-gl/dist/mapbox-gl.css'

import { BBox, FeatureCollection } from '@turf/helpers'
import mapboxgl from 'mapbox-gl'
import React from 'react'

interface Props {
  children?: React.ReactNode
}

mapboxgl.accessToken =
  'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

// We use undefined default context to identify a missing Provider
const MapContext = React.createContext<mapboxgl.Map | null | undefined>(
  undefined
)

export default function MapboxGL({ children }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [map, setMap] = React.useState<mapboxgl.Map | null>(null)

  React.useLayoutEffect(() => {
    if (!containerRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
    })
    setMap(map)

    return () => {
      map.remove()
      setMap(null)
    }
  }, [])

  return (
    <MapContext.Provider value={map}>
      <div ref={containerRef} key="map-mapbox" className="w-full h-full" />
      {children}
    </MapContext.Provider>
  )
}

type CameraProps =
  | {
      center: [number, number]
      zoom: number
    }
  | {
      bounds: BBox
    }

export function Camera(props: CameraProps) {
  const map = React.useContext(MapContext)
  let lon: number | undefined
  let lat: number | undefined
  let zoom: number | undefined
  let w: number | undefined
  let s: number | undefined
  let e: number | undefined
  let n: number | undefined

  if ('bounds' in props && Array.isArray(props.bounds)) {
    w = props.bounds[0]
    s = props.bounds[1]
    e = props.bounds[2]
    n = props.bounds[3]
  } else if ('center' in props && Array.isArray(props.center)) {
    lon = props.center[0]
    lat = props.center[1]
    zoom = props.zoom ?? 12.5
  }

  // This will run when the map instance is first created, so that the map
  // starts at center & zoom, but for changes to center and zoom, the next
  // useState with flyTo() will run
  React.useEffect(() => {
    if (!map) return
    if (isNum(lon) && isNum(lat) && isNum(zoom)) {
      map.setZoom(zoom)
      map.setCenter([lon, lat])
    } else if (isNum(w) && isNum(s) && isNum(e) && isNum(n)) {
      map.fitBounds([w, s, e, n], { duration: 0 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  React.useEffect(() => {
    if (!map) return
    if (isNum(lon) && isNum(lat) && isNum(zoom)) {
      map.flyTo({ center: [lon, lat], zoom })
    }
  }, [lon, lat, zoom, map])

  React.useEffect(() => {
    if (!map) return
    if (isNum(w) && isNum(s) && isNum(e) && isNum(n)) {
      map.fitBounds([w, s, e, n])
    }
  }, [w, s, e, n, map])

  return null
}

interface SourceProps {
  id: string
  data: FeatureCollection
}

export function Source({ id, data }: SourceProps) {
  const map = React.useContext(MapContext)

  React.useEffect(() => {
    if (!map) return
    const source = map.getSource(id) as mapboxgl.GeoJSONSource
    if (source) {
      source.setData(data as GeoJSON.FeatureCollection)
    } else {
      onStyleLoaded(map, () => {
        map.addSource(id, {
          type: 'geojson',
          data: data as GeoJSON.FeatureCollection,
        })
      })
    }
  }, [id, map, data])

  return null
}

interface LayerProps {
  style: mapboxgl.CircleLayer
}

export function CircleLayer({ style }: LayerProps) {
  const map = React.useContext(MapContext)

  React.useEffect(() => {
    if (!map) return
    const { id } = style
    onStyleLoaded(map, () => {
      map.addLayer(style)
    })
    return () => {
      map.removeLayer(id)
    }
  }, [style, map])

  return null
}

function isNum(value: unknown): value is number {
  return typeof value === 'number'
}

function onStyleLoaded(map: mapboxgl.Map, fn: () => void) {
  if (map.isStyleLoaded()) {
    process.nextTick(fn)
  } else {
    map.once('styledata', (e) => {
      console.log('styledata', e)
      fn()
    })
  }
}
