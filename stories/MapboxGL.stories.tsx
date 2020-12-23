// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import React from 'react'

import { Container } from '../components/layout'
import MapboxGL from '../components/MapboxGL'

export default {
  title: 'MapboxMap',
  component: MapboxGL,
} as Meta

export const MapboxMap = () => (
  <Container>
    <MapboxGL />
  </Container>
)
