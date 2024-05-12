<template>
  <div>
    <span class="text">This is the links page that demonstrates inertia-links without the 'as' warning</span>

    <inertia-link :method="method" href="/example" class="get" as="button">{{ method }} button Link</inertia-link>
  </div>
</template>
<script>
export default {
  props: {
    method: String,
  },
}
</script>
