<template>
  <div>
    <span>Nested Layout</span>
    <span>{{ createdAt }}</span>
    <div>
      <slot />
    </div>
  </div>
</template>
<script>
  export default {
    data: () => ({
      createdAt: null,
    }),
    created() {
      this.createdAt = Date.now();
    }
  }
</script>
