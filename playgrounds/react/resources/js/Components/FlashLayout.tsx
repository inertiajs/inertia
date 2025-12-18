import { router } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import Layout from './Layout'

export default function FlashLayout({ children }: { children: React.ReactNode }) {
  const [flashLog, setFlashLog] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    return router.on('flash', (event) => {
      setFlashLog((prev) => [...prev, event.detail.flash])
    })
  }, [])

  return (
    <Layout>
      {children}

      <div className="mt-8 border-t pt-6">
        <h2 className="text-lg font-semibold text-red-600">Flash Events (from Layout)</h2>
        <pre className="mt-2 rounded-sm bg-red-50 p-3 text-sm">
          {JSON.stringify(flashLog.length ? flashLog : 'No flash events yet', null, 2)}
        </pre>
        <p className="mt-2 text-sm text-gray-600">
          Layout flash event count: <strong>{flashLog.length}</strong>
        </p>
      </div>
    </Layout>
  )
}
