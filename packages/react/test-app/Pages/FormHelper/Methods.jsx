import { useForm } from '@inertiajs/react'

export default (props) => {
  const form = useForm({ name: 'foo', remember: false })

  const postForm = () => {
    form.post('/dump/post')
  }

  const putForm = () => {
    form.put('/dump/put')
  }

  const patchForm = () => {
    form.patch('/dump/patch')
  }

  const deleteForm = () => {
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
          value={form.data.name}
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

      <span onClick={postForm} className="post">
        POST form
      </span>
      <span onClick={putForm} className="put">
        PUT form
      </span>
      <span onClick={patchForm} className="patch">
        PATCH form
      </span>
      <span onClick={deleteForm} className="delete">
        DELETE form
      </span>
    </div>
  )
}
