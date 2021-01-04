// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import React from 'react'

import DialogComponent from '../components/Dialog'

export default {
  title: 'Dialog',
  component: DialogComponent,
} as Meta

function noop() {
  // do nothing
}

export const Dialog = () => <DialogComponent isOpen onDismiss={noop} />
