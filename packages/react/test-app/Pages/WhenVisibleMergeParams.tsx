import { WhenVisible } from '@inertiajs/react'

export default ({
  dataOnlyProp,
  mergedProp,
  mergedWithCallbackProp,
}: {
  dataOnlyProp?: { text: string }
  mergedProp?: { text: string }
  mergedWithCallbackProp?: { text: string }
}) => {
  return (
    <>
      <div id="data-only" style={{ marginTop: '3000px' }}>
        <WhenVisible data="dataOnlyProp" fallback={<div>Loading data only...</div>}>
          <div>Data only loaded: {dataOnlyProp?.text}</div>
        </WhenVisible>
      </div>

      <div id="merged" style={{ marginTop: '5000px' }}>
        <WhenVisible
          data="mergedProp"
          params={{
            data: { extra: 'from-params' },
          }}
          fallback={<div>Loading merged...</div>}
        >
          <div>Merged loaded: {mergedProp?.text}</div>
        </WhenVisible>
      </div>

      <div id="merged-with-callback" style={{ marginTop: '5000px' }}>
        <WhenVisible
          data="mergedWithCallbackProp"
          params={{
            data: { page: '2' },
            preserveUrl: true,
          }}
          fallback={<div>Loading merged with callback...</div>}
        >
          <div>Merged with callback loaded: {mergedWithCallbackProp?.text}</div>
        </WhenVisible>
      </div>
    </>
  )
}
