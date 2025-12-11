import { Link, WhenVisible } from '@inertiajs/react'

export default ({
  lazyData,
}: {
  lazyData?: {
    text: string
  }
}) => {
  return (
    <div>
      <h1>WhenVisible + Back Button</h1>

      <Link href="/links/method">Navigate Away</Link>

      <div style={{ marginTop: '2000px', padding: '20px', border: '1px solid #ccc' }}>
        <WhenVisible data="lazyData" fallback={<p>Loading lazy data...</p>}>
          <p>{lazyData?.text}</p>
        </WhenVisible>
      </div>

      <div style={{ marginTop: '2000px', padding: '20px', border: '1px solid #ccc' }}>
        <WhenVisible data="lazyData" always fallback={<p>Loading always data...</p>}>
          <p>Always: {lazyData?.text}</p>
        </WhenVisible>
      </div>
    </div>
  )
}
