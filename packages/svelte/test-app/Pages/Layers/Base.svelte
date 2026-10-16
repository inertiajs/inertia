<script lang="ts">
  import { inertia, router, setLayoutProps, usePage, useRemember } from '@inertiajs/svelte'

  const { likes }: { likes: number } = $props()

  const page = usePage()

  let visitEvents = $state<string[]>([])
  let childEvents = $state('')
  let cancelledEvent = $state('')

  const remembered = useRemember({ note: '' })

  const pushPanel = () => {
    router.push({
      url: '/layers/panel/client',
      component: 'Layers/Panel',
      props: { name: 'from a client visit' },
    })
  }

  const openPanelWithCallbacks = () => {
    router.visit('/layers/panel/first', {
      onFlash: () => (visitEvents = [...visitEvents, 'flash']),
      onError: () => (visitEvents = [...visitEvents, 'error']),
      onSuccess: () => (visitEvents = [...visitEvents, 'success']),
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
    handle.on('saved', (user) => (childEvents = `saved ${(user as { id?: number })?.id}`))
  }

  const openCancelledPanel = () => {
    const handle = router.layer('/layers/panel/delayed?delay=600')
    handle.onClose(() => (cancelledEvent = 'closed'))
  }

  const openLocalLayer = () => {
    router.layer({ component: 'Layers/Local', props: { note: 'local' } })
  }

  const setBaseChrome = () => {
    setLayoutProps({ baseChrome: 'base' })
  }
</script>

<div>Base page</div>

<div id="spacer" style="height: 1000px"></div>

{#if page.props.errors?.name}
  <p id="page-error">{page.props.errors.name}</p>
{/if}

<div id="layer-count">{page.layers?.length ?? 0}</div>
<div id="visit-events">{visitEvents.join(',')}</div>
<div id="page-flash">{(page.flash as { message?: string })?.message ?? ''}</div>
<div id="likes">{likes}</div>
<div id="child-events">{childEvents}</div>
<div id="cancelled-event">{cancelledEvent}</div>

<input id="note" />
<input id="remembered-note" bind:value={remembered.note} />

<a href="/layers/panel/first" use:inertia>Open panel</a>
<a href="/layers/guarded" use:inertia>Open guarded panel</a>
<a href="/layers/panel/second" use:inertia>Open second panel</a>
<a href="/layers/panel/third" use:inertia>Open third panel</a>
<a href="/layers/slow" use:inertia>Open slow panel</a>
<a href="/layers/panel/delayed?delay=600" use:inertia>Open delayed panel</a>
<a href="/layers/settings" use:inertia>Open settings</a>
<a href="/layers/step/one" use:inertia>Open step one</a>
<a href="/layers/step/two" use:inertia>Open step two</a>
<a href="/layers/counted/panel" use:inertia>Open counted panel</a>
<a href="/layers/deferred" use:inertia>Open deferred layer</a>

<button onclick={pushPanel}>Push panel as a page</button>
<button onclick={openPanelWithCallbacks}>Open panel with callbacks</button>
<button onclick={openPanelWithViewTransition}>Open panel with view transition</button>
<button onclick={like}>Like</button>
<button onclick={refresh}>Refresh in the background</button>
<button onclick={openPanelWithoutMovingTheAddress}>Open panel without moving the address</button>
<button onclick={partialReload}>Partial reload</button>
<button onclick={openHandledPanel}>Open handled panel</button>
<button onclick={openCancelledPanel}>Open cancelled panel</button>
<button onclick={openLocalLayer}>Open local layer</button>
<button onclick={setBaseChrome}>Set base chrome</button>
