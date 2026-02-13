export default ({ greeting, timestamp }: { greeting?: string; timestamp?: number }) => {
  return (
    <div>
      <div id="target">This is Target</div>
      <div id="greeting">Greeting: {greeting ?? 'none'}</div>
      <div id="timestamp">Timestamp: {timestamp ?? 'none'}</div>
    </div>
  )
}
