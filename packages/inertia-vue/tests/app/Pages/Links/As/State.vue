<template>
  <div>
    <span class="text">This is the links page that demonstrates inertia-links with different 'as' states</span>

    <Link as="button" href="/example" class="disabled" disabled>Disabled Button</Link>
  </div>
</template>
<script>
import { Link } from '@inertiajs/inertia-vue'

export default {
  components: {
    Link
  }
}
</script>
