<script lang="ts">
  import { inertia } from '@inertiajs/svelte'
  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
</script>

<div>
  <a href="/prefetch/1" use:inertia={{ prefetch: true }}>On Hover (Default)</a>
  <a href="/prefetch/2" use:inertia={{ prefetch: 'mount' }}>On Mount</a>
  <a href="/prefetch/3" use:inertia={{ prefetch: 'click' }}>On Click</a>
  <a href="/prefetch/4" use:inertia={{ prefetch: ['hover', 'mount'], cacheFor: '1s' }}>On Hover + Mount</a>
  <a href="/prefetch/5" use:inertia={{ prefetch: 'mount', cacheFor: '0' }}>On Mount (Once)</a>
  <a href="/prefetch/6" use:inertia={{ prefetch: 'click' }}>On Enter</a>
  <button use:inertia={{ href: '/prefetch/7', prefetch: 'click' }}>On Spacebar</button>
  <div>
    {@render children?.()}
  </div>
</div>
