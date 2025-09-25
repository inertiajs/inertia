export interface Message {
  id: number | string
  type: 'prompt' | 'response'
  html: string
}

export default function MessageComponent({ message }: { message: Message }) {
  return (
    <div
      className={`flex w-full ${
        message.type === 'prompt' ? 'ml-auto justify-end' : 'mr-auto justify-start'
      }`}
    >
      <div className="flex max-w-[80%] items-start">
        <div
          dangerouslySetInnerHTML={{ __html: message.html }}
          className={`prose min-w-0 flex-1 text-[15px] leading-relaxed ${
            message.type === 'prompt'
              ? 'rounded-xl bg-gray-800 px-4 py-2 text-white'
              : 'text-gray-800'
          }`}
        />
      </div>
    </div>
  )
}