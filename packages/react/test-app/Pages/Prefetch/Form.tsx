import { Link, useForm } from '@inertiajs/react'

export default ({ randomValue }: { randomValue: number }) => {
  const { post } = useForm({})

  const submit = () => {
    post('/prefetch/redirect-back')
  }

  return (
    <div>
      <p>
        Random Value: <span className="random-value">{randomValue}</span>
      </p>
      <button onClick={submit}>Submit Form</button>
      <Link href="/prefetch/test-page">Back to Test Page</Link>
    </div>
  )
}
