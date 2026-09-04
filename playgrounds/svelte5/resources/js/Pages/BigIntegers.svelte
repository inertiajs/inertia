<script>
  import { router, usePage } from '@inertiajs/svelte'

  let { appName, safe, big, negative, maximum, boundary, order, wrapped } = $props()

  const page = usePage()

  const rows = $derived([
    { label: 'safe', id: 'safe', value: safe },
    { label: 'boundary', id: 'boundary', value: boundary },
    { label: 'big', id: 'big', value: big },
    { label: 'negative', id: 'negative', value: negative },
    { label: 'maximum', id: 'maximum', value: maximum },
    { label: 'order.id', id: 'nested', value: order.id },
    { label: 'order.lines[0].reference', id: 'deep', value: order.lines[0].reference },
    { label: 'wrapped.id', id: 'wrapped', value: wrapped.id },
  ])

  const submit = () => {
    router.post('/big-integers/echo', { id: big })
  }
</script>

<svelte:head>
  <title>Big Integers - {appName}</title>
</svelte:head>

<h1 class="text-3xl">Big Integers</h1>

<p class="mt-2 max-w-2xl text-gray-600">
  Integers outside JavaScript's safe range arrive as native BigInt values instead of being rounded while the page is
  parsed.
</p>

<div class="mt-6 space-y-6">
  <div>
    <h2 class="text-lg font-semibold">Props</h2>
    <table class="mt-2 text-sm">
      <thead class="text-left text-gray-500">
        <tr>
          <th class="pr-8">Prop</th>
          <th class="pr-8">Value</th>
          <th>typeof</th>
        </tr>
      </thead>
      <tbody class="font-mono">
        {#each rows as row (row.id)}
          <tr>
            <td class="pr-8">{row.label}</td>
            <td class="pr-8" id={row.id}>{row.value}</td>
            <td>{typeof row.value}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div>
    <h2 class="text-lg font-semibold">Precision Loss Without BigInt</h2>
    <pre class="mt-2 rounded-sm bg-gray-100 p-3 text-sm">big              {big}
Number(big)      {Number(big)}
big + 1n         {big + 1n}</pre>
    <p class="mt-2 text-sm text-gray-600">
      Casting to a number is what happens without this feature enabled. Arithmetic stays exact while both operands are
      BigInt values.
    </p>
  </div>

  <div>
    <h2 class="text-lg font-semibold">Submitting</h2>
    <button onclick={submit} class="mt-2 rounded-sm bg-slate-800 px-4 py-2 text-white">Post big to the server</button>
    <pre class="mt-2 rounded-sm bg-gray-100 p-3 text-sm" id="echo">{Object.keys(page.flash ?? {}).length
        ? JSON.stringify(page.flash, null, 2)
        : 'Nothing submitted yet'}</pre>
    <p class="mt-2 text-sm text-gray-600">
      The value is encoded on submit and decoded by the Inertia middleware, so the controller receives an integer.
    </p>
  </div>
</div>
