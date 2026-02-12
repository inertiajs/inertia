<script lang="ts">
  import { usePage } from '@inertiajs/svelte'

  interface Props {
    parentPage: ReturnType<typeof usePage>
  }

  let { parentPage }: Props = $props()

  const page = usePage()
  // svelte-ignore state_referenced_locally
  const sameAsParent = page === parentPage
</script>

<div>
  <p><em>From child component:</em></p>
  <p data-testid="child-url">{page.url}</p>
  <p data-testid="child-component">{page.component}</p>
  <p data-testid="child-same-ref">Same instance as parent: <strong>{sameAsParent ? 'yes' : 'no'}</strong></p>
</div>
