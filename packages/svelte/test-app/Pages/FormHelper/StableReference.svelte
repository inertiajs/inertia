<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({ name: '' })

  let effectRuns = 0
  let count = $state(0)

  $effect(() => {
    effectRuns++
    count = effectRuns

    form.post('/form-helper/stable-reference', {
      preserveState: true,
    })
  })
</script>

<div>
  <h1>useForm Stable Reference Test</h1>
  <div id="render-count">Render count: {count}</div>
  {#if form.recentlySuccessful}
    <div id="recently-successful">Recently successful</div>
  {/if}
  {#if form.wasSuccessful}
    <div id="was-successful">Was successful</div>
  {/if}
</div>
