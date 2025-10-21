import type { Method } from '@inertiajs/core'
import { usePage } from '@inertiajs/react'
import { useEffect, useMemo } from 'react'
import type { MulterFile } from '../types'

export default ({
  headers,
  method,
  form,
  query,
  url,
  files,
}: {
  headers: Record<string, string>
  method: Method
  form: Record<string, unknown>
  query: Record<string, unknown>
  url: string
  files: MulterFile[] | object
}) => {
  const page = usePage()

  const dump = useMemo(
    () => ({
      headers,
      method,
      form,
      files: files ? files : {},
      query,
      url,
      $page: page,
    }),
    [headers, method, form, files, query, url, page],
  )

  useEffect(() => {
    window._inertia_request_dump = dump
  }, [dump])

  return (
    <div>
      <div className="text">This is Inertia page component containing a data dump of the request</div>
      <hr />
      <pre className="dump">{JSON.stringify(dump, null, 2)}</pre>
    </div>
  )
}
