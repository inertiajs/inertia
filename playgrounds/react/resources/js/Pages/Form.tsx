import { Head, useForm } from '@inertiajs/react'
import Layout from '../Components/Layout.jsx'

const Form = () => {
  const form = useForm('NewUser', {
    name: '',
    company: '',
    role: '',
  })

  function submit(e) {
    e.preventDefault()
    form.post('/user')
  }

  return (
    <>
      <Head title="Form" />
      <h1 className="text-3xl">Form</h1>
      <form onSubmit={submit} className="mt-6 max-w-md space-y-4">
        <div>
          <label className="block" htmlFor="name">
            Name:
          </label>
          <input
            type="text"
            value={form.data.name}
            onChange={(e) => form.setData('name', e.target.value)}
            id="name"
            className="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          />
          {form.errors.name && <div className="mt-2 text-sm text-red-600">{form.errors.name}</div>}
        </div>
        <div>
          <label className="block" htmlFor="company">
            Company:
          </label>
          <input
            type="text"
            value={form.data.company}
            onChange={(e) => form.setData('company', e.target.value)}
            id="company"
            className="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          />
          {form.errors.company && <div className="mt-2 text-sm text-red-600">{form.errors.company}</div>}
        </div>
        <div>
          <label className="block" htmlFor="role">
            Role:
          </label>
          <select
            value={form.data.role}
            onChange={(e) => form.setData('role', e.target.value)}
            id="role"
            className="mt-1 w-full appearance-none rounded border px-2 py-1 shadow-sm"
          >
            <option></option>
            <option>User</option>
            <option>Admin</option>
            <option>Super</option>
          </select>
          {form.errors.role && <div className="mt-2 text-sm text-red-600">{form.errors.role}</div>}
        </div>
        <div>
          <button type="submit" disabled={form.processing} className="rounded bg-slate-800 px-6 py-2 text-white">
            Submit
          </button>
        </div>
      </form>
    </>
  )
}

Form.layout = (page) => <Layout children={page} />

export default Form
