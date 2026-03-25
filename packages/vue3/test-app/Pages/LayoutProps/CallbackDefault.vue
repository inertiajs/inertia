<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

defineOptions({
  layout: (props) => ({ title: 'Profile: ' + props.userName, showSidebar: false }),
})
</script>

<template>
  <div>
    <h2>Callback Default Layout Page</h2>

    <nav>
      <Link href="/layout-props/basic">Go to Basic Page</Link>
    </nav>
  </div>
</template>
