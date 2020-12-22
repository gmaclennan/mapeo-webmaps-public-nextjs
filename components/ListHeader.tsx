interface Props {
  title?: string
  description?: string
  terms?: string
}

export function ListHeader({ title = 'My Map', description = '', terms = '' }) {
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
