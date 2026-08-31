import { Form, Link, useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({ name: 'foo' }).preventNavigationWhenDirty()

  return (
    <div>
      <div id="dirty-status">Form is {form.isDirty ? 'dirty' : 'clean'}</div>

      <label>
        Name
        <input
          type="text"
          id="name"
          value={form.data.name}
          onChange={(e) => form.setData('name', e.target.value)}
        />
      </label>

      <button type="button" className="submit" onClick={() => form.post('/form-helper/prevent-navigation-when-dirty')}>
        Submit form
      </button>

      <Link href="/form-helper/data" id="navigate-away">
        Navigate away
      </Link>

      <Form
        action="/form-helper/prevent-navigation-when-dirty"
        method="post"
        preventNavigationWhenDirty
        id="guarded-form"
      >
        {({ isDirty, processing }) => (
          <>
            <div id="form-component-dirty-status">Form component is {isDirty ? 'dirty' : 'clean'}</div>
            <input type="text" name="title" id="form-title" defaultValue="initial" />
            <button type="submit" disabled={processing}>
              Submit guarded form
            </button>
          </>
        )}
      </Form>

      <Link href="/form-helper/data" id="navigate-away-from-form">
        Navigate away from form
      </Link>
    </div>
  )
}
