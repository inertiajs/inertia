import { Form, Head, Link, useForm } from '@inertiajs/react'

export default function PreventNavigationWhenDirty() {
  const form = useForm({ name: '' }).preventNavigationWhenDirty()

  return (
    <>
      <Head title="Unsaved Changes" />
      <h1 className="text-3xl">Unsaved Changes</h1>

      <div className="mt-6 max-w-2xl space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-medium">useForm</h2>
          <p className="text-sm text-gray-600">
            Form is{' '}
            <span className={form.isDirty ? 'font-medium text-amber-700' : 'font-medium text-gray-500'}>
              {form.isDirty ? 'dirty' : 'clean'}
            </span>
          </p>

          {form.isDirty && (
            <div className="rounded-sm border border-amber-100 bg-amber-50 p-3 text-amber-800">
              There are unsaved changes!
            </div>
          )}

          <div>
            <label className="block" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={form.data.name}
              onChange={(e) => form.setData('name', e.target.value)}
              className="mt-1 w-full appearance-none rounded-sm border border-gray-200 px-2 py-1 shadow-xs"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              className="rounded-sm bg-slate-800 px-6 py-2 text-white"
              disabled={form.processing}
              onClick={() => form.post('/form/prevent-navigation-when-dirty')}
            >
              Submit
            </button>
            <Link href="/users" className="rounded-sm border border-gray-200 px-6 py-2 hover:bg-gray-50">
              Navigate away
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-medium">&lt;Form&gt; component</h2>

          <Form action="/form/prevent-navigation-when-dirty" method="post" preventNavigationWhenDirty>
            {({ isDirty, processing }) => (
              <>
                <p className="text-sm text-gray-600">
                  Form component is{' '}
                  <span className={isDirty ? 'font-medium text-amber-700' : 'font-medium text-gray-500'}>
                    {isDirty ? 'dirty' : 'clean'}
                  </span>
                </p>

                {isDirty && (
                  <div className="rounded-sm border border-amber-100 bg-amber-50 p-3 text-amber-800">
                    There are unsaved changes!
                  </div>
                )}

                <div>
                  <label className="block" htmlFor="title">
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    defaultValue="initial"
                    className="mt-1 w-full appearance-none rounded-sm border border-gray-200 px-2 py-1 shadow-xs"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="rounded-sm bg-slate-800 px-6 py-2 text-white"
                    disabled={processing}
                  >
                    Submit
                  </button>
                  <Link href="/users" className="rounded-sm border border-gray-200 px-6 py-2 hover:bg-gray-50">
                    Navigate away
                  </Link>
                </div>
              </>
            )}
          </Form>
        </section>

        <section className="rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <h2 className="mb-2 font-medium">How to test</h2>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Edit a field so the form becomes dirty.</li>
            <li>Click “Navigate away” — a browser confirmation should appear.</li>
            <li>Dismiss to stay on this page, or accept to go to Users.</li>
            <li>Submit while dirty — no confirmation should appear.</li>
            <li>Refresh or close the tab while dirty — a beforeunload warning should appear.</li>
          </ol>
        </section>
      </div>
    </>
  )
}
