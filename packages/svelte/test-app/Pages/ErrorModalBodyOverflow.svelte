<script lang="ts">
  import { router } from '@inertiajs/svelte'
  import { onDestroy, onMount } from 'svelte'

  export let mode: 'stylesheet' | 'inline'

  const invalidVisit = () => {
    router.post('/non-inertia')
  }

  let styleTag: HTMLStyleElement | null = null

  onMount(() => {
    if (mode === 'stylesheet') {
      styleTag = document.createElement('style')
      styleTag.id = 'body-overflow-style'
      styleTag.textContent = 'body { overflow-y: scroll; }'
      document.head.appendChild(styleTag)
    } else {
      document.body.style.overflow = 'hidden'
    }
  })

  onDestroy(() => {
    if (styleTag) {
      styleTag.remove()
      styleTag = null
    }
    if (mode === 'inline') {
      document.body.style.overflow = ''
    }
  })
</script>

<div>
  <span
    on:click={invalidVisit}
    on:keydown={(e) => e.key === 'Enter' && invalidVisit()}
    role="button"
    tabindex="0"
    class="invalid-visit">Invalid Visit</span
  >
</div>
