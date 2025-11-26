<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const locationVisit = (e: Event) => {
    e.preventDefault()

    router.visit('/location')
  }
</script>

<div>
  <span class="text">This is the page that demonstrates location visits</span>

  <a href={'#'} onclick={locationVisit} class="example">Location visit</a>
</div>
