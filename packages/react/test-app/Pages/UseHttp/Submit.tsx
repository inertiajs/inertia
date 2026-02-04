import { useHttp } from '@inertiajs/react'
import { useState } from 'react'

interface UserResponse {
  success: boolean
  id: number
  user: {
    name: string
    email: string
  }
}

export default () => {
  const form = useHttp<{ name: string; email: string }, UserResponse>('post', '/api/users', {
    name: '',
    email: '',
  })

  const [submitResult, setSubmitResult] = useState<UserResponse | null>(null)
  const [submitWithMethodResult, setSubmitWithMethodResult] = useState<UserResponse | null>(null)
  const [submitWithWayfinderResult, setSubmitWithWayfinderResult] = useState<UserResponse | null>(null)

  const performSubmit = async () => {
    try {
      const result = await form.submit()
      setSubmitResult(result)
    } catch (e) {
      console.error('Submit failed:', e)
    }
  }

  const performSubmitWithMethod = async () => {
    try {
      const result = await form.submit('put', '/api/users/99')
      setSubmitWithMethodResult(result)
    } catch (e) {
      console.error('Submit with method failed:', e)
    }
  }

  const performSubmitWithWayfinder = async () => {
    try {
      const result = await form.submit({ method: 'patch', url: '/api/users/88' })
      setSubmitWithWayfinderResult(result)
    } catch (e) {
      console.error('Submit with wayfinder failed:', e)
    }
  }

  return (
    <div>
      <h1>useHttp Submit Test</h1>

      <label>
        Name
        <input
          type="text"
          id="submit-name"
          value={form.data.name}
          onChange={(e) => form.setData('name', e.target.value)}
        />
      </label>
      <label>
        Email
        <input
          type="email"
          id="submit-email"
          value={form.data.email}
          onChange={(e) => form.setData('email', e.target.value)}
        />
      </label>

      {/* Submit using Wayfinder endpoint */}
      <section id="submit-test">
        <h2>Submit (uses Wayfinder endpoint)</h2>
        <button onClick={performSubmit} id="submit-button">
          Submit
        </button>
        {form.processing && <div id="submit-processing">Processing...</div>}
        {submitResult && (
          <div id="submit-result">
            Submit Success - ID: {submitResult.id}, Name: {submitResult.user.name}, Email: {submitResult.user.email}
          </div>
        )}
      </section>

      {/* Submit with explicit method and URL */}
      <section id="submit-method-test">
        <h2>Submit with method and URL</h2>
        <button onClick={performSubmitWithMethod} id="submit-method-button">
          Submit (PUT /api/users/99)
        </button>
        {submitWithMethodResult && (
          <div id="submit-method-result">
            PUT Success - ID: {submitWithMethodResult.id}, Name: {submitWithMethodResult.user.name}, Email:{' '}
            {submitWithMethodResult.user.email}
          </div>
        )}
      </section>

      {/* Submit with UrlMethodPair object */}
      <section id="submit-wayfinder-test">
        <h2>Submit with UrlMethodPair</h2>
        <button onClick={performSubmitWithWayfinder} id="submit-wayfinder-button">
          Submit (PATCH /api/users/88)
        </button>
        {submitWithWayfinderResult && (
          <div id="submit-wayfinder-result">
            PATCH Success - ID: {submitWithWayfinderResult.id}, Name: {submitWithWayfinderResult.user.name}, Email:{' '}
            {submitWithWayfinderResult.user.email}
          </div>
        )}
      </section>
    </div>
  )
}
