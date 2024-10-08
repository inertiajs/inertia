<script>
  import { inertia } from '@inertiajs/svelte'

  export let method
</script>

<div>
  <span class="text">This is the links page that demonstrates inertia-links without the 'as' warning</span>

  <button use:inertia={{ method, href: '/example' }} class="get">{method} button Link</button>
</div>
