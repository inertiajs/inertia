<script lang="ts">
  import { config, router } from '@inertiajs/svelte'

  interface Props {
    dialog?: boolean
  }

  let { dialog = false }: Props = $props()

  const invalidVisit = () => {
    router.post('/non-inertia')
  }

  const invalidVisitJson = () => {
    router.post('/json')
  }

  $effect(() => {
    if (dialog) {
      config.set('future.useDialogForErrorModal', true)
    }
  })
</script>

<div>
  <span
    onclick={invalidVisit}
    onkeydown={(e) => e.key === 'Enter' && invalidVisit()}
    role="button"
    tabindex="0"
    class="invalid-visit">Invalid Visit</span
  >
  <span
    onclick={invalidVisitJson}
    onkeydown={(e) => e.key === 'Enter' && invalidVisitJson()}
    role="button"
    tabindex="0"
    class="invalid-visit-json">Invalid Visit (JSON response)</span
  >
</div>
