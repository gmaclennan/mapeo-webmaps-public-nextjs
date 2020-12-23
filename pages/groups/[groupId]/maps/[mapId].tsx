import { Container, LeftPanel } from '@/components/layout'
import { RightPanel } from '@/components/layout'
import List, { ListHeader, ListItem } from '@/components/List'
import getMetadata from '@/lib/getMetadata'
import getObservations from '@/lib/getObservations'
import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import React from 'react'

interface Props {
  observations: Array<any>
  metadata: {
    title?: string
    description?: string
    terms?: string
  }
}

const MapboxGL = dynamic(() => import('@/components/MapboxGL'), { ssr: false })

export default function MapPage({ observations = [], metadata = {} }: Props) {
  const renderListItem = React.useCallback(
    (index) => {
      const {
        properties: { title, date, image },
      } = observations[index]
      return <ListItem {...{ title, date, image }} />
    },
    [observations]
  )

  return (
    <Container>
      <LeftPanel>
        <List
          itemCount={observations.length}
          header={<ListHeader {...metadata} />}
          renderItem={renderListItem}
        />
      </LeftPanel>
      <RightPanel>
        <MapboxGL />
      </RightPanel>
    </Container>
  )
}

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
        observations: require('@/fixtures/observations.json'),
        metadata: require('@/fixtures/metadata.json'),
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
