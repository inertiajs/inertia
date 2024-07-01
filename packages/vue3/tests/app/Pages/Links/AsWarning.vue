<template>
  <div>
    <span class="text">This is the links page that demonstrates inertia-links with an 'as' warning</span>

    <inertia-link :method="method" href="/example" class="get">{{ method }} Link</inertia-link>
  </div>
</template>
<script>
export default {
  props: {
    method: String,
  },
}
</script>
