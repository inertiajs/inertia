import { useState } from 'react'

export default function Image({ id, url }: { id: number; url: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-gray-300" aria-hidden="true" />}

      <img
        src={url}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover transition duration-500 ease-out ${
          loaded ? 'blur-0 scale-100 opacity-100' : 'scale-105 opacity-0 blur-sm'
        }`}
        onLoad={() => setLoaded(true)}
      />

      <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-sm text-white">
        {id}
      </span>
    </div>
  )
}
