<script setup>
import { usePage } from '@inertiajs/vue3'
import { onBeforeMount } from 'vue'

const props = defineProps({
  headers: Object,
  method: String,
  form: Object,
  files: Array,
  query: Object,
})

const page = usePage()

const dump = {
  headers: props.headers,
  method: props.method,
  form: props.form,
  files: props.files ? props.files : {},
  query: props.query,
  $page: page,
}

onBeforeMount(() => {
  window._inertia_request_dump = {
    headers: props.headers,
    method: props.method,
    form: props.form,
    files: props.files ? props.files : {},
    query: props.query,
    $page: page,
  }
})
</script>

<template>
  <div>
    <div class="text">This is Inertia page component containing a data dump of the request</div>
    <hr />
    <pre class="dump">{{ dump }}</pre>
  </div>
</template>
