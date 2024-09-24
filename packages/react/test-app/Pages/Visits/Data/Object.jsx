import { router } from '@inertiajs/react'

export default (props) => {
  const visitMethod = () => {
    router.visit('/dump/get', { data: { foo: 'visit' } })
  }

  const getMethod = () => {
    router.get('/dump/get', { bar: 'get' })
  }

  const postMethod = () => {
    router.post('/dump/post', { baz: 'post' })
  }

  const putMethod = () => {
    router.put('/dump/put', { foo: 'put' })
  }

  const patchMethod = () => {
    router.patch('/dump/patch', { bar: 'patch' })
  }

  const deleteMethod = () => {
    router.delete('/dump/delete', { data: { baz: 'delete' } })
  }

  const qsafDefault = () => {
    router.visit('/dump/get', { data: { a: ['b', 'c'] } })
  }

  const qsafIndices = () => {
    router.visit('/dump/get', { data: { a: ['b', 'c'] }, queryStringArrayFormat: 'indices' })
  }

  const qsafBrackets = () => {
    router.visit('/dump/get', {
      data: { a: ['b', 'c'] },
      queryStringArrayFormat: 'brackets',
    })
  }

  return (
    <div>
      <span className="text">This is the page that demonstrates manual visit data passing through plain objects</span>

      <span onClick={visitMethod} className="visit">
        Visit Link
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

      <span onClick={qsafDefault} className="qsaf-default">
        QSAF Defaults
      </span>
      <span onClick={qsafIndices} className="qsaf-indices">
        QSAF Indices
      </span>
      <span onClick={qsafBrackets} className="qsaf-brackets">
        QSAF Brackets
      </span>
    </div>
  )
}
