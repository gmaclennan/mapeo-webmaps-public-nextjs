/* eslint-disable no-var */
import 'mapbox-gl/dist/mapbox-gl.css'

import { BBox, FeatureCollection } from '@turf/helpers'
import mapboxgl from 'mapbox-gl'
import React from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'

interface Props {
  children?: React.ReactNode
}

mapboxgl.accessToken =
  'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

// We use undefined default context to identify a missing Provider
const MapContext = React.createContext<mapboxgl.Map | null | undefined>(
  undefined
)

export function Map({ children }: Props) {
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
      setMap(null)
      map.remove()
    }
  }, [])

  return (
    <MapContext.Provider value={map}>
      <div ref={containerRef} key="map-mapbox" className="w-full h-full" />
      {children}
    </MapContext.Provider>
  )
}

interface ViewportCentered {
  center: [number, number]
  zoom: number
}
interface ViewportBounded {
  bounds: BBox
  options?: mapboxgl.FitBoundsOptions
}
interface CameraProps {
  viewport: ViewportCentered | ViewportBounded
  initialViewport?: ViewportCentered | ViewportBounded
}

function isBoundedViewport(
  viewport: ViewportCentered | ViewportBounded
): viewport is ViewportBounded {
  return Array.isArray((viewport as ViewportBounded).bounds)
}

export function Camera({ viewport, initialViewport }: CameraProps) {
  const map = React.useContext(MapContext)

  // This will run when the map instance is first created, so that the map
  // starts at center & zoom, but for changes to center and zoom, the next
  // useState with flyTo() will run
  React.useEffect(() => {
    if (!map) return
    const initial = initialViewport || viewport
    if (isBoundedViewport(initial)) {
      map.fitBounds(initial.bounds as mapboxgl.LngLatBoundsLike, {
        ...initial.options,
        duration: 0,
      })
    } else {
      map.setZoom(initial.zoom)
      map.setCenter(initial.center)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  useDeepCompareEffect(() => {
    if (!map) return
    if (isBoundedViewport(viewport)) {
      map.fitBounds(
        viewport.bounds as mapboxgl.LngLatBoundsLike,
        viewport.options
      )
    } else {
      map.flyTo(viewport)
    }
  }, [map, viewport])

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
      try {
        map.removeLayer(id)
      } catch (e) {}
    }
  }, [style, map])

  return null
}

interface InteractiveProps {
  layerId: string
  sourceId: string
}

export function Interactive({ layerId, sourceId }: InteractiveProps) {
  const map = React.useContext(MapContext)
  const hovered = React.useRef<number | string>()

  React.useEffect(() => {
    if (!map) return

    function onMouseMove(e: mapboxgl.MapMouseEvent & mapboxgl.EventData) {
      if (!map || !e.features.length) return
      if (hovered.current != null) {
        map.setFeatureState(
          { source: sourceId, id: hovered.current },
          { hover: false }
        )
      }
      hovered.current = e.features[0].id
      map.getCanvas().style.cursor = 'pointer'
      map.setFeatureState(
        { source: sourceId, id: hovered.current },
        { hover: true }
      )
    }

    function onMouseLeave() {
      if (!map) return
      if (hovered.current != null) {
        map.setFeatureState(
          { source: sourceId, id: hovered.current },
          { hover: false }
        )
      }
      map.getCanvas().style.cursor = ''
      hovered.current = undefined
    }

    map.on('mousemove', layerId, onMouseMove)
    map.on('mouseleave', layerId, onMouseLeave)

    return () => {
      map && map.off('mousemove', onMouseMove)
      map && map.off('mouseleave', onMouseLeave)
    }
  }, [map, layerId, sourceId])
  return null
}

function onStyleLoaded(map: mapboxgl.Map, fn: () => void) {
  if (map.isStyleLoaded()) {
    process.nextTick(fn)
  } else {
    map.once('styledata', () => {
      fn()
    })
  }
}
