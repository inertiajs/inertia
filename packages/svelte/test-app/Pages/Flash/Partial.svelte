<script lang="ts">
  import { page, router } from '@inertiajs/svelte'

  interface Props {
    count: number
  }

  let { count }: Props = $props()

  let flashEventCount = $state(0)

  router.on('flash', () => {
    flashEventCount++
  })

  const reloadWithSameFlash = () => {
    router.reload({ only: ['count'], data: { flashType: 'same', count: Date.now() } })
  }

  const reloadWithDifferentFlash = () => {
    router.reload({ only: ['count'], data: { flashType: 'different', count: Date.now() } })
  }
</script>

<div>
  <span id="flash">{JSON.stringify(page.flash)}</span>
  <span id="flash-event-count">{flashEventCount}</span>
  <span id="count">{count}</span>

  <button onclick={reloadWithSameFlash}>Reload with same flash</button>
  <button onclick={reloadWithDifferentFlash}>Reload with different flash</button>
</div>
