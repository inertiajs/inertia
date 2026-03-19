<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

  const form = useHttp<{ name: string }>({
    name: '',
  })

  let responseValue = $state('none')

  const performPost = async () => {
    try {
      const result = await form.post('/api/no-content')
      responseValue = JSON.stringify(result)
    } catch {
      responseValue = 'error'
    }
  }
</script>

<div>
  <h1>useHttp No Content Test</h1>

  <section id="no-content-test">
    <label>
      Name
      <input type="text" id="no-content-name" bind:value={form.name} />
    </label>
    <button onclick={performPost} id="no-content-button">Submit</button>
    {#if form.processing}
      <div id="no-content-processing">Processing...</div>
    {/if}
    {#if form.wasSuccessful}
      <div id="no-content-success">Success</div>
    {/if}
    <div id="no-content-response">Response: {responseValue}</div>
  </section>
</div>
