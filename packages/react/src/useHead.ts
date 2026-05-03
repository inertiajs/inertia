import { use, useEffect, useMemo } from 'react'
import HeadContext from './HeadContext'

export default function useHead(schema: any): void {
  const headManager = use(HeadContext)
  const provider = useMemo(() => headManager!.createProvider(), [headManager])

  useEffect(() => {
    provider.reconnect()
    provider.update(schema)
    return () => {
      provider.disconnect()
    }
  }, [provider, schema])

  if (typeof window === 'undefined') {
    provider.update(schema)
  }
}
