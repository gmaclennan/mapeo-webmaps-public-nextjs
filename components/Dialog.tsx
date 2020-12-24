import { DialogContent, DialogOverlay } from '@reach/dialog'
import VisuallyHidden from '@reach/visually-hidden'
import { format } from 'date-fns'
import React from 'react'

interface Props {
  isOpen: boolean
  onDismiss: () => void
  title: string
  date: string
  image: string
  description?: string
}

export default function Dialog({
  isOpen,
  onDismiss,
  title,
  date,
  image,
  description = '',
}: Props) {
  const formattedDate =
    date && format(new Date(date.split('T')[0]), 'do MMM yyyy')
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
        <button
          className="absolute top-0 right-0 bg-black bg-opacity-30 text-3xl text-white px-3 pb-1"
          type="button"
          onClick={onDismiss}
        >
          <VisuallyHidden>Close</VisuallyHidden>
          <span aria-hidden>×</span>
        </button>
        <img
          src={image}
          className="max-w-screen max-h-full sm:max-w-screen-p-20 sm:max-h-screen-p-20 block"
        />
        <div className="sm:absolute bottom-0 left-0 bg-black sm:bg-opacity-50 sm:max-w-md text-white text-shadow-sm py-3 px-4">
          <h2 id="title" className="font-bold text-2xl">
            {title}
          </h2>
          <h3 className="font-bold text-lg text-gray-300 mb-2">
            {formattedDate}
          </h3>
          {description && <p className="leading-snug">{description}</p>}
        </div>
      </DialogContent>
    </DialogOverlay>
  )
}
