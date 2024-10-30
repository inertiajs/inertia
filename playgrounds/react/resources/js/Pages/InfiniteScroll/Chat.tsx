import { Head, InfiniteScroll, InfiniteScrollProp } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import Layout from '../../Components/InfiniteScrollLayout'

const Chat = ({
  messages,
}: {
  messages: InfiniteScrollProp<{
    id: number
    from: string
    body: string
    created_at: string
    updated_at: string
  }>
}) => {
  const [sortedMessages, setSortedMessages] = useState(messages.data)

  useEffect(() => {
    setSortedMessages(
      messages.data.sort((a, b) => {
        return a.created_at.localeCompare(b.created_at)
      }),
    )
  }, [messages])

  return (
    <>
      <Head title="Chat" />
      <h1 className="text-3xl">Chat</h1>
      <div className="mt-6 h-96 w-full max-w-2xl space-y-4 overflow-hidden rounded-lg border-4 border-gray-200">
        <div className="h-full w-full space-y-4 overflow-auto p-6">
          <InfiniteScroll prop="messages" trigger="start" autoScroll fetching={<div>Fetching...</div>}>
            {sortedMessages.map((message) => (
              <div className={message.from === 'Joe' ? 'text-right' : ''} key={message.id}>
                <div
                  className={`relative inline-block rounded-lg p-2 ${message.from === 'Joe' ? 'bg-sky-100' : 'bg-gray-100'}`}
                >
                  <div className={`text-sm uppercase ${message.from === 'Joe' ? 'text-sky-600' : 'text-gray-800'}`}>
                    {message.from}
                  </div>
                  <div>{message.body}</div>
                </div>
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </>
  )
}

Chat.layout = (page) => <Layout children={page} />

export default Chat
