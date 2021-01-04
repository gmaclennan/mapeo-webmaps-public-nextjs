import 'mapbox-gl/dist/mapbox-gl.css'

import mapboxgl from 'mapbox-gl'
import React from 'react'

import { Observation } from '../pages/groups/[groupId]/maps/[...map]'

mapboxgl.accessToken =
  'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'
const FLY_TO_ZOOM = 12.5

interface Props {
  mapRef: React.MutableRefObject<mapboxgl.Map | undefined>
  activeObservation?: Observation
}

export default function MapboxGL({ mapRef, activeObservation }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    if (!containerRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 9,
    })
    mapRef.current = map

    return () => map.remove()
  }, [mapRef])

  React.useEffect(() => {
    if (!activeObservation?.geometry?.coordinates) return
    if (!mapRef.current) return
    mapRef.current.flyTo({
      center: activeObservation.geometry.coordinates as [number, number],
      zoom: FLY_TO_ZOOM,
    })
  }, [activeObservation, mapRef])

  return <div ref={containerRef} className="w-full h-full" />
}
