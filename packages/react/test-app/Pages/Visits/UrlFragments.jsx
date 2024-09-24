import { router } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default (props) => {
  const [documentScrollTop, setDocumentScrollTop] = useState(0)
  const [documentScrollLeft, setDocumentScrollLeft] = useState(0)

  const handleScrollEvent = () => {
    setDocumentScrollLeft(document.documentElement.scrollLeft)
    setDocumentScrollTop(document.documentElement.scrollTop)
  }

  useEffect(() => {
    document.addEventListener('scroll', handleScrollEvent)

    return () => {
      document.removeEventListener('scroll', handleScrollEvent)
    }
  })

  const basicVisit = () => {
    router.visit('/visits/url-fragments#target')
  }

  const fragmentVisit = () => {
    router.visit('#target')
  }

  const nonExistentFragmentVisit = () => {
    router.visit('/visits/url-fragments#non-existent-fragment')
  }

  const basicGetVisit = () => {
    router.get('/visits/url-fragments#target')
  }

  const fragmentGetVisit = () => {
    router.get('#target')
  }

  const nonExistentFragmentGetVisit = () => {
    router.get('/visits/url-fragments#non-existent-fragment')
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates url fragment behaviour using manual visits</span>
      <div
        style={{
          width: '200vw',
          height: '200vh',
          marginTop: '50vh',
        }}
      >
        {/* prettier-ignore */}
        <div className="document-position">Document scroll position is {documentScrollLeft} & {documentScrollTop}</div>
        <span onClick={basicVisit} className="basic">
          Basic visit
        </span>
        <span onClick={fragmentVisit} className="fragment">
          Fragment visit
        </span>
        <span onClick={nonExistentFragmentVisit} className="non-existent-fragment">
          Non-existent fragment visit
        </span>

        <span onClick={basicGetVisit} className="basic-get">
          Basic GET visit
        </span>
        <span onClick={fragmentGetVisit} className="fragment-get">
          Fragment GET visit
        </span>
        <span onClick={nonExistentFragmentGetVisit} className="non-existent-fragment-get">
          Non-existent fragment visit
        </span>

        <div id="target">This is the element with id 'target'</div>
      </div>
    </div>
  )
}
