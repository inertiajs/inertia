<script lang="ts">
  import { usePage } from '@inertiajs/svelte'
  import type { Readable } from 'svelte/store'

  export let parentPage: Readable<Record<string, unknown>>

  const page = usePage()
  // eslint-disable-next-line svelte/require-store-reactive-access
  const sameAsParent = page === parentPage
</script>

<div>
  <p><em>From child component:</em></p>
  <p data-testid="child-url">{$page.url}</p>
  <p data-testid="child-component">{$page.component}</p>
  <p data-testid="child-same-ref">Same instance as parent: <strong>{sameAsParent ? 'yes' : 'no'}</strong></p>
</div>
