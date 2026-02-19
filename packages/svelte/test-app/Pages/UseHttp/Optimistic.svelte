<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

  const optimisticForm = useHttp<{ name: string }, { success: boolean; id: number; name: string }>({
    name: '',
  })

  const optimisticInlineForm = useHttp<{ name: string }, { success: boolean; id: number; name: string }>({
    name: '',
  })

  const performOptimistic = async () => {
    try {
      await optimisticForm
        .optimistic((data) => ({ ...data, name: data.name + ' (saving...)' }))
        .post('/api/optimistic-todo')
    } catch {
      // Errors stored in form
    }
  }

  const performOptimisticInline = async () => {
    try {
      await optimisticInlineForm.post('/api/optimistic-todo', {
        optimistic: (data) => ({ ...data, name: data.name + ' (saving...)' }),
      })
    } catch {
      // Errors stored in form
    }
  }
</script>

<div>
  <h1>useHttp Optimistic</h1>

  <!-- Optimistic (fluent) Test -->
  <section id="optimistic-test">
    <h2>Optimistic (fluent)</h2>
    <input type="text" id="optimistic-name" bind:value={optimisticForm.name} />
    <button onclick={performOptimistic} id="optimistic-button">Submit</button>
    <div id="optimistic-current-name">Name: {optimisticForm.name}</div>
    {#if optimisticForm.processing}
      <div id="optimistic-processing">Processing...</div>
    {/if}
    {#if optimisticForm.wasSuccessful}
      <div id="optimistic-success">Success!</div>
    {/if}
    {#if optimisticForm.errors.name}
      <div id="optimistic-error">{optimisticForm.errors.name}</div>
    {/if}
  </section>

  <!-- Optimistic (inline) Test -->
  <section id="optimistic-inline-test">
    <h2>Optimistic (inline)</h2>
    <input type="text" id="optimistic-inline-name" bind:value={optimisticInlineForm.name} />
    <button onclick={performOptimisticInline} id="optimistic-inline-button">Submit</button>
    <div id="optimistic-inline-current-name">Name: {optimisticInlineForm.name}</div>
    {#if optimisticInlineForm.processing}
      <div id="optimistic-inline-processing">Processing...</div>
    {/if}
    {#if optimisticInlineForm.wasSuccessful}
      <div id="optimistic-inline-success">Success!</div>
    {/if}
    {#if optimisticInlineForm.errors.name}
      <div id="optimistic-inline-error">{optimisticInlineForm.errors.name}</div>
    {/if}
  </section>
</div>
