import { router } from '@inertiajs/react'

export default ({ message }: { message: string }) => {
  const clientVisit = () => {
    router.push({
      url: '/history/non-serializable/landed',
      component: 'History/NonSerializableTarget',
      props: { message: 'Client visit landed' },
    })
  }

  return (
    <>
      <button onClick={clientVisit}>Client visit</button>

      <div>{message}</div>
    </>
  )
}
