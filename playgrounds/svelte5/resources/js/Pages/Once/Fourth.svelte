<script module>
  export { default as layout } from './Layout.svelte'
</script>

<script>
  let { foo, bar, baz4, qux } = $props()
</script>

<svelte:head>
  <title>Once Props: Fourth Page</title>
</svelte:head>

<h1 class="text-3xl">Once Props: Fourth Page</h1>
<p>Foo: {foo}</p>
<p>Bar: {bar}</p>
<p>Baz: {baz4}</p>
<p>Qux: {qux ?? 'Loading...'}</p>
