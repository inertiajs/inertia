<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const wayfinderObjectVisit = () => {
    router.visit({ url: '/dump/post', method: 'post' })
  }

  const wayfinderObjectMethodOverride = () => {
    router.visit({ url: '/dump/patch', method: 'get' }, { method: 'patch' })
  }
</script>

<div>
  <a href={'#'} onclick={wayfinderObjectVisit} class="wayfinder-visit">Wayfinder object visit</a>
  <a href={'#'} onclick={wayfinderObjectMethodOverride} class="wayfinder-method-override"
    >Wayfinder object method override</a
  >
</div>
