<template>
  <div>
    <span class="text">This is the links page that demonstrates preserve state on inertia-links</span>
    <span class="foo">Foo is now {{ foo }}</span>
    <label>
      Example Field
      <input type="text" name="example-field" class="field" />
    </label>

    <inertia-link href="/links/preserve-state-page-two" preserve-state :data="{ foo: 'bar' }" class="preserve"
      >[State] Preserve: true</inertia-link
    >
    <inertia-link
      href="/links/preserve-state-page-two"
      :preserve-state="false"
      :data="{ foo: 'baz' }"
      class="preserve-false"
      >[State] Preserve: false</inertia-link
    >

    <inertia-link
      href="/links/preserve-state-page-two"
      :preserve-state="preserveCallback"
      :data="{ foo: 'callback-bar' }"
      class="preserve-callback"
      >[State] Preserve Callback: true</inertia-link
    >
    <inertia-link
      href="/links/preserve-state-page-two"
      :preserve-state="preserveCallbackFalse"
      :data="{ foo: 'callback-baz' }"
      class="preserve-callback-false"
      >[State] Preserve Callback: false</inertia-link
    >
  </div>
</template>
<script>
export default {
  props: {
    foo: {
      type: String,
      default: 'default',
    },
  },
  mounted() {
    window._inertia_page_key = this.$.vnode.key
  },
  methods: {
    preserveCallback(page) {
      alert(page)

      return true
    },
    preserveCallbackFalse(page) {
      alert(page)

      return false
    },
  },
}
</script>
