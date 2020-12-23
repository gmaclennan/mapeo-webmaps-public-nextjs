import format from 'date-fns/format'
import Image from 'next/image'

const IMAGE_SIZE = [96, 72]

export function ListItem({ title, date, image }) {
  const formattedDate = format(new Date(date.split('T')[0]), 'do MMM yyyy')
  return (
    <button className="flex border-t border-gray-300 border-solid w-full text-left py-2.5 px-4">
      <div
        className="relative flex-0 mr-3 overflow-hidden"
        style={{ width: IMAGE_SIZE[0], height: IMAGE_SIZE[1] }}
      >
        <Image
          width={IMAGE_SIZE[0]}
          height={IMAGE_SIZE[1]}
          objectFit="cover"
          src={image}
          priority
        />
      </div>
      <div className="flex-1">
        <h2 className="font-bold leading-tight xl:text-lg xl:leading-snug mb-1 xl:mb-0">
          {title}
        </h2>
        <h3 className="text-gray-600 text-sm xl:text-base font-bold">
          {formattedDate}
        </h3>
      </div>
    </button>
  )
}
