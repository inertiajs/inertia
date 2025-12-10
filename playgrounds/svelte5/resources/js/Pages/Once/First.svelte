<script module>
  export { default as layout } from './Layout.svelte'
</script>

<script>
  let { foo, bar, baz1, qux } = $props()
</script>

<svelte:head>
  <title>Once Props: First Page</title>
</svelte:head>

<h1 class="text-3xl">Once Props: First Page</h1>
<p>Foo: {foo}</p>
<p>Bar: {bar}</p>
<p>Baz: {baz1}</p>
<p>Qux: {qux ?? 'Loading...'}</p>
