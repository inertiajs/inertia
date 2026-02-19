import { useHttp } from '@inertiajs/react'
import { useState } from 'react'

interface HeadersResponse {
  headers: Record<string, string>
  method: string
}

export default () => {
  const headersTest = useHttp<{ data: string }, HeadersResponse>({
    data: 'test',
  })

  const [lastHeadersResponse, setLastHeadersResponse] = useState<HeadersResponse | null>(null)

  const performHeadersTest = async () => {
    try {
      const result = await headersTest.post('/api/headers', {
        headers: {
          'X-Custom-Header': 'custom-value',
          'X-Another-Header': 'another-value',
        },
      })
      setLastHeadersResponse(result)
    } catch (e) {
      console.error('Headers test failed:', e)
    }
  }

  return (
    <div>
      <h1>useHttp Headers Test</h1>

      {/* Headers Test */}
      <section id="headers-test">
        <h2>Custom Headers</h2>
        <button onClick={performHeadersTest} id="headers-button">
          Send with Custom Headers
        </button>
        {lastHeadersResponse && (
          <div id="headers-result">
            Custom Header Received: {lastHeadersResponse.headers['x-custom-header'] || 'none'}
            <br />
            Another Header: {lastHeadersResponse.headers['x-another-header'] || 'none'}
            <br />
            Content-Type: {lastHeadersResponse.headers['content-type'] || 'none'}
          </div>
        )}
      </section>
    </div>
  )
}
