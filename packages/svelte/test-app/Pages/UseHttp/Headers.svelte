<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

  interface HeadersResponse {
    headers: Record<string, string>
    method: string
  }

  const headersTest = useHttp<{ data: string }, HeadersResponse>({
    data: 'test',
  })

  let lastHeadersResponse: HeadersResponse | null = $state(null)

  const performHeadersTest = async () => {
    try {
      const result = await headersTest.post('/api/headers', {
        headers: {
          'X-Custom-Header': 'custom-value',
          'X-Another-Header': 'another-value',
        },
      })
      lastHeadersResponse = result
    } catch (e) {
      console.error('Headers test failed:', e)
    }
  }
</script>

<div>
  <h1>useHttp Headers Test</h1>

  <!-- Headers Test -->
  <section id="headers-test">
    <h2>Custom Headers</h2>
    <button onclick={performHeadersTest} id="headers-button">Send with Custom Headers</button>
    {#if lastHeadersResponse}
      <div id="headers-result">
        Custom Header Received: {lastHeadersResponse.headers['x-custom-header'] || 'none'}
        <br />
        Another Header: {lastHeadersResponse.headers['x-another-header'] || 'none'}
        <br />
        Content-Type: {lastHeadersResponse.headers['content-type'] || 'none'}
      </div>
    {/if}
  </section>
</div>
