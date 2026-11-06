import { router, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'

const Reload = ({ file, tick }: { file: { url: string; pages: number }; tick: number }) => {
  const page = usePage<{ file: { url: string; pages: number } }>()
  const [effectCount, setEffectCount] = useState(0)
  const [storeEffectCount, setStoreEffectCount] = useState(0)

  useEffect(() => {
    setEffectCount((count) => count + 1)
  }, [file])

  useEffect(() => {
    setStoreEffectCount((count) => count + 1)
  }, [page.props.file])

  return (
    <div>
      <p id="file">File: {file.url}</p>
      <p id="tick">Tick: {tick}</p>
      <p id="flash">Flash: {JSON.stringify(page.flash)}</p>
      <p id="effect-count">Effect count: {effectCount}</p>
      <p id="store-effect-count">Store effect count: {storeEffectCount}</p>

      <button onClick={() => router.reload({ only: ['tick'], data: { tick: tick + 1 } })}>Reload tick only</button>
      <button onClick={() => router.reload({ data: { tick: tick + 1 } })}>Reload all props</button>
      <button onClick={() => router.flash({ message: 'Saved' })}>Set flash</button>
      <button onClick={() => router.reload({ data: { tick: tick + 1, file: 'other' } })}>Change file</button>
    </div>
  )
}

export default Reload
