import { Link, router } from '@inertiajs/react'
import { UIEvent, useEffect, useState } from 'react'

const rows = Array.from({ length: 100 }, (_, index) => `Row ${index + 1}`)

export default () => {
  const [firstVisibleRow, setFirstVisibleRow] = useState(0)

  useEffect(() => {
    router.remember(firstVisibleRow, 'firstVisibleRow')
  }, [firstVisibleRow])

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    setFirstVisibleRow(Math.floor(event.currentTarget.scrollTop / 40))
  }

  return (
    <div>
      <Link href="/dump/get">Navigate away</Link>
      <p>First visible row: {firstVisibleRow}</p>
      <div id="rows" scroll-region="" style={{ height: '200px', overflowY: 'auto' }} onScroll={onScroll}>
        {rows.map((row) => (
          <div key={row} style={{ height: '40px' }}>
            {row}
          </div>
        ))}
      </div>
    </div>
  )
}
