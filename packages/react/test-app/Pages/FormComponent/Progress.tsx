import { Form } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'

export default () => {
  const [showProgress, setShowProgress] = useState<boolean | undefined>(undefined)
  const [nprogressVisible, setNprogressVisible] = useState(false)
  const [nprogressAppearances, setNprogressAppearances] = useState(0)

  const observerRef = useRef<MutationObserver | null>(null)

  function disableProgress() {
    setShowProgress(false)
  }

  useEffect(() => {
    observerRef.current = new MutationObserver(() => {
      const nprogressElement = document.querySelector('#nprogress') as HTMLElement | null
      const nprogressIsCurrentlyVisible =
        nprogressElement &&
        ('popover' in HTMLElement.prototype
          ? nprogressElement.matches(':popover-open')
          : nprogressElement.style.display !== 'none')

      if (nprogressIsCurrentlyVisible) {
        if (!nprogressVisible) {
          setNprogressVisible(true)
          setNprogressAppearances((previousCount) => previousCount + 1)
        }
      } else {
        setNprogressVisible(false)
      }
    })

    observerRef.current.observe(document.body, { childList: true, subtree: true })

    return () => observerRef.current?.disconnect()
  }, [nprogressVisible])

  return (
    <Form action="/form-component/progress" method="post" showProgress={showProgress}>
      <h1>Progress</h1>

      <div>
        Nprogress appearances: <span id="nprogress-appearances">{nprogressAppearances}</span>
      </div>

      <div>
        <button type="button" onClick={disableProgress}>
          Disable Progress
        </button>
        <button type="submit">Submit</button>
      </div>
    </Form>
  )
}
