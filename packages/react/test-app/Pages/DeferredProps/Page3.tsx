import { Deferred, usePage } from '@inertiajs/react'

const Alpha = () => {
  const { alpha } = usePage<{ alpha?: string }>().props

  return alpha
}

const Beta = () => {
  const { beta } = usePage<{ beta?: string }>().props

  return beta
}

export default () => {
  return (
    <>
      <Deferred data="alpha" fallback={<div>Loading alpha...</div>}>
        <Alpha />
      </Deferred>

      <Deferred data="beta" fallback={<div>Loading beta...</div>}>
        <Beta />
      </Deferred>
    </>
  )
}
