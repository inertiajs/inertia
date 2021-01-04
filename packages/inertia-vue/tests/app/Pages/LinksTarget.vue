<template>
  <div>
    <div class="text">This is one of the links target page</div>
    <div class="content-type">Content-Type: {{ contentType }}</div>
    <div class="method">Method: {{ method }}</div>
    <div class="form">FormData: {{ form }}</div>
    <div class="files">Files: {{ files ? files.length : 0 }}</div>
    <div class="query">QueryParams: {{ query }}</div>
    <inertia-link href="/links/basic">Test 1</inertia-link>
  </div>
</template>
<script>
  export default {
    props: {
      contentType: String,
      method: String,
      form: Object,
      files: Array,
      query: Object
    },
    mounted() {
    }
  }
</script>
