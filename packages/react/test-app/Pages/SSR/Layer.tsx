import { useRemember } from '@inertiajs/react'

export default function Layer() {
  const [remembered, setRemembered] = useRemember({ note: '' })

  return (
    <>
      <div data-testid="ssr-layer">SSR layer</div>
      <input
        value={remembered.note}
        onChange={(event) => setRemembered({ note: event.target.value })}
        data-testid="ssr-layer-note"
      />
    </>
  )
}
