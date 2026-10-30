import { Link, router } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [reloadStatus, setReloadStatus] = useState('idle')

  const visitPage2AndReload = () => {
    router.visit('/async-visits/reload-origin?page=2', { preserveState: true })

    router.reload({
      headers: { 'X-Repro-Delay': '1' },
      onFinish: (visit) => setReloadStatus(visit.cancelled ? 'cancelled' : 'finished'),
    })
  }

  const visitRedirectAndReload = () => {
    router.visit('/async-visits/reload-origin/redirect', { preserveState: true })

    // Browsers hold back an identical GET while one is in flight, so the reload gets its own URL
    router.reload({
      data: { slow: 1 },
      preserveUrl: true,
      headers: { 'X-Repro-Delay': '1' },
      onFinish: (visit) => setReloadStatus(visit.cancelled ? 'cancelled' : 'finished'),
    })
  }

  const postAndReload = () => {
    router.post('/async-visits/reload-origin/like', {}, { preserveState: true })

    // Browsers hold back an identical GET while one is in flight, so the reload gets its own URL
    router.reload({
      data: { slow: 1 },
      preserveUrl: true,
      headers: { 'X-Repro-Delay': '1' },
      onFinish: (visit) => setReloadStatus(visit.cancelled ? 'cancelled' : 'finished'),
    })
  }

  const postToThisPageAndReload = () => {
    router.post('/async-visits/reload-origin')

    router.reload({ headers: { 'X-Repro-Delay': '1' } })
  }

  const reloadAndReplaceQuery = () => {
    router.reload({
      headers: { 'X-Repro-Delay': '1' },
      onFinish: (visit) => setReloadStatus(visit.cancelled ? 'cancelled' : 'finished'),
    })

    router.replace({ url: '/async-visits/reload-origin?page=2', preserveState: true })
  }

  const visitPage3AsyncAndReplaceQuery = () => {
    router.visit('/async-visits/reload-origin?page=3', {
      async: true,
      preserveState: true,
      headers: { 'X-Repro-Delay': '1' },
    })

    router.replace({ url: '/async-visits/reload-origin?page=2', preserveState: true })
  }

  const reloadAndPostAsync = () => {
    router.reload({
      headers: { 'X-Repro-Delay': '1' },
      onFinish: (visit) => setReloadStatus(visit.cancelled ? 'cancelled' : 'finished'),
    })

    router.post('/async-visits/reload-origin/like', {}, { async: true, preserveState: true })
  }

  return (
    <>
      <div>Page: Reload Origin</div>

      <button onClick={() => router.reload({ headers: { 'X-Repro-Delay': '1' } })}>Reload</button>
      <button onClick={visitPage2AndReload}>Visit page 2 and reload</button>
      <button onClick={reloadAndPostAsync}>Reload and post async</button>
      <button onClick={visitRedirectAndReload}>Visit redirect and reload</button>
      <button onClick={postAndReload}>Post and reload</button>
      <button onClick={postToThisPageAndReload}>Post to this page and reload</button>
      <button onClick={reloadAndReplaceQuery}>Reload and replace query</button>
      <button onClick={visitPage3AsyncAndReplaceQuery}>Visit page 3 async and replace query</button>
      <Link href="/async-visits/page-c">Go to C</Link>

      <div>Reload: {reloadStatus}</div>
    </>
  )
}
