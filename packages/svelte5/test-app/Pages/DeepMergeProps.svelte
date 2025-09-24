<script lang="ts">
  import { router } from '@inertiajs/svelte5'

  const { foo, bar, baz }: {
    foo: { page: number; data: number[]; per_page: number; meta: { label: string } };
    bar: number[];
    baz: number[];
  } = $props()

  let page = $state(foo.page)

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
    router.reload({
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
<button on:click={reloadIt}>Reload</button>
<button on:click={getFresh}>Get Fresh</button>
