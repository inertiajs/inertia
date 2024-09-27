import { router } from '@inertiajs/react'

export default (props) => {
  const defaultHeadersMethod = (e) => {
    e.preventDefault()
    router.visit('/dump/get')
  }

  const visitWithCustomHeaders = (e) => {
    e.preventDefault()
    router.visit('/dump/get', { headers: { foo: 'bar' } })
  }

  const getMethod = (e) => {
    e.preventDefault()
    router.get('/dump/get', {}, { headers: { bar: 'baz' } })
  }

  const postMethod = (e) => {
    e.preventDefault()
    router.post('/dump/post', {}, { headers: { baz: 'foo' } })
  }

  const putMethod = (e) => {
    e.preventDefault()
    router.put('/dump/put', {}, { headers: { foo: 'bar' } })
  }

  const patchMethod = (e) => {
    e.preventDefault()
    router.patch('/dump/patch', {}, { headers: { bar: 'baz' } })
  }

  const deleteMethod = (e) => {
    e.preventDefault()
    router.delete('/dump/delete', { headers: { baz: 'foo' } })
  }

  const overridden = (e) => {
    e.preventDefault()
    router.post('/dump/post', {}, { headers: { bar: 'baz', 'X-Requested-With': 'custom' } })
  }
  return (
    <div>
      <span className="text">This is the page that demonstrates passing custom headers through manual visits</span>

      <a href="#" onClick={defaultHeadersMethod} className="default">
        Standard visit Link
      </a>

      <a href="#" onClick={visitWithCustomHeaders} className="visit">
        Specific visit Link
      </a>
      <a href="#" onClick={getMethod} className="get">
        GET Link
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

      <a href="#" onClick={overridden} className="overridden">
        Overriden Link
      </a>
    </div>
  )
}
