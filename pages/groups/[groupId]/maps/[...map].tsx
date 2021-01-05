import Dialog from '@/components/Dialog'
import { Container, LeftPanel } from '@/components/layout'
import { RightPanel } from '@/components/layout'
import ObservationList, {
  ListHeader,
  ListItem,
} from '@/components/ObservationList'
import getMetadata from '@/lib/getMetadata'
import getObservations, {
  Observation,
  ObservationWithImage,
} from '@/lib/getObservations'
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

const previewCache = new Map<string, ImagePreview>()

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function MapPage({ observations = [], metadata = {} }: Props) {
  const router = useRouter()
  const {
    pathname,
    query: { groupId, map },
  } = router
  const [mapId, type, pointId, view] = Array.isArray(map) ? map : []

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

  const activeObservation = pointId
    ? observations.find((obs) => obs.properties._id === pointId)
    : undefined

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
        <MapView
          activeObservation={activeObservation}
          observations={observations}
        />
        <noscript>
          <div className="bg-red-400"></div>
        </noscript>
      </RightPanel>
      <Dialog
        isOpen={hasImage(activeObservation) && view === 'details'}
        onDismiss={() =>
          router.push({
            pathname,
            query: { groupId, map: [mapId, type, pointId] },
          })
        }
        activeObservation={
          hasImage(activeObservation) ? activeObservation : undefined
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

function hasImage(o?: Observation): o is ObservationWithImage {
  return !!o && typeof o.properties.image === 'string'
}
