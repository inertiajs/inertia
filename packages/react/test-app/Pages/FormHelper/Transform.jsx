import { useForm } from '@inertiajs/react'

export default (props) => {
  const form = useForm({ name: 'foo', remember: false })

  const postForm = () => {
    form.transform((data) => ({ ...data, name: 'bar' }))
    form.post('/dump/post')
  }

  const putForm = () => {
    form.transform((data) => ({ ...data, name: 'baz' }))
    form.put('/dump/put')
  }

  const patchForm = () => {
    form.transform((data) => ({ ...data, name: 'foo' }))
    form.patch('/dump/patch')
  }

  const deleteForm = () => {
    form.transform((data) => ({ ...data, name: 'bar' }))
    form.delete('/dump/delete')
  }

  return (
    <div>
      <label>
        Full Name
        <input
          type="text"
          id="name"
          name="name"
          onChange={(e) => form.setData('name', e.target.value)}
          value={form.name}
        />
      </label>
      <label>
        Remember Me
        <input
          type="checkbox"
          id="remember"
          name="remember"
          onChange={(e) => form.setData('remember', e.target.checked)}
          checked={form.remember}
        />
      </label>

      <button onClick={postForm} className="post">
        POST form
      </button>
      <button onClick={putForm} className="put">
        PUT form
      </button>
      <button onClick={patchForm} className="patch">
        PATCH form
      </button>
      <button onClick={deleteForm} className="delete">
        DELETE form
      </button>
    </div>
  )
}
