<script lang="ts">
  import { router } from '@inertiajs/svelte5'

  const {
    foo,
    bar,
    baz,
  }: {
    foo: {
      page: number
      data: Array<{ name: string }>
      companies: Array<{ name: string }>
      teams: Array<{ name: string }>
      per_page: number
      meta: { label: string }
    }
    bar: number[]
    baz: number[]
  } = $props()

  let page = $state(foo.page)

  const reloadIt = () => {
    router.reload({
      data: {
        page,
      },
      only: ['foo', 'baz'],
      onSuccess(visit) {
        // TODO: Refactor 'any' to a more specific type
        page = (visit.props as any as { foo: { page: number } }).foo.page
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
<div>first foo.data name is {foo.data[0].name}</div>
<div>last foo.data name is {foo.data[foo.data.length - 1].name}</div>
<div>foo.companies count is {foo.companies.length}</div>
<div>first foo.companies name is {foo.companies[0].name}</div>
<div>last foo.companies name is {foo.companies[foo.companies.length - 1].name}</div>
<div>foo.teams count is {foo.teams.length}</div>
<div>first foo.teams name is {foo.teams[0].name}</div>
<div>last foo.teams name is {foo.teams[foo.teams.length - 1].name}</div>
<div>foo.page is {foo.page}</div>
<div>foo.per_page is {foo.per_page}</div>
<div>foo.meta.label is {foo.meta.label}</div>
<button on:click={reloadIt}>Reload</button>
<button on:click={getFresh}>Get Fresh</button>
