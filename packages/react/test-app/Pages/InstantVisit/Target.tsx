export default ({
  greeting,
  timestamp,
  auth,
  errors,
}: {
  greeting?: string
  timestamp?: number
  auth?: { user: string }
  errors?: Record<string, string>
}) => {
  return (
    <div>
      <div id="target">This is Target</div>
      <div id="greeting">Greeting: {greeting ?? 'none'}</div>
      <div id="timestamp">Timestamp: {timestamp ?? 'none'}</div>
      <div id="auth">Auth: {auth?.user ?? 'none'}</div>
      <div id="errors">Errors: {Object.keys(errors ?? {}).length > 0 ? JSON.stringify(errors) : 'none'}</div>
    </div>
  )
}
