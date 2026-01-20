import { useEffect, useRef } from 'react'

function autosize(element: HTMLTextAreaElement) {
  element.style.height = 'auto'
  element.style.height = element.scrollHeight + 'px'
}

export default function Textarea({
  value,
  onChange,
  placeholder,
  onKeyDown,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  className?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current)
    }
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      className={`block w-full resize-none border-0 bg-transparent py-1 text-[16px] text-gray-900 placeholder-gray-500 outline-none ${className}`}
    />
  )
}
