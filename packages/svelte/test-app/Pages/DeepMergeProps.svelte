<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Props {
    foo: { page: number; data: number[]; per_page: number; meta: { label: string } }
    bar: number[]
    baz: number[]
  }

  let { foo, bar, baz }: Props = $props()

  // svelte-ignore state_referenced_locally
  let page = foo.page

  const reloadIt = () => {
    router.reload({
      data: {
        page,
      },
      only: ['foo', 'baz'],
      onSuccess(visit) {
        page = (visit.props as unknown as { foo: { page: number } }).foo.page
      },
    })
  }

  const getFresh = () => {
    page = 0
    router.visit('/deep-merge-props', {
      reset: ['foo', 'baz'],
    })
  }
</script>

<div>bar count is {bar.length}</div>
<div>baz count is {baz.length}</div>
<div>foo.data count is {foo.data.length}</div>
<div>foo.page is {foo.page}</div>
<div>foo.per_page is {foo.per_page}</div>
<div>foo.meta.label is {foo.meta.label}</div>
<button onclick={reloadIt}>Reload</button>
<button onclick={getFresh}>Get Fresh</button>
