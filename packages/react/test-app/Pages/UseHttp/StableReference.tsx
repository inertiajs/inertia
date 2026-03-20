import { useHttp } from '@inertiajs/react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface SearchResponse {
  items: string[]
  total: number
  query: string | null
}

export default () => {
  const http = useHttp<{ query: string }, SearchResponse>({ query: '' })
  const renderCount = useRef(0)
  const [result, setResult] = useState<SearchResponse | null>(null)

  renderCount.current++

  const fetchData = useCallback(async () => {
    try {
      const data = await http.get('/api/data')
      setResult(data)
    } catch {
      // ignore
    }
  }, [http])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div>
      <h1>useHttp Stable Reference Test</h1>
      <div id="render-count">Render count: {renderCount.current}</div>
      {http.recentlySuccessful && <div id="recently-successful">Recently successful</div>}
      {result && <div id="result">Items: {result.items.join(', ')}</div>}
    </div>
  )
}
