export default function StreamingIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-start ${className}`}>
      <div className="mr-auto flex max-w-[80%] items-start">
        <div className="min-w-0 flex-1">
          <div className="py-2 text-[15px] leading-relaxed text-gray-800">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500"></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
