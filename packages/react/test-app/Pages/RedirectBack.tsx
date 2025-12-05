import { router } from '@inertiajs/react'

export default () => {
  const submitWithRedirectBack = () => {
    router.post(
      '/redirect-back/submit',
      {},
      {
        redirectBack: true,
      },
    )
  }

  const submitWithoutRedirectBack = () => {
    router.post('/redirect-back/submit')
  }

  return (
    <div>
      <p>This is the page that demonstrates the redirectBack option</p>

      <button onClick={submitWithRedirectBack}>Submit with redirectBack</button>
      <button onClick={submitWithoutRedirectBack}>Submit without redirectBack</button>
    </div>
  )
}
