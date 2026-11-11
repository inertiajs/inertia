import { Link, router, setLayoutProps, usePage, useRemember } from '@inertiajs/react'
import { useState } from 'react'

export default ({ likes }: { likes: number }) => {
  const page = usePage()
  const { errors } = page.props as { errors?: { name?: string } }
  const [visitEvents, setVisitEvents] = useState<string[]>([])
  const [childEvents, setChildEvents] = useState('')
  const [cancelledEvent, setCancelledEvent] = useState('')
  const [remembered, setRemembered] = useRemember({ note: '' })

  const record = (event: string) => setVisitEvents((events) => [...events, event])

  const pushPanel = () => {
    router.push({
      url: '/layers/panel/client',
      component: 'Layers/Panel',
      props: { name: 'from a client visit' },
    })
  }

  const openPanelWithCallbacks = () => {
    router.visit('/layers/panel/first', {
      onFlash: () => record('flash'),
      onError: () => record('error'),
      onSuccess: () => record('success'),
    })
  }

  const openPanelWithViewTransition = () => {
    router.visit('/layers/panel/first', { viewTransition: true })
  }

  const like = () => {
    router.optimistic<{ likes: number }>((props) => ({ likes: props.likes + 1 })).post('/layers/like')
  }

  const refresh = () => {
    router.reload()
  }

  const openPanelWithoutMovingTheAddress = () => {
    router.visit('/layers/counted/panel', { preserveUrl: true })
  }

  const partialReload = () => {
    router.reload({ only: ['likes'] })
  }

  const openHandledPanel = () => {
    const handle = router.layer('/layers/panel/first')
    handle.on('saved', (user) => setChildEvents(`saved ${(user as { id?: number })?.id}`))
  }

  const openCancelledPanel = () => {
    const handle = router.layer('/layers/panel/delayed?delay=600')
    handle.onClose(() => setCancelledEvent('closed'))
  }

  const openLocalLayer = () => {
    router.layer({ component: 'Layers/Local', props: { note: 'local' } })
  }

  const setBaseChrome = () => {
    setLayoutProps({ baseChrome: 'base' })
  }

  return (
    <>
      <div>Base page</div>

      {/* Tall enough that the page beneath a layer has a scroll position worth keeping. */}
      <div id="spacer" style={{ height: 1000 }} />

      {errors?.name && <p id="page-error">{errors.name}</p>}

      <div id="layer-count">{page.layers?.length ?? 0}</div>
      <div id="visit-events">{visitEvents.join(',')}</div>
      <div id="page-flash">{(page.flash as { message?: string })?.message ?? ''}</div>
      <div id="likes">{likes}</div>
      <div id="child-events">{childEvents}</div>
      <div id="cancelled-event">{cancelledEvent}</div>

      <input id="note" />
      {/* A history entry carries remembered state, so this is the one input that can survive a back. */}
      <input id="remembered-note" value={remembered.note} onChange={(e) => setRemembered({ note: e.target.value })} />

      <Link href="/layers/panel/first">Open panel</Link>
      <Link href="/layers/guarded">Open guarded panel</Link>
      <Link href="/layers/panel/second">Open second panel</Link>
      <Link href="/layers/panel/third">Open third panel</Link>
      <Link href="/layers/slow">Open slow panel</Link>
      <Link href="/layers/panel/delayed?delay=600">Open delayed panel</Link>
      <Link href="/layers/settings">Open settings</Link>
      {/* Both steps are the same layer key, so the second rewrites the layer the first opened. */}
      <Link href="/layers/step/one">Open step one</Link>
      <Link href="/layers/step/two">Open step two</Link>
      <Link href="/layers/counted/panel">Open counted panel</Link>
      <Link href="/layers/deferred">Open deferred layer</Link>

      <button onClick={pushPanel}>Push panel as a page</button>
      <button onClick={openPanelWithCallbacks}>Open panel with callbacks</button>
      <button onClick={openPanelWithViewTransition}>Open panel with view transition</button>
      <button onClick={like}>Like</button>
      <button onClick={refresh}>Refresh in the background</button>
      <button onClick={openPanelWithoutMovingTheAddress}>Open panel without moving the address</button>
      <button onClick={partialReload}>Partial reload</button>
      <button onClick={openHandledPanel}>Open handled panel</button>
      <button onClick={openCancelledPanel}>Open cancelled panel</button>
      <button onClick={openLocalLayer}>Open local layer</button>
      <button onClick={setBaseChrome}>Set base chrome</button>
    </>
  )
}
