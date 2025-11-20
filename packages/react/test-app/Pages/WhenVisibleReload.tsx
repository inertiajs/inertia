import { router, WhenVisible } from '@inertiajs/react'

interface Props {
  lazyData?: {
    text: string
  }
}

export default ({ lazyData }: Props) => {
  const handleReload = () => {
    router.reload()
  }

  return (
    <div>
      <h1>WhenVisible + Reload</h1>

      <button onClick={handleReload}>Reload Page</button>

      <div style={{ marginTop: '2000px', padding: '20px', border: '1px solid #ccc' }}>
        <WhenVisible data="lazyData" fallback={<p>Loading lazy data...</p>}>
          {lazyData?.text}
        </WhenVisible>
      </div>
    </div>
  )
}
