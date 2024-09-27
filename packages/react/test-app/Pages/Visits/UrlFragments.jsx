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

  const basicVisit = (e) => {
    e.preventDefault()
    router.visit('/visits/url-fragments#target')
  }

  const fragmentVisit = (e) => {
    e.preventDefault()
    router.visit('#target')
  }

  const nonExistentFragmentVisit = (e) => {
    e.preventDefault()
    router.visit('/visits/url-fragments#non-existent-fragment')
  }

  const basicGetVisit = (e) => {
    e.preventDefault()
    router.get('/visits/url-fragments#target')
  }

  const fragmentGetVisit = (e) => {
    e.preventDefault()
    router.get('#target')
  }

  const nonExistentFragmentGetVisit = (e) => {
    e.preventDefault()
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
        <a href="#" onClick={basicVisit} className="basic">
          Basic visit
        </a>
        <a href="#" onClick={fragmentVisit} className="fragment">
          Fragment visit
        </a>
        <a href="#" onClick={nonExistentFragmentVisit} className="non-existent-fragment">
          Non-existent fragment visit
        </a>

        <a href="#" onClick={basicGetVisit} className="basic-get">
          Basic GET visit
        </a>
        <a href="#" onClick={fragmentGetVisit} className="fragment-get">
          Fragment GET visit
        </a>
        <a href="#" onClick={nonExistentFragmentGetVisit} className="non-existent-fragment-get">
          Non-existent fragment GET visit
        </a>

        <div id="target">This is the element with id 'target'</div>
      </div>
    </div>
  )
}
