<script module lang="ts">
  import AppLayout from '../../Layouts/AppLayout.svelte'

  export const layout = [AppLayout, { title: 'Fresh layout' }]
</script>

<script lang="ts">
  import { Deferred, Link, router, setLayoutProps, useForm, page } from '@inertiajs/svelte'

  let {
    report,
    total,
    details,
    optional,
  }: {
    report: string
    total: number
    details?: string
    optional?: string
  } = $props()
  const form = useForm('report', { name: '' })
</script>

<h1>Report {report}</h1>
<p>Total: {total}</p>
<p>Flash: {page.flash.toast?.message || ''}</p>
<Deferred data="details">
  {#snippet fallback()}<p>Loading details</p>{/snippet}
  <p>{details}</p>
</Deferred>
<p>{optional}</p>
<form
  onsubmit={(event) => {
    event.preventDefault()
    form.post(`/external-navigation/${report}`, { preserveScroll: true })
  }}
>
  <label>Name<input bind:value={form.name} /></label>
  <p>{form.errors.name}</p>
  <button disabled={form.processing}>Save report</button>
</form>
<button onclick={() => router.reload({ only: ['optional'] })}>Load optional summary</button>
<button onclick={() => router.reload({ only: ['total'] })}>Refresh total</button>
<button onclick={() => router.poll(100, { only: ['total'] })}>Start polling</button>
<button onclick={() => router.post(`/external-navigation/${report}/redirect`)}>Save and open next report</button>
<button
  onclick={() =>
    router.post(
      `/external-navigation/${report}/destination`,
      {},
      {
        onFlash: () => (document.body.dataset.navigationOrder = 'flash,'),
        onSuccess: () => (document.body.dataset.navigationOrder += 'success,'),
      },
    )}>Save with ordinary response</button
>
<button onclick={() => router.replaceProp('total', 999)}>Replace total locally</button>
<button onclick={() => router.push({ url: '/external-navigation/2' })}>Push next report</button>
<button onclick={() => setLayoutProps<{ title: string }>({ title: 'Changed layout' })}>Change layout</button>
<button
  onclick={() => {
    router.replace({
      props: { head: ['<title data-inertia="external-report">Queued head</title>'] },
      onFinish: () => document.getElementById('leave')!.click(),
    })
  }}>Queue head and close</button
>
<Link href="/external-navigation/2">Next report</Link>
<Link href="/non-inertia">Leave application</Link>
