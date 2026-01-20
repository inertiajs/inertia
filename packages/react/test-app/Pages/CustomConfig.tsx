import type { VisitOptions } from '@inertiajs/core'
import { config, Link, useForm, usePage } from '@inertiajs/react'

export default () => {
  const page = usePage()
  const form = useForm({})

  const submit = () => {
    form.post(page.url)
  }

  config.set({
    'form.recentlySuccessfulDuration': 1000,
    'prefetch.cacheFor': '2s',
  })

  config.set('visitOptions', (href: string, options: VisitOptions) => {
    if (href !== '/dump/post') {
      return {}
    }

    return { headers: { ...options.headers, 'X-From-Callback': 'bar' } }
  })

  return (
    <div>
      <Link prefetch href="/dump/get">
        Prefetch Link
      </Link>
      <Link method="post" headers={{ 'X-From-Link': 'foo' }} href="/dump/post">
        Post Dump
      </Link>
      <button onClick={submit}>Submit Form</button>
      {form.recentlySuccessful && <p>Form was recently successful!</p>}
    </div>
  )
}
