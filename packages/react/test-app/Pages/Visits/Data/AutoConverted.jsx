import { router } from '@inertiajs/react'

export default (props) => {
  const formData = { file: new File([], 'example.jpg'), foo: 'bar' }

  const visitMethod = () => {
    router.visit('/dump/post', { method: 'post', data: formData })
  }

  const postMethod = () => {
    router.post('/dump/post', formData)
  }

  const putMethod = () => {
    router.put('/dump/put', formData)
  }

  const patchMethod = () => {
    router.patch('/dump/patch', formData)
  }

  const deleteMethod = () => {
    router.delete('/dump/delete', { data: formData })
  }

  return (
    <div>
      <span className="text">
        This is the page that demonstrates automatic conversion of plain objects to form-data using manual visits
      </span>

      <span onClick={visitMethod} className="visit">
        Visit Link
      </span>
      <span onClick={postMethod} className="post">
        POST Link
      </span>
      <span onClick={putMethod} className="put">
        PUT Link
      </span>
      <span onClick={patchMethod} className="patch">
        PATCH Link
      </span>
      <span onClick={deleteMethod} className="delete">
        DELETE Link
      </span>
    </div>
  )
}
