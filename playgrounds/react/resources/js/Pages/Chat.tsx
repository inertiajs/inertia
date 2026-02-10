import { Head, InfiniteScroll, router } from '@inertiajs/react'
import { useStream } from '@laravel/stream-react'
import { FormEvent, useMemo, useRef, useState } from 'react'
import Layout from '../Components/Layout'
import MessageComponent, { Message } from '../Components/Message'
import PaperAirplaneIcon from '../Components/PaperAirplaneIcon'
import Spinner from '../Components/Spinner'
import StreamingIndicator from '../Components/StreamingIndicator'
import Textarea from '../Components/Textarea'

const Chat = ({
  messages = { data: [] },
}: {
  messages?: {
    data: Message[]
  }
}) => {
  const [newPrompt, setNewPrompt] = useState('')
  const [pendingResponse, setPendingResponse] = useState('')
  const [requestCount, setRequestCount] = useState(0)
  const scrollContainer = useRef<HTMLDivElement>(null)

  const { isFetching, isStreaming, send } = useStream('messages', {
    csrfToken: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') as string,
    onData: (data) => setPendingResponse((prev) => prev + data),
    onFinish: () => {
      router.prependToProp('messages.data', {
        id: Date.now(),
        content: pendingResponse,
        type: 'response',
      })

      setPendingResponse('')
    },
  })

  const canSendPrompt = !!newPrompt.trim() && !isFetching && !isStreaming

  const sendMessage = (e: FormEvent) => {
    e.preventDefault()

    if (!canSendPrompt) {
      return
    }

    setRequestCount((prev) => prev + 1)

    router.prependToProp(
      'messages.data',
      {
        id: Date.now(),
        content: newPrompt,
        type: 'prompt',
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            scrollContainer.current?.scrollTo({
              top: scrollContainer.current.scrollHeight,
              behavior: 'smooth',
            })
          })

          send({ message: newPrompt })

          setNewPrompt('')
        },
      },
    )
  }

  const reversedMessages = useMemo(() => {
    const msgs = [...messages.data].reverse()

    if (pendingResponse) {
      msgs.push({
        id: 'pending',
        content: pendingResponse,
        type: 'response',
      })
    }

    return msgs
  }, [messages.data, pendingResponse])

  const isLastMessage = (message: Message) => {
    return message === reversedMessages[reversedMessages.length - 1]
  }

  return (
    <>
      <Head title="Chat" />

      <div className="relative flex h-[calc(100vh-80px)] flex-col bg-gray-50">
        <div ref={scrollContainer} className="h-full flex-1 overflow-y-auto">
          <InfiniteScroll
            reverse
            data="messages"
            className="mx-auto grid max-w-3xl gap-6 px-8 py-16"
            loading={({ loadingNext }) => (
              <div className={`flex justify-center ${loadingNext ? 'pt-16' : 'pb-16'}`}>
                <Spinner className="size-6 text-gray-400" />
              </div>
            )}
          >
            {reversedMessages.map((message) => (
              <div
                key={message.id}
                className={isLastMessage(message) && requestCount > 0 ? 'min-h-[calc(100vh-80px-131px-64px)]' : ''}
              >
                <MessageComponent message={message} />
                {isLastMessage(message) && isFetching && <StreamingIndicator className="mt-6" />}
              </div>
            ))}
          </InfiniteScroll>
        </div>

        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-8 py-6">
          <form
            onSubmit={sendMessage}
            className="relative mx-auto flex max-w-3xl items-end rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition-colors focus-within:border-gray-400"
          >
            <Textarea
              value={newPrompt}
              onChange={setNewPrompt}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(e as any)
                } else if (e.key === 'Enter' && e.shiftKey) {
                  e.preventDefault()
                  setNewPrompt((prev) => prev + '\n')
                }
              }}
            />

            <button
              type="submit"
              disabled={!canSendPrompt}
              className="ml-3 flex size-8 items-center justify-center rounded-lg bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetching || isStreaming ? (
                <Spinner className="size-4 text-white" />
              ) : (
                <PaperAirplaneIcon className="size-4 rotate-270 text-white" />
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

Chat.layout = [Layout, { padding: false }]

export default Chat
