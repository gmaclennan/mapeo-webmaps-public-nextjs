// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0'
import React from 'react'

import { Container } from '../components/layout'
import * as MapboxGL from '../components/MapboxGL'

export default {
  title: 'Mapbox Map',
  component: MapboxGL.Map,
} as Meta

export const MapboxMap = () => (
  <Container>
    <MapboxGL.Map />
  </Container>
)
