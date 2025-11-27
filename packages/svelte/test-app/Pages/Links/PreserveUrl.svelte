<script lang="ts">
  import { router, Link } from '@inertiajs/svelte'

  interface Props {
    foo?: string
    items?:
      | {
          data: string[]
          next_page_url?: string
        }
      | undefined
  }

  let { foo = 'default', items = undefined }: Props = $props()

  const loadMore = () => {
    if (items?.next_page_url) {
      router.visit(items.next_page_url, {
        only: ['items'],
        preserveState: true,
        preserveScroll: true,
        preserveUrl: true,
      })
    }
  }
</script>

<div>
  <span class="text">This is the links page that demonstrates preserve url on Links</span>
  <span class="foo">Foo is now {foo}</span>

  <Link href="/links/preserve-url-page-two" preserveUrl data={{ foo: 'bar' }} class="preserve">
    [URL] Preserve: true
  </Link>
  <Link href="/links/preserve-url-page-two" preserveUrl={false} data={{ foo: 'baz' }} class="preserve-false">
    [URL] Preserve: false
  </Link>

  {#if items}
    <div class="items-section">
      <div class="items">
        {#each items.data as item, index (index)}
          <div class="item">{item}</div>
        {/each}
      </div>

      <span class="items-loaded">Items loaded: {items.data.length}</span>
      <span class="has-next-page">{items.next_page_url ? 'true' : 'false'}</span>

      {#if items.next_page_url}
        <Link href={items.next_page_url} only={['items']} preserveState preserveScroll preserveUrl class="load-more">
          Load More
        </Link>
      {/if}

      {#if items.next_page_url}
        <button onclick={loadMore} class="load-more-router">Load More Router</button>
      {/if}
    </div>
  {/if}
</div>
