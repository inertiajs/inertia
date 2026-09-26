import { router } from '@inertiajs/react'

export default () => {
  const complete = () => {
    router.post('/layers/prompt/complete')
  }

  return (
    <>
      <div id="prompt-page">Sudo prompt</div>

      <button onClick={complete}>Complete the prompt</button>
    </>
  )
}
