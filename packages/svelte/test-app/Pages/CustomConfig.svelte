<script lang="ts">
  import type { VisitOptions } from '@inertiajs/core'
  import { config, Link, useForm, page } from '@inertiajs/svelte'

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
</script>

<Link prefetch href="/dump/get">Prefetch Link</Link>
<Link method="post" headers={{ 'X-From-Link': 'foo' }} href="/dump/post">Post Dump</Link>
<button onclick={submit}>Submit Form</button>
{#if form.recentlySuccessful}
  <p>Form was recently successful!</p>
{/if}
