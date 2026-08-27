import { router } from '@inertiajs/react'

export default ({
  safe,
  big,
  negative,
  nested,
  huge,
  collision,
}: {
  safe: number
  big: bigint
  negative: bigint
  nested: { deep: bigint[] }
  huge: bigint
  collision?: any
}) => {
  const loadReloadData = () => router.get('/bigint/reload')
  const loadCollisionData = () => router.get('/bigint/collision')
  const submitEcho = () => router.post('/bigint/echo', { value: 111222333444555666n })

  return (
    <div>
      <p>
        safe: <span id="safe">{String(safe)}</span> (<span id="safe-type">{typeof safe}</span>)
      </p>
      <p>
        big: <span id="big">{String(big)}</span> (<span id="big-type">{typeof big}</span>)
      </p>
      <p>
        negative: <span id="negative">{String(negative)}</span>
      </p>
      <p>
        huge: <span id="huge">{String(huge)}</span>
      </p>
      <p>
        nested: <span id="nested">{nested.deep.map(String).join(',')}</span>
      </p>
      {collision && (
        <p>
          collision: <span id="collision">{typeof collision === 'object' ? collision.$bigint : String(collision)}</span>{' '}
          (<span id="collision-type">{typeof collision}</span>)
        </p>
      )}

      <button onClick={loadReloadData}>Load reload data</button>
      <button onClick={loadCollisionData}>Load collision data</button>
      <button onClick={submitEcho}>Submit echo</button>
    </div>
  )
}
