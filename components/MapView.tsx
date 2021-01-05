import { Observation } from '@/lib/getObservations'
import calcExtent from '@turf/bbox'
import { Feature, featureCollection as fc } from '@turf/helpers'
import React from 'react'

import * as MapboxGL from './MapboxGL'

interface Props {
  observations: Observation[]
  activeObservation?: Observation
}

const sourceId = 'features'

const pointsLayer: mapboxgl.CircleLayer = {
  id: 'points',
  type: 'circle',
  source: sourceId,
  paint: {
    // make circles larger as the user zooms from z12 to z22
    'circle-radius': {
      base: 1.5,
      stops: [
        [7, 5],
        [18, 25],
      ],
    },
    'circle-color': '#d95f02',
    'circle-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1,
      0.75,
    ],
    'circle-stroke-width': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      2.5,
      1.5,
    ],
    'circle-stroke-color': '#ffffff',
    'circle-stroke-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1,
      0.9,
    ],
  },
}

export default function Map({ activeObservation, observations }: Props) {
  const extent = calcExtent(fc(observations as Feature[]))
  return (
    <MapboxGL.Map>
      <MapboxGL.Camera
        initialViewport={{ center: [0, 0], zoom: 1 }}
        viewport={
          activeObservation?.geometry
            ? {
                center: activeObservation.geometry.coordinates as [
                  number,
                  number
                ],
                zoom: 12.5,
              }
            : { bounds: extent, options: { padding: 20 } }
        }
      />
      <MapboxGL.Source id={sourceId} data={fc(observations as Feature[])} />
      <MapboxGL.CircleLayer style={pointsLayer} />
      <MapboxGL.Interactive layerId={pointsLayer.id} sourceId={sourceId} />
    </MapboxGL.Map>
  )
}
