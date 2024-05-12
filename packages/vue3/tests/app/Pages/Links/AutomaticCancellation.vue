<template>
  <div>
    <span class="text">This is the links page that demonstrates that only one visit can be active at a time</span>
    <inertia-link href="/sleep" class="visit" @cancel="() => alert('cancelled')" @start="() => alert('started')"
      >Link</inertia-link
    >
  </div>
</template>
<script>
export default {
  methods: {
    alert(message) {
      return window.alert(message)
    },
  },
}
</script>
