import { Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default () => {
  const [documentScrollTop, setDocumentScrollTop] = useState(0)
  const [documentScrollLeft, setDocumentScrollLeft] = useState(0)

  useEffect(() => {
    document.addEventListener('scroll', handleScrollEvent)
  })

  const handleScrollEvent = () => {
    setDocumentScrollTop(document.documentElement.scrollTop)
    setDocumentScrollLeft(document.documentElement.scrollLeft)
  }

  return (
    <div>
      <span className="text">This is the links page that demonstrates url fragment behaviour</span>
      <div style={{ width: '200vw', height: '200vh', marginTop: '50vh' }}>
        <button onClick={handleScrollEvent}>Update scroll positions</button>
        {/* prettier-ignore */}
        <div className="document-position">
          Document scroll position is {documentScrollLeft} & {documentScrollTop}
        </div>
        <Link href="/links/url-fragments#target" className="basic">
          Basic link
        </Link>
        <Link href="#target" className="fragment">
          Fragment link
        </Link>
        <Link href="/links/url-fragments#non-existent-fragment" className="non-existent-fragment">
          Non-existent fragment link
        </Link>

        <div id="target">This is the element with id 'target'</div>
      </div>
    </div>
  )
}
