<script lang="ts">
  import { inertia, usePage } from '@inertiajs/svelte'
  import Child from './Child.svelte'

  interface Props {
    title: string
  }

  let { title }: Props = $props()

  const pageA = usePage()
  const pageB = usePage()
  const sameInstance = pageA === pageB
</script>

<div>
  <h2>Page 2</h2>

  <p data-testid="title-props">Title (props): <strong>{title}</strong></p>
  <p data-testid="title-usepage">Title (usePage): <strong>{pageA.props.title}</strong></p>
  <p data-testid="url">URL: {pageA.url}</p>
  <p data-testid="same-ref">usePage() same instance: <strong>{sameInstance ? 'yes' : 'no'}</strong></p>

  <hr />

  <Child parentPage={pageA} />

  <hr />

  <a data-testid="go-page1" href="/use-page/page1" use:inertia>Go to Page 1</a>
</div>
