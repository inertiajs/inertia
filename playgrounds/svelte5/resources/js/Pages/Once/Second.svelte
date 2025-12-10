<script module>
  export { default as layout } from './Layout.svelte'
</script>

<script>
  let { foo, bar, baz2, qux } = $props()
</script>

<svelte:head>
  <title>Once Props: Second Page</title>
</svelte:head>

<h1 class="text-3xl">Once Props: Second Page</h1>
<p>Foo: {foo}</p>
<p>Bar: {bar}</p>
<p>Baz: {baz2}</p>
<p>Qux: {qux ?? 'Loading...'}</p>
