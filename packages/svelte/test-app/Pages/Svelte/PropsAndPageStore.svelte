<script lang="ts">
  import { inertia, page, usePage, useForm } from '@inertiajs/svelte'
  import { onMount } from 'svelte'

  type PageProps = {
    foo: string
  }

  export let foo

  const form = useForm({ foo })

  const pageProps: PageProps = {
    foo: $page.props.foo,
  }

  const sveltePage = usePage<PageProps>()

  console.log('[script] foo prop is', foo)
  console.log('[script] $page.props.foo is', $page.props.foo)
  console.log('[script] $sveltePage.props.foo is', $sveltePage.props.foo)

  $: console.log('[reactive expression] foo prop is', foo)
  $: console.log('[reactive expression] $page.props.foo is', $page.props.foo)
  $: console.log('[reactive expression] $sveltePage.props.foo is', $sveltePage.props.foo)

  onMount(() => {
    console.log('[onMount] foo prop is', foo)
    console.log('[onMount] $page.props.foo is', $page.props.foo)
    console.log('[onMount] $sveltePage.props.foo is', $sveltePage.props.foo)
  })
</script>

<div>
  <input id="input" type="text" bind:value={$form.foo} />
  <p>foo prop is {foo}</p>
  <p>$page.props.foo is {$page.props.foo}</p>
  <p>pageProps.foo is {pageProps.foo}</p>
  <p>$sveltePage.props.foo is {$sveltePage.props.foo}</p>

  <a href="/svelte/props-and-page-store" use:inertia={{ data: { foo: 'bar' } }}> Bar </a>
  <a href="/svelte/props-and-page-store" use:inertia={{ data: { foo: 'baz' } }}> Baz </a>
  <a href="/" use:inertia> Home </a>
</div>
