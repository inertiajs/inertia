import { router, WhenVisible } from '@inertiajs/react'

interface Props {
  firstData?: {
    text: string
  }
  secondData?: {
    text: string
  }
}

export default ({ firstData, secondData }: Props) => {
  const handleReload = () => {
    router.reload()
  }

  return (
    <div>
      <h1>WhenVisible + Array Props + Reload</h1>

      <button onClick={handleReload}>Reload Page</button>

      <div style={{ marginTop: '2000px', padding: '20px', border: '1px solid #ccc' }}>
        <WhenVisible data={['firstData', 'secondData']} fallback={<p>Loading array data...</p>}>
          <div>
            <p>{firstData?.text}</p>
            <p>{secondData?.text}</p>
          </div>
        </WhenVisible>
      </div>
    </div>
  )
}
