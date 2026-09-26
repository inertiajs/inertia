import { Link, setLayoutProps, useLayer } from '@inertiajs/react'

export default () => {
  const layer = useLayer()

  setLayoutProps({ layerChrome: 'layer' }, layer.id)

  return (
    <>
      <div>Account settings</div>
      <Link href="/layers/settings">Open settings again</Link>
    </>
  )
}
