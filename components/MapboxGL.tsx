import 'mapbox-gl/dist/mapbox-gl.css'

import mapboxgl from 'mapbox-gl'
import React from 'react'

mapboxgl.accessToken =
  'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

export default function MapboxGL() {
  const containerRef = React.useRef<HTMLDivElement>()
  const mapRef = React.useRef<mapboxgl.Map>()

  React.useLayoutEffect(() => {
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 9,
    })
    mapRef.current = map

    return () => map.remove()
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
