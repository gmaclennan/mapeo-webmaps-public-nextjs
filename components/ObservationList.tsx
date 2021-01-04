import { Observation } from '@/lib/getObservations'
import format from 'date-fns/format'
import Image from 'next/image'
import React from 'react'
import { useVirtual } from 'react-virtual'

function estimateSize(index: number) {
  if (index === 0) return 200
  return 94
}

const isServer = typeof window === 'undefined'
// Max number of items to pre-render on the server
const SERVER_RENDER_NUM = 20

interface ListProps {
  itemCount: number
  header: React.ReactElement
  renderItem: (index: number) => React.ReactElement
}

export default function ObservationList({
  itemCount,
  header,
  renderItem,
}: ListProps) {
  const parentRef = React.useRef(null)

  const rowVirtualizer = useVirtual({
    size: itemCount + 1,
    parentRef,
    estimateSize,
    overscan: 6,
  })

  const virtualItems = isServer
    ? new Array(Math.min(SERVER_RENDER_NUM, itemCount) + 1)
        .fill(true)
        .map((_, index) => ({ index, start: 0, measureRef: undefined }))
    : rowVirtualizer.virtualItems

  return (
    <div ref={parentRef} className="flex-1 overflow-y-auto">
      <div
        style={{ height: isServer ? 'auto' : `${rowVirtualizer.totalSize}px` }}
        className="relative w-full"
      >
        {elemT(virtualItems).map((virtualRow) => {
          const transform = isServer
            ? undefined
            : `translateY(${virtualRow.start}px)`
          let className = 'w-full focus-within:z-10'
          if (!isServer) className += ' absolute top-0 left-0'
          return (
            <div
              key={virtualRow.index}
              ref={virtualRow.measureRef}
              className={className}
              style={{ transform }}
            >
              {virtualRow.index === 0
                ? header
                : renderItem(virtualRow.index - 1)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const IMAGE_SIZE = [96, 72]

interface ListHeaderProps {
  title?: string
  description?: string
  terms?: string
}

export function ListHeader({
  title = 'My Map',
  description = '',
  terms = '',
}: ListHeaderProps) {
  return (
    <header className="p-4 pt-3">
      <h1 className="text-xl xl:text-2xl font-bold mb-1">{title}</h1>
      {description && (
        <p className="text-sm xl:text-base leading-snug">
          {description}
          {terms && (
            <>
              {' '}
              <a href="#">Terms &amp; Limitations</a>.
            </>
          )}
        </p>
      )}
    </header>
  )
}

interface ListItemProps
  extends Pick<Observation['properties'], 'title' | 'date' | 'image'> {
  href?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  onImageLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

export function ListItem({
  title,
  date,
  image,
  href,
  onClick,
  onImageLoad,
}: ListItemProps) {
  const formattedDate = format(new Date(date.split('T')[0]), 'do MMM yyyy')
  return (
    <a
      onClick={onClick}
      href={href}
      className="flex border-t border-gray-300 border-solid w-full text-left py-2.5 px-4"
    >
      <div
        className="relative flex-0 mr-3 overflow-hidden"
        style={{ width: IMAGE_SIZE[0], height: IMAGE_SIZE[1] }}
      >
        {image && (
          <Image
            width={IMAGE_SIZE[0]}
            height={IMAGE_SIZE[1]}
            objectFit="cover"
            src={image}
            onLoad={onImageLoad}
            priority
          />
        )}
      </div>
      <div className="flex-1">
        <h2 className="font-bold leading-tight xl:text-lg xl:leading-snug mb-1 xl:mb-0">
          {title}
        </h2>
        <h3 className="text-gray-600 text-sm xl:text-base font-bold">
          {formattedDate}
        </h3>
      </div>
    </a>
  )
}

/** Type workaround for https://github.com/Microsoft/TypeScript/issues/7294#issuecomment-465794460 */
/** See https://github.com/microsoft/TypeScript/issues/30271#issuecomment-476278582 */
type ArrayElem<A> = A extends Array<infer Elem> ? Elem : never

export function elemT<T>(array: T): Array<ArrayElem<T>> {
  return array as any
}
