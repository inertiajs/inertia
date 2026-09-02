import { useState } from 'react'

let mutated = false

export default () => {
  const [settled, setSettled] = useState(false)
  const [historyDelta, setHistoryDelta] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  if (typeof window !== 'undefined' && !mutated) {
    mutated = true

    // Simulate an app (or third-party library) that adds a query param via the
    // History API while the page is mounting, before Inertia's queued initial
    // history write has flushed.
    const historyLengthAtMount = window.history.length
    window.history.replaceState(window.history.state, '', '/url-on-mount?step=1')

    document.addEventListener(
      'inertia:navigate',
      () => {
        setHistoryDelta(window.history.length - historyLengthAtMount)
        setSearch(window.location.search)
        setSettled(true)
      },
      { once: true },
    )
  }

  return (
    <div>
      <h1>Url On Mount</h1>
      {settled && (
        <div id="settled">
          <span className="search">{search}</span>
          <span className="history-delta">{historyDelta}</span>
        </div>
      )}
    </div>
  )
}
