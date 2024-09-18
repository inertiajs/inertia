<script module>
  import Layout from '../Components/Layout.svelte'
  import InnerLayout from '../Components/InnerLayout.svelte'
  export const layout = [Layout, InnerLayout]
</script>

<script>
  import { onMount, onDestroy } from 'svelte'
  import { inertia, useForm } from '@inertiajs/svelte'

  let { name } = $props()

  const form = useForm({
    'name': name
  })

  onMount(() => {
    console.log(`Mounted <Baz name=${name} />`, new Date().getTime())
  })

  onDestroy(() => {
    console.log(`Destroyed <Baz name=${name} />`, new Date().getTime())
  })
</script>

<h1 class="text-3xl">{name}</h1>

Name: <input type="text" bind:value={$form.name} class="px-1 border border-gray-400 rounded">

<p class="mt-6">
  <a href="/foo" use:inertia class="text-blue-700 underline">Link to Foo</a><br>
  <a href="/foo" use:inertia={{ preserveState: true }} class="text-blue-700 underline">Link to Foo (preserve)</a><br>
  <a href="/bar" use:inertia class="text-blue-700 underline">Link to Bar</a><br>
  <a href="/bar" use:inertia={{ preserveState: true }} class="text-blue-700 underline">Link to Bar (preserve)</a><br>
  <a href="/baz" use:inertia class="text-blue-700 underline">Link to Baz</a><br>
</p>

