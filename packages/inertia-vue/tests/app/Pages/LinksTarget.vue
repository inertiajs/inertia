<template>
  <div>
    <span>This is one of the links target page</span>
    <span>Method: {{ method }}</span>
    <inertia-link href="/links">Test 1</inertia-link>
  </div>
</template>
<script>
  export default {
    props: {
      method: String
    }
  }
</script>
