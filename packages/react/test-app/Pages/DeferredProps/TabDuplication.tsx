import { Deferred, usePage } from '@inertiajs/react'

const Message = () => {
  const { message } = usePage<{ message?: string }>().props

  return <div id="message">{message}</div>
}

export default () => {
  return (
    <Deferred data="message" fallback={<div id="fallback">Loading message...</div>}>
      <Message />
    </Deferred>
  )
}
