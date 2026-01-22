import { useHttp } from '@inertiajs/react'
import { useState } from 'react'

interface TransformResponse {
  success: boolean
  received: Record<string, any>
}

export default () => {
  const transformTest = useHttp<{ name: string; email: string }, TransformResponse>({
    name: '',
    email: '',
  })

  const [lastTransformResponse, setLastTransformResponse] = useState<TransformResponse | null>(null)

  const performTransform = async () => {
    try {
      transformTest.transform((data) => ({
        transformed_name: data.name.toUpperCase(),
        transformed_email: data.email.toLowerCase(),
        original_name: data.name,
      }))
      const result = await transformTest.post('/api/transform')
      setLastTransformResponse(result)
    } catch (e) {
      console.error('Transform failed:', e)
    }
  }

  return (
    <div>
      <h1>useHttp Transform Test</h1>

      {/* Transform Test */}
      <section id="transform-test">
        <h2>Transform</h2>
        <label>
          Name
          <input
            type="text"
            id="transform-name"
            value={transformTest.data.name}
            onChange={(e) => transformTest.setData('name', e.target.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            id="transform-email"
            value={transformTest.data.email}
            onChange={(e) => transformTest.setData('email', e.target.value)}
          />
        </label>
        <button onClick={performTransform} id="transform-button">
          Submit with Transform
        </button>
        {lastTransformResponse && (
          <div id="transform-result">
            Transformed Name: {lastTransformResponse.received.transformed_name}
            <br />
            Transformed Email: {lastTransformResponse.received.transformed_email}
            <br />
            Original Name: {lastTransformResponse.received.original_name}
          </div>
        )}
      </section>
    </div>
  )
}
