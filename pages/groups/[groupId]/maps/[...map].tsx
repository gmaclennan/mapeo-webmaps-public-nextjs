import Dialog from '@/components/Dialog'
import { Container, LeftPanel } from '@/components/layout'
import { RightPanel } from '@/components/layout'
import { Camera, CircleLayer, Source } from '@/components/MapboxGL'
import ObservationList, {
  ListHeader,
  ListItem,
} from '@/components/ObservationList'
import getMetadata from '@/lib/getMetadata'
import getObservations, {
  Observation,
  ObservationWithImage,
} from '@/lib/getObservations'
import calcExtent from '@turf/bbox'
import { Feature, featureCollection as fc } from '@turf/helpers'
import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

interface Props {
  observations: Array<Observation>
  metadata: {
    title?: string
    description?: string
    terms?: string
  }
}

export interface ImagePreview {
  src: string
  aspectRatio: number
}

const points: mapboxgl.CircleLayer = {
  id: 'points',
  type: 'circle',
  source: 'features',
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
    'circle-opacity': 0.75,
    'circle-stroke-width': 1.5,
    'circle-stroke-color': '#ffffff',
    'circle-stroke-opacity': 0.9,
  },
}

// const pointsHover = {
//   id: 'points-hover',
//   type: 'circle',
//   source: 'features',
//   filter: ['==', '_id', ''],
//   paint: assign({}, points.paint, {
//     'circle-opacity': 1,
//     'circle-stroke-width': 2.5,
//     'circle-stroke-color': '#ffffff',
//     'circle-stroke-opacity': 1,
//   }),
// }

const MapboxGL = dynamic(() => import('@/components/MapboxGL'), { ssr: false })

const previewCache = new Map<string, ImagePreview>()

export default function MapPage({ observations = [], metadata = {} }: Props) {
  const router = useRouter()
  const {
    pathname,
    query: { groupId, map },
  } = router
  const [mapId, type, pointId, view] = Array.isArray(map) ? map : []

  const activeObservation = pointId
    ? observations.find((obs) => obs.properties._id === pointId)
    : undefined

  const extent = calcExtent(fc(observations as Feature[]))

  const renderListItem = React.useCallback(
    (index) => {
      const { title, date, image, _id } = observations[index]?.properties
      const map = [mapId, 'points', _id]
      // If already on page for point, link to details page
      if (_id === pointId) map.push('details')
      return (
        <Link
          href={{ pathname, query: { groupId, map } }}
          prefetch={false}
          shallow
          passHref
        >
          <ListItem
            {...{ title, date, image }}
            onImageLoad={({ currentTarget }) => {
              if (!(currentTarget instanceof window.Image)) return
              const { src, naturalWidth, naturalHeight } = currentTarget
              const aspectRatio = naturalHeight && naturalWidth / naturalHeight
              // Store the image preview (e.g. thumbnail) and its aspect ratio
              previewCache.set(_id, { src, aspectRatio })
            }}
          />
        </Link>
      )
    },
    [groupId, mapId, observations, pathname, pointId]
  )

  const isDialogOpen =
    view === 'details' && !!activeObservation && hasImage(activeObservation)

  return (
    <Container>
      <LeftPanel>
        <ObservationList
          itemCount={observations.length}
          header={<ListHeader {...metadata} />}
          renderItem={renderListItem}
        />
      </LeftPanel>
      <RightPanel>
        <MapboxGL>
          <Camera
            initialViewport={{ center: [0, 0], zoom: 0 }}
            viewport={
              activeObservation?.geometry
                ? {
                    center: activeObservation.geometry.coordinates as [
                      number,
                      number
                    ],
                    zoom: 12.5,
                  }
                : { bounds: extent }
            }
          />
          <Source id="features" data={fc(observations as Feature[])} />
          <CircleLayer style={points} />
        </MapboxGL>
      </RightPanel>
      <Dialog
        isOpen={isDialogOpen}
        onDismiss={() =>
          router.push({
            pathname,
            query: { groupId, map: [mapId, type, pointId] },
          })
        }
        observationProperties={
          isDialogOpen
            ? (activeObservation as ObservationWithImage)?.properties
            : undefined
        }
        imagePreview={previewCache.get(pointId)}
      />
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  { groupId: string; map: string[] }
> = async (context) => {
  const { groupId, map } = context.params || {}

  if (!groupId || !map) return { notFound: true }
  const [mapId, type, , view] = map
  if (type && type !== 'points') return { notFound: true }
  if (view && view !== 'details') return { notFound: true }

  // Fixtures for development
  if (
    process.env.NODE_ENV === 'development' &&
    groupId === 'TEST' &&
    mapId === 'TEST'
  ) {
    return {
      props: {
        observations: require('@/fixtures/observations.json'),
        metadata: require('@/fixtures/metadata.json'),
      },
    }
  }

  try {
    const observations = await getObservations(groupId, mapId)
    const metadata = await getMetadata(groupId, mapId)
    return { props: { observations, metadata } }
  } catch (e) {
    return { notFound: true }
  }
}

function hasImage(o: Observation): o is ObservationWithImage {
  return typeof o.properties.image === 'string'
}
