<script setup>
import { Link } from '@inertiajs/vue3'
import { getCurrentInstance, onMounted } from 'vue'
import WithoutScrollRegion from '../../Layouts/WithoutScrollRegion.vue'

defineOptions({
  layout: WithoutScrollRegion,
})

defineProps({
  foo: {
    type: String,
    default: 'default',
  },
})

const preserveCallback = (page) => {
  alert(page)

  return true
}

const preserveCallbackFalse = (page) => {
  alert(page)

  return false
}

onMounted(() => {
  window._inertia_page_key = getCurrentInstance().uid
})
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates preserve state on Links</span>
    <span class="foo">Foo is now {{ foo }}</span>
    <label>
      Example Field
      <input type="text" name="example-field" class="field" />
    </label>

    <Link href="/links/preserve-state-page-two" preserve-state :data="{ foo: 'bar' }" class="preserve"
      >[State] Preserve: true</Link
    >
    <Link href="/links/preserve-state-page-two" :preserve-state="false" :data="{ foo: 'baz' }" class="preserve-false"
      >[State] Preserve: false</Link
    >

    <Link
      href="/links/preserve-state-page-two"
      :preserve-state="preserveCallback"
      :data="{ foo: 'callback-bar' }"
      class="preserve-callback"
      >[State] Preserve Callback: true</Link
    >
    <Link
      href="/links/preserve-state-page-two"
      :preserve-state="preserveCallbackFalse"
      :data="{ foo: 'callback-baz' }"
      class="preserve-callback-false"
      >[State] Preserve Callback: false</Link
    >
  </div>
</template>
