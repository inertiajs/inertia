import { usePage } from '@inertiajs/react'
import { useEffect } from 'react'

export default (props) => {
  const page = usePage()

  const dump = {
    headers: props.headers,
    method: props.method,
    form: props.form,
    files: props.files ? props.files : {},
    query: props.query,
    $page: page,
  }

  useEffect(() => {
    window._inertia_request_dump = {
      headers: props.headers,
      method: props.method,
      form: props.form,
      files: props.files ? props.files : {},
      query: props.query,
      $page: page,
    }
  }, [])

  return (
    <div>
      <div className="text">This is Inertia page component containing a data dump of the request</div>
      <hr />
      <pre className="dump">{JSON.stringify(dump, null, 2)}</pre>
    </div>
  )
}
