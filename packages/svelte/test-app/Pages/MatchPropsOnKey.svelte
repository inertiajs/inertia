<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface ComponentProps {
    foo: {
      data: { id: number; name: string }[]
      companies: { id: number; name: string }[]
      teams: { id: number; name: string }[]
      page: number
      per_page: number
      meta: { label: string }
    }
    bar: number[]
    baz: number[]
  }

  interface Props {
    foo: ComponentProps['foo']
    bar: ComponentProps['bar']
    baz: ComponentProps['baz']
  }

  let { foo, bar, baz }: Props = $props()

  // svelte-ignore state_referenced_locally
  let page = foo.page

  const reloadIt = () => {
    router.visit('/match-props-on-key', {
      data: {
        page,
      },
      only: ['foo', 'baz'],
      onSuccess(visit) {
        // TODO: Refactor 'unknown' and make Page<ComponentProps> work
        page = (visit.props as unknown as { foo: { page: number } }).foo.page
      },
    })
  }

  const getFresh = () => {
    page = 0
    router.visit('/match-props-on-key', {
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
<button onclick={reloadIt}>Reload</button>
<button onclick={getFresh}>Get Fresh</button>
