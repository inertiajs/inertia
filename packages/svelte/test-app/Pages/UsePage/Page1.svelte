<script lang="ts">
  import { inertia, usePage } from '@inertiajs/svelte'
  import Child from './Child.svelte'

  interface Props {
    name: string
  }

  let { name }: Props = $props()

  const pageA = usePage()
  const pageB = usePage()
  const sameInstance = pageA === pageB
</script>

<div>
  <h2>Page 1</h2>

  <p data-testid="name-props">Name (props): <strong>{name}</strong></p>
  <p data-testid="name-usepage">Name (usePage): <strong>{pageA.props.name}</strong></p>
  <p data-testid="url">URL: {pageA.url}</p>
  <p data-testid="same-ref">usePage() same instance: <strong>{sameInstance ? 'yes' : 'no'}</strong></p>

  <hr />

  <Child parentPage={pageA} />

  <hr />

  <a data-testid="go-page2" href="/use-page/page2" use:inertia>Go to Page 2</a>
</div>
