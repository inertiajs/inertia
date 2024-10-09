<script>
  import { inertia } from '@inertiajs/svelte'
</script>

<div>
  <a href="/prefetch/1" use:inertia={{ prefetch: true }}>On Hover (Default)</a>
  <a href="/prefetch/2" use:inertia={{ prefetch: 'mount' }}>On Mount</a>
  <a href="/prefetch/3" use:inertia={{ prefetch: 'click' }}>On Click</a>
  <a href="/prefetch/4" use:inertia={{ prefetch: ['hover', 'mount'], cacheFor: '1s' }}>On Hover + Mount</a>
  <div>
    <slot />
  </div>
</div>
