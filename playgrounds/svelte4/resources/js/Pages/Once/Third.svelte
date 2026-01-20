<script context="module">
  export { default as layout } from './Layout.svelte'
</script>

<script lang="ts">
  export let foo: string
  export let bar: string
  export let baz3: string
  export let qux: string | undefined
</script>

<svelte:head>
  <title>Once Props: Third Page</title>
</svelte:head>

<h1 class="text-3xl">Once Props: Third Page</h1>
<p>Foo: {foo}</p>
<p>Bar: {bar}</p>
<p>Baz: {baz3}</p>
<p>Qux: {qux ?? 'Loading...'}</p>
