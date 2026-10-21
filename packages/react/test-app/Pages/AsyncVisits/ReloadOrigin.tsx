import { Link, router } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [reloadStatus, setReloadStatus] = useState('idle')

  const visitPage2AndReload = () => {
    router.visit('/async-visits/reload-origin?page=2', { preserveState: true })

    router.reload({
      headers: { 'X-Repro-Delay': '1' },
      onFinish: () => setReloadStatus('finished'),
    })
  }

  return (
    <>
      <div>Page: Reload Origin</div>

      <button onClick={() => router.reload({ headers: { 'X-Repro-Delay': '1' } })}>Reload</button>
      <button onClick={visitPage2AndReload}>Visit page 2 and reload</button>
      <Link href="/async-visits/page-c">Go to C</Link>

      <div>Reload: {reloadStatus}</div>
    </>
  )
}
