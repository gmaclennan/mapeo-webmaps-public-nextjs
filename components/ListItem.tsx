import format from 'date-fns/format'
import Image from 'next/image'

export function ListItem({ title, date, image }) {
  const formattedDate = format(new Date(date.split('T')[0]), 'do MMM yyyy')
  return (
    <button className="flex border-t border-gray-300 border-solid w-full text-left py-2.5 px-4">
      <div className="w-20 h-16 relative bg-pink-500 flex-0 mr-3 overflow-hidden">
        <Image width={80} height={64} src={image} priority />
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
