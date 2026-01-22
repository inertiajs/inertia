<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

  interface NestedResponse {
    success: boolean
    received: Record<string, unknown>
  }

  const nestedData = useHttp<
    {
      user: {
        name: string
        address: {
          city: string
          zip: string
        }
      }
      tags: string[]
    },
    NestedResponse
  >({
    user: {
      name: '',
      address: {
        city: '',
        zip: '',
      },
    },
    tags: [],
  })

  let lastNestedResponse: NestedResponse | null = $state(null)

  const performNestedTest = async () => {
    try {
      const result = await nestedData.post('/api/nested')
      lastNestedResponse = result
    } catch (e) {
      console.error('Nested test failed:', e)
    }
  }
</script>

<div>
  <h1>useHttp Nested Data Test</h1>

  <!-- Nested Data Test -->
  <section id="nested-test">
    <h2>Nested Data</h2>
    <label>
      User Name
      <input type="text" id="nested-user-name" bind:value={nestedData.user.name} />
    </label>
    <label>
      City
      <input type="text" id="nested-city" bind:value={nestedData.user.address.city} />
    </label>
    <label>
      Zip
      <input type="text" id="nested-zip" bind:value={nestedData.user.address.zip} />
    </label>
    <label>
      Tags (comma-separated)
      <input
        type="text"
        id="nested-tags"
        oninput={(e) => (nestedData.tags = (e.target as HTMLInputElement).value.split(',').map((t) => t.trim()))}
      />
    </label>
    <button onclick={performNestedTest} id="nested-button">Submit Nested Data</button>
    {#if lastNestedResponse}
      <div id="nested-result">
        Received: {JSON.stringify(lastNestedResponse.received)}
      </div>
    {/if}
  </section>
</div>
