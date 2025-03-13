import { router } from '@inertiajs/react'

export default (props) => {
  const visitMethod = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('foo', 'visit')
    router.visit('/dump/post', { method: 'post', data: formData })
  }

  const postMethod = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('baz', 'post')
    router.post('/dump/post', formData)
  }

  const putMethod = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('foo', 'put')
    router.put('/dump/put', formData)
  }

  const patchMethod = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('bar', 'patch')
    router.patch('/dump/patch', formData)
  }

  const deleteMethod = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('baz', 'delete')
    router.delete('/dump/delete', { data: formData })
  }

  return (
    <div>
      <span className="text">
        This is the page that demonstrates manual visit data passing through FormData objects
      </span>

      <a href="#" onClick={visitMethod} className="visit">
        Visit Link
      </a>
      <a href="#" onClick={postMethod} className="post">
        POST Link
      </a>
      <a href="#" onClick={putMethod} className="put">
        PUT Link
      </a>
      <a href="#" onClick={patchMethod} className="patch">
        PATCH Link
      </a>
      <a href="#" onClick={deleteMethod} className="delete">
        DELETE Link
      </a>
    </div>
  )
}
