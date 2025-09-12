import { Link, useForm } from '@inertiajs/react'

export default ({ randomValue }: { randomValue: number }) => {
  const { post } = useForm({})

  const submitToSame = () => {
    post('/prefetch/form')
  }

  const submitToOther = () => {
    post('/prefetch/redirect-back')
  }

  return (
    <div>
      <p>
        Random Value: <span className="random-value">{randomValue}</span>
      </p>
      <button onClick={submitToSame}>Submit to Same URL</button>
      <button onClick={submitToOther}>Submit to Other URL</button>
      <Link href="/prefetch/test-page">Back to Test Page</Link>
    </div>
  )
}
