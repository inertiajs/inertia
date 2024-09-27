import { router } from '@inertiajs/react'

export default (props) => {
  const formData = { file: new File([], 'example.jpg'), foo: 'bar' }

  const visitMethod = (e) => {
    e.preventDefault()
    router.visit('/dump/post', { method: 'post', data: formData })
  }

  const postMethod = (e) => {
    e.preventDefault()
    router.post('/dump/post', formData)
  }

  const putMethod = (e) => {
    e.preventDefault()
    router.put('/dump/put', formData)
  }

  const patchMethod = (e) => {
    e.preventDefault()
    router.patch('/dump/patch', formData)
  }

  const deleteMethod = (e) => {
    e.preventDefault()
    router.delete('/dump/delete', { data: formData })
  }

  return (
    <div>
      <span className="text">
        This is the page that demonstrates automatic conversion of plain objects to form-data using manual visits
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
