import { useEffect, useState } from 'react'

export default ({ children }: { children: React.ReactNode }) => {
  const [documentScrollTop, setDocumentScrollTop] = useState(0)
  const [documentScrollLeft, setDocumentScrollLeft] = useState(0)
  const [slotScrollTop, setSlotScrollTop] = useState(0)
  const [slotScrollLeft, setSlotScrollLeft] = useState(0)

  const handleScrollEvent = () => {
    setDocumentScrollLeft(document.documentElement.scrollLeft)
    setDocumentScrollTop(document.documentElement.scrollTop)
    const slot = document.getElementById('slot')
    if (slot) {
      setSlotScrollTop(slot.scrollTop)
      setSlotScrollLeft(slot.scrollLeft)
    }
  }

  useEffect(() => {
    document.addEventListener('scroll', handleScrollEvent)

    return () => {
      document.removeEventListener('scroll', handleScrollEvent)
    }
  })

  return (
    <div style={{ width: '200vw' }}>
      <span className="layout-text">With scroll regions</span>
      <button onClick={handleScrollEvent}>Update scroll positions</button>
      <div className="document-position">
        Document scroll position is {documentScrollLeft} & {documentScrollTop}
      </div>
      <div style={{ height: '200vh' }}>
        <span className="slot-position">
          Slot scroll position is {slotScrollLeft} & {slotScrollTop}
        </span>
        <div
          scroll-region=""
          id="slot"
          style={{ height: '100px', width: '500px', overflow: 'scroll' }}
          onScroll={handleScrollEvent}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
