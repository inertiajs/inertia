<template>
  <div>
    <div class="text">This is Inertia page component containing a data dump of the request</div>
    <hr />
    <pre class="dump">{{ dump }}</pre>
  </div>
</template>
<script>
export default {
  props: {
    headers: Object,
    method: String,
    form: Object,
    files: Array,
    query: Object,
  },
  computed: {
    dump() {
      return {
        headers: this.headers,
        method: this.method,
        form: this.form,
        files: this.files ? this.files : {},
        query: this.query,
        $page: this.$page,
      }
    },
  },
  created() {
    window._inertia_request_dump = this.dump
  },
}
</script>
