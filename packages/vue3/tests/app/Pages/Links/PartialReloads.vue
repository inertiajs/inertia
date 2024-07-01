<template>
  <div>
    <span class="text">This is the links page that demonstrates partial reloads</span>
    <span class="foo-text">Foo is now {{ foo }}</span>
    <span class="bar-text">Bar is now {{ bar }}</span>
    <span class="baz-text">Baz is now {{ baz }}</span>
    <pre class="headers">{{ headers }}</pre>

    <inertia-link href="/links/partial-reloads" :data="{ foo }" class="all">Update All</inertia-link>
    <inertia-link href="/links/partial-reloads" :only="['headers', 'foo', 'bar']" :data="{ foo }" class="foo-bar"
      >'Only' foo + bar</inertia-link
    >
    <inertia-link href="/links/partial-reloads" :only="['headers', 'baz']" :data="{ foo }" class="baz"
      >'Only' baz</inertia-link
    >
    <inertia-link href="/links/partial-reloads" :except="['foo', 'bar']" :data="{ foo }" class="except-foo-bar"
      >'Except' foo + bar</inertia-link
    >
    <inertia-link href="/links/partial-reloads" :except="['baz']" :data="{ foo }" class="except-baz"
      >'Except' baz</inertia-link
    >
  </div>
</template>
<script>
export default {
  props: {
    foo: {
      type: Number,
      default: 0,
    },
    bar: Number,
    baz: Number,
    headers: Object,
  },
  created() {
    window._inertia_props = this.$page.props
  },
}
</script>
