import { router } from '@inertiajs/react'

export default (props) => {
  const visitMethod = (e) => {
    e.preventDefault()
    router.visit('/dump/get', { data: { foo: 'visit' } })
  }

  const getMethod = (e) => {
    e.preventDefault()
    router.get('/dump/get', { bar: 'get' })
  }

  const postMethod = (e) => {
    e.preventDefault()
    router.post('/dump/post', { baz: 'post' })
  }

  const putMethod = (e) => {
    e.preventDefault()
    router.put('/dump/put', { foo: 'put' })
  }

  const patchMethod = (e) => {
    e.preventDefault()
    router.patch('/dump/patch', { bar: 'patch' })
  }

  const deleteMethod = (e) => {
    e.preventDefault()
    router.delete('/dump/delete', { data: { baz: 'delete' } })
  }

  const qsafDefault = (e) => {
    e.preventDefault()
    router.visit('/dump/get', { data: { a: ['b', 'c'] } })
  }

  const qsafIndices = (e) => {
    e.preventDefault()
    router.visit('/dump/get', { data: { a: ['b', 'c'] }, queryStringArrayFormat: 'indices' })
  }

  const qsafBrackets = (e) => {
    e.preventDefault()
    router.visit('/dump/get', {
      data: { a: ['b', 'c'] },
      queryStringArrayFormat: 'brackets',
    })
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates manual visit data passing through plain objects</span>

      <a href="#" onClick={visitMethod} className="visit">
        Visit Link
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

      <a href="#" onClick={qsafDefault} className="qsaf-default">
        QSAF Defaults
      </a>
      <a href="#" onClick={qsafIndices} className="qsaf-indices">
        QSAF Indices
      </a>
      <a href="#" onClick={qsafBrackets} className="qsaf-brackets">
        QSAF Brackets
      </a>
    </div>
  )
}
