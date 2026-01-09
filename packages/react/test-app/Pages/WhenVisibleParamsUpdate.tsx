import { WhenVisible } from '@inertiajs/react'
import { useState } from 'react'

export default ({ lazyData }: { lazyData?: { text: string } }) => {
  const [paramValue, setParamValue] = useState('initial')

  return (
    <div>
      <button onClick={() => setParamValue('updated')}>Update Param</button>
      <p>Current param: {paramValue}</p>

      <div style={{ marginTop: '3000px' }}>
        <WhenVisible data="lazyData" params={{ data: { paramValue } }} always fallback={<p>Loading lazy data...</p>}>
          <div>
            <p>Data loaded: {lazyData?.text}</p>
          </div>
        </WhenVisible>
      </div>
    </div>
  )
}
