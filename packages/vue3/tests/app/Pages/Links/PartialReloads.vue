<script setup>
import { Link } from '@inertiajs/vue3'

defineProps({
  foo: {
    type: Number,
    default: 0,
  },
  bar: Number,
  baz: Number,
  headers: Object,
})
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates partial reloads</span>
    <span class="foo-text">Foo is now {{ foo }}</span>
    <span class="bar-text">Bar is now {{ bar }}</span>
    <span class="baz-text">Baz is now {{ baz }}</span>
    <pre class="headers">{{ headers }}</pre>

    <Link href="/links/partial-reloads" :data="{ foo }" class="all">Update All</Link>
    <Link href="/links/partial-reloads" :only="['headers', 'foo', 'bar']" :data="{ foo }" class="foo-bar"
      >Only foo + bar</Link
    >
    <Link href="/links/partial-reloads" :only="['headers', 'baz']" :data="{ foo }" class="baz">Only baz</Link>
    <Link href="/links/partial-reloads" :except="['foo', 'bar']" :data="{ foo }" class="except-foo-bar"
      >Except foo + bar</Link
    >
    <Link href="/links/partial-reloads" :except="['baz']" :data="{ foo }" class="except-baz">Except baz</Link>
  </div>
</template>
