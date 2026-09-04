import { Layer, useLayer, usePage } from '@inertiajs/react'
import { ReactNode } from 'react'

export default function LayerWrapper({
  open,
  index,
  isTop,
  type,
  close,
  done,
  children,
}: {
  open: boolean
  index: number
  isTop: boolean
  type: 'routed' | 'local'
  close: () => void
  done: () => void
  children?: ReactNode
}) {
  const page = usePage()
  const layer = useLayer()

  return (
    <Layer
      open={open}
      index={index}
      isTop={isTop}
      type={type}
      close={close}
      done={done}
      label={layer.id ? page.component : 'unresolved'}
    >
      {children}
    </Layer>
  )
}
