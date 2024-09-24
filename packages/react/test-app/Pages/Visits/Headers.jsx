import { router } from '@inertiajs/react'

export default (props) => {
  const defaultHeadersMethod = () => {
    router.visit('/dump/get')
  }

  const visitWithCustomHeaders = () => {
    router.visit('/dump/get', { headers: { foo: 'bar' } })
  }

  const getMethod = () => {
    router.get('/dump/get', {}, { headers: { bar: 'baz' } })
  }

  const postMethod = () => {
    router.post('/dump/post', {}, { headers: { baz: 'foo' } })
  }

  const putMethod = () => {
    router.put('/dump/put', {}, { headers: { foo: 'bar' } })
  }

  const patchMethod = () => {
    router.patch('/dump/patch', {}, { headers: { bar: 'baz' } })
  }

  const deleteMethod = () => {
    router.delete('/dump/delete', { headers: { baz: 'foo' } })
  }

  const overridden = () => {
    router.post('/dump/post', {}, { headers: { bar: 'baz', 'X-Requested-With': 'custom' } })
  }
  return (
    <div>
      <span className="text">This is the page that demonstrates passing custom headers through manual visits</span>

      <span onClick={defaultHeadersMethod} className="default">
        Standard visit Link
      </span>

      <span onClick={visitWithCustomHeaders} className="visit">
        Specific visit Link
      </span>
      <span onClick={getMethod} className="get">
        GET Link
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

      <span onClick={overridden} className="overridden">
        DELETE Link
      </span>
    </div>
  )
}
