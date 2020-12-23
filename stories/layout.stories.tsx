// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import React from 'react'

import { Container, LeftPanel, RightPanel } from '../components/layout'

export default {
  title: 'Layout',
  component: Container,
} as Meta

export const Layout = () => (
  <Container>
    <LeftPanel className="bg-blue-300" />
    <RightPanel className="bg-yellow-300" />
  </Container>
)
