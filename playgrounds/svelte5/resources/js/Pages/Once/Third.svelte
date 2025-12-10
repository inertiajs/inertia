<script module>
  export { default as layout } from './Layout.svelte'
</script>

<script>
  let { foo, bar, baz3, qux } = $props()
</script>

<svelte:head>
  <title>Once Props: Third Page</title>
</svelte:head>

<h1 class="text-3xl">Once Props: Third Page</h1>
<p>Foo: {foo}</p>
<p>Bar: {bar}</p>
<p>Baz: {baz3}</p>
<p>Qux: {qux ?? 'Loading...'}</p>
