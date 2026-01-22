<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

  interface TransformResponse {
    success: boolean
    received: Record<string, unknown>
  }

  const transformTest = useHttp<{ name: string; email: string }, TransformResponse>({
    name: '',
    email: '',
  })

  let lastTransformResponse: TransformResponse | null = $state(null)

  const performTransform = async () => {
    try {
      transformTest.transform((data) => ({
        transformed_name: data.name.toUpperCase(),
        transformed_email: data.email.toLowerCase(),
        original_name: data.name,
      }))
      const result = await transformTest.post('/api/transform')
      lastTransformResponse = result
    } catch (e) {
      console.error('Transform failed:', e)
    }
  }
</script>

<div>
  <h1>useHttp Transform Test</h1>

  <!-- Transform Test -->
  <section id="transform-test">
    <h2>Transform</h2>
    <label>
      Name
      <input type="text" id="transform-name" bind:value={transformTest.name} />
    </label>
    <label>
      Email
      <input type="email" id="transform-email" bind:value={transformTest.email} />
    </label>
    <button onclick={performTransform} id="transform-button">Submit with Transform</button>
    {#if lastTransformResponse}
      <div id="transform-result">
        Transformed Name: {lastTransformResponse.received.transformed_name}
        <br />
        Transformed Email: {lastTransformResponse.received.transformed_email}
        <br />
        Original Name: {lastTransformResponse.received.original_name}
      </div>
    {/if}
  </section>
</div>
