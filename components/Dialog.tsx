import { ObservationWithImage } from '@/lib/getObservations'
import { DialogContent, DialogOverlay } from '@reach/dialog'
import VisuallyHidden from '@reach/visually-hidden'
import { format } from 'date-fns'
import React from 'react'

import { ImagePreview } from '../pages/groups/[groupId]/maps/[...map]'

interface Props {
  isOpen: boolean
  onDismiss: () => void
  observationProperties?: ObservationWithImage['properties']
  imagePreview?: ImagePreview
}

export default function Dialog({
  isOpen,
  onDismiss,
  observationProperties,
  imagePreview,
}: Props) {
  let content = null
  if (observationProperties) {
    const { title, date, image, description } = observationProperties || {}
    const formattedDate =
      date && format(new Date(date.split('T')[0]), 'do MMM yyyy')
    let imgContainerStyle
    let imgStyle
    if (imagePreview) {
      // Use the image preview to size the dialog to fill the screen, and show
      // the low-res preview whilst the higher-res image loads
      const { src, aspectRatio } = imagePreview
      const { innerWidth: vw, innerHeight: vh } = window
      const vr = vw / vh
      imgContainerStyle = {
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
      }
      imgStyle = {
        width:
          vr <= aspectRatio
            ? 'calc(100vw - 5rem)'
            : `calc((100vh - 5rem) * ${aspectRatio})`,
        height:
          vr <= aspectRatio
            ? `calc((100vw - 5rem) / ${aspectRatio})`
            : 'calc(100vh - 5rem)',
      }
    }
    content = (
      <>
        <button
          className="absolute top-0 right-0 bg-black bg-opacity-30 text-3xl text-white px-3 pb-1"
          type="button"
          onClick={onDismiss}
        >
          <VisuallyHidden>Close</VisuallyHidden>
          <span aria-hidden>×</span>
        </button>
        <div style={imgContainerStyle}>
          <img
            src={image}
            style={imgStyle}
            className="max-w-screen max-h-full sm:max-w-screen-p-20 sm:max-h-screen-p-20 block"
          />
        </div>
        <div className="sm:absolute bottom-0 left-0 bg-black sm:bg-opacity-50 sm:max-w-md text-white text-shadow-sm py-3 px-4">
          <h2 id="title" className="font-bold text-2xl">
            {title}
          </h2>
          <h3 className="font-bold text-lg text-gray-300 mb-2">
            {formattedDate}
          </h3>
          {description && <p className="leading-snug">{description}</p>}
        </div>
      </>
    )
  }

  return (
    <DialogOverlay
      className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 flex items-center justify-center z-20"
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <DialogContent
        className="relative shadow-lg min-w-screen-1/2 min-h-screen-1/2 bg-black bg-opacity-50"
        aria-labelledby="title"
      >
        {content}
      </DialogContent>
    </DialogOverlay>
  )
}
