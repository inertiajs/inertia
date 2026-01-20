<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3'

const props = defineProps<{
  foo?: string
  items?: {
    data: string[]
    next_page_url?: string
  }
}>()

const loadMore = () => {
  if (props.items?.next_page_url) {
    router.visit(props.items.next_page_url, {
      only: ['items'],
      preserveState: true,
      preserveScroll: true,
      preserveUrl: true,
    })
  }
}
</script>

<template>
  <div>
    <span class="text">This is the links page that demonstrates preserve url on Links</span>
    <span class="foo">Foo is now {{ foo || 'default' }}</span>

    <Link href="/links/preserve-url-page-two" preserve-url :data="{ foo: 'bar' }" class="preserve"
      >[URL] Preserve: true</Link
    >
    <Link href="/links/preserve-url-page-two" :preserve-url="false" :data="{ foo: 'baz' }" class="preserve-false"
      >[URL] Preserve: false</Link
    >

    <div v-if="items" class="items-section">
      <div class="items">
        <div v-for="item in items.data" :key="item" class="item">{{ item }}</div>
      </div>

      <span class="items-loaded">Items loaded: {{ items.data.length }}</span>
      <span class="has-next-page">{{ items.next_page_url ? 'true' : 'false' }}</span>

      <Link
        v-if="items.next_page_url"
        :href="items.next_page_url"
        :only="['items']"
        preserve-state
        preserve-scroll
        preserve-url
        class="load-more"
      >
        Load More
      </Link>

      <button v-if="items.next_page_url" @click="loadMore" class="load-more-router">Load More Router</button>
    </div>
  </div>
</template>
