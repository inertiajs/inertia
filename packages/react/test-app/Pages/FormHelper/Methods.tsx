import { useForm } from '@inertiajs/react'

export default ({}) => {
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

  const submitForm = () => {
    form.submit('post', '/dump/post')
  }

  const submitFormObject = () => {
    form.submit({
      url: '/dump/post',
      method: 'post',
    })
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
          // @ts-expect-error - Testing direct property access instead of form.data.remember
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
      <button onClick={submitForm} className="submit">
        SUBMIT form
      </button>
      <button onClick={submitFormObject} className="submit-object">
        SUBMIT OBJECT form
      </button>
    </div>
  )
}
