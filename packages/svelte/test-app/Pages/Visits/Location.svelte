<script>
  import { router } from '@inertiajs/svelte'

  const locationVisit = () => {
    router.visit('/location')
  }
</script>

<div>
  <span class="text">This is the page that demonstrates location visits</span>

  <a href="#" on:click|preventDefault={locationVisit} class="example">Location visit</a>
</div>
