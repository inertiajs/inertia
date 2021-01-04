<template>
  <div>
    <div class="text">This is one of the links target page</div>
    <div class="method">Method: {{ method }}</div>
    <div class="form">FormData: {{ form }}</div>
    <div class="query">QueryParams: {{ query }}</div>
    <inertia-link href="/links/basic">Test 1</inertia-link>
  </div>
</template>
<script>
  export default {
    props: {
      method: String,
      form: Object,
      query: Object
    }
  }
</script>
