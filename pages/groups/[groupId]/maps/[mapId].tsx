import { ListHeader } from 'components/ListHeader'
import { ListItem } from 'components/ListItem'
import getMetadata from 'lib/getMetadata'
import getObservations from 'lib/getObservations'
import { GetServerSideProps } from 'next'
import React from 'react'
import { useVirtual } from 'react-virtual'

interface Props {
  observations: Array<any>
  metadata: {
    title?: string
    description?: string
    terms?: string
  }
}

function estimateSize(index) {
  if (index === 0) return 200
  return 94
}

function Map({ observations = [], metadata = {} }: Props) {
  const parentRef = React.useRef()

  const rowVirtualizer = useVirtual({
    size: observations.length + 1,
    parentRef,
    estimateSize,
  })

  return (
    <div className="w-screen h-screen flex">
      <div
        ref={parentRef}
        className="hidden md:block w-80 xl:w-96 overflow-y-scroll"
      >
        <div
          style={{ height: `${rowVirtualizer.totalSize}px` }}
          className="relative w-full"
        >
          {rowVirtualizer.virtualItems.map((virtualRow) => {
            let listItem
            if (virtualRow.index === 0) {
              listItem = <ListHeader {...metadata} />
            } else {
              const {
                properties: { title, date, image },
              } = observations[Math.max(0, virtualRow.index - 1)]
              listItem = <ListItem {...{ title, date, image }} />
            }
            const transform = `translateY(${virtualRow.start}px)`
            return (
              <div
                key={virtualRow.index}
                ref={virtualRow.measureRef}
                className="top-0 left-0 w-full absolute"
                style={{ transform }}
              >
                {listItem}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Map

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    params: { groupId, mapId },
  } = context

  // Fixtures for development
  if (
    process.env.NODE_ENV === 'development' &&
    groupId === 'TEST' &&
    mapId === 'TEST'
  ) {
    return {
      props: {
        observations: require('fixtures/observations.json'),
        metadata: require('fixtures/metadata.json'),
      },
    }
  }

  try {
    const observations = await getObservations(
      groupId.toString(),
      mapId.toString()
    )
    const metadata = await getMetadata(groupId.toString(), mapId.toString())
    return { props: { observations, metadata } }
  } catch (e) {
    return { notFound: true }
  }
}
