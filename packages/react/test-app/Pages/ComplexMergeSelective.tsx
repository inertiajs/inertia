import { router } from '@inertiajs/react'

export default ({
  mixed,
}: {
  mixed: {
    name: string
    users: string[]
    chat: { data: number[] }
  }
}) => {
  const reload = () => {
    router.reload({
      only: ['mixed'],
    })
  }

  return (
    <div>
      <div>name is {mixed.name}</div>
      <div>users: {mixed.users.join(', ')}</div>
      <div>chat.data: {mixed.chat.data.join(', ')}</div>
      <button onClick={reload}>Reload</button>
    </div>
  )
}
