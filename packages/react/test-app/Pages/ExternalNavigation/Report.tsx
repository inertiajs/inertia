import { Deferred, Link, router, setLayoutProps, useForm, usePage } from '@inertiajs/react'
import AppLayout from '../../Layouts/AppLayout'

export default function Report({
  report,
  total,
  details,
  optional,
}: {
  report: string
  total: number
  details?: string
  optional?: string
}) {
  const form = useForm('report', { name: '' })
  const page = usePage()

  return (
    <>
      <h1>Report {report}</h1>
      <p>Total: {total}</p>
      <p>Flash: {page.flash.toast?.message || ''}</p>
      <Deferred data="details" fallback={<p>Loading details</p>}>
        <p>{details}</p>
      </Deferred>
      <p>{optional}</p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          form.post(`/external-navigation/${report}`, { preserveScroll: true })
        }}
      >
        <label>
          Name
          <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
        </label>
        <p>{form.errors.name}</p>
        <button disabled={form.processing}>Save report</button>
      </form>
      <button onClick={() => router.reload({ only: ['optional'] })}>Load optional summary</button>
      <button onClick={() => router.reload({ only: ['total'] })}>Refresh total</button>
      <button onClick={() => router.poll(100, { only: ['total'] })}>Start polling</button>
      <button onClick={() => router.post(`/external-navigation/${report}/redirect`)}>Save and open next report</button>
      <button
        onClick={() =>
          router.post(
            `/external-navigation/${report}/destination`,
            {},
            {
              onFlash: () => (document.body.dataset.navigationOrder = 'flash,'),
              onSuccess: () => (document.body.dataset.navigationOrder += 'success,'),
            },
          )
        }
      >
        Save with ordinary response
      </button>
      <button onClick={() => router.replaceProp('total', 999)}>Replace total locally</button>
      <button onClick={() => router.push({ url: '/external-navigation/2' })}>Push next report</button>
      <button onClick={() => setLayoutProps<{ title: string }>({ title: 'Changed layout' })}>Change layout</button>
      <button
        onClick={() => {
          router.replace({
            props: { head: ['<title data-inertia="external-report">Queued head</title>'] },
            onFinish: () => document.getElementById('leave')!.click(),
          })
        }}
      >
        Queue head and close
      </button>
      <Link href="/external-navigation/2">Next report</Link>
      <Link href="/non-inertia">Leave application</Link>
    </>
  )
}

Report.layout = [AppLayout, { title: 'Fresh layout' }]
