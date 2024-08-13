<script context="module">
  import Layout1 from '../Components/Layout.svelte'
  import Layout2 from '../Components/Layout2.svelte'
  export const layout = [Layout1, Layout2]
</script>

<script>
  import { onMount, onDestroy } from 'svelte'
  import { inertia, useForm } from '@inertiajs/svelte'

  export let name

  console.log('"name" prop: ', name, new Date().getTime())

  const form = useForm({
    'name': name
  });

  onMount(() => {
    console.log(`Mounted <FooBar name=${name} />`, new Date().getTime())
  })

  onDestroy(() => {
    console.log(`Destroyed <FooBar name=${name} />`, new Date().getTime())
  })
</script>

<h1 class="text-3xl">{name} <small>({new Date().getTime()})</small></h1>

Name: <input type="text" bind:value={$form.name} class="px-1 border border-gray-400 rounded">

<p class="mt-6">
  <a href="/foo" use:inertia class="text-blue-700 underline">Link to Foo</a><br>
  <a href="/foo" use:inertia={{ preserveState: true }} class="text-blue-700 underline">Link to Foo (preserve)</a><br>
  <a href="/bar" use:inertia class="text-blue-700 underline">Link to Bar</a><br>
  <a href="/bar" use:inertia={{ preserveState: true }} class="text-blue-700 underline">Link to Bar (preserve)</a><br>
  <a href="/baz" use:inertia class="text-blue-700 underline">Link to Baz</a><br>
  <a href="/baz" use:inertia={{ preserveState: true }} class="text-blue-700 underline">Link to Baz (preserve)</a><br>
</p>
