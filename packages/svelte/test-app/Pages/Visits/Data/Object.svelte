<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const visitMethod = () => {
    router.visit('/dump/get', {
      data: { foo: 'visit' },
    })
  }

  const getMethod = () => {
    router.get('/dump/get', {
      bar: 'get',
    })
  }

  const postMethod = () => {
    router.post('/dump/post', {
      baz: 'post',
    })
  }

  const putMethod = () => {
    router.put('/dump/put', {
      foo: 'put',
    })
  }

  const patchMethod = () => {
    router.patch('/dump/patch', {
      bar: 'patch',
    })
  }

  const deleteMethod = () => {
    router.delete('/dump/delete', {
      data: { baz: 'delete' },
    })
  }

  const qsafDefault = () => {
    router.visit('/dump/get', {
      data: { a: ['b', 'c'] },
    })
  }

  const qsafIndices = () => {
    router.visit('/dump/get', {
      data: { a: ['b', 'c'] },
      queryStringArrayFormat: 'indices',
    })
  }

  const qsafBrackets = () => {
    router.visit('/dump/get', {
      data: { a: ['b', 'c'] },
      queryStringArrayFormat: 'brackets',
    })
  }

  const deleteQueryParam = (e: Event) => {
    e.preventDefault()
    router.visit('/dump/get', {
      data: { a: undefined },
    })
  }
</script>

<div>
  <span class="text">This is the page that demonstrates manual visit data passing through plain objects</span>

  <a href={'#'} onclick={visitMethod} class="visit">Visit Link</a>
  <a href={'#'} onclick={getMethod} class="get">GET Link</a>
  <a href={'#'} onclick={postMethod} class="post">POST Link</a>
  <a href={'#'} onclick={putMethod} class="put">PUT Link</a>
  <a href={'#'} onclick={patchMethod} class="patch">PATCH Link</a>
  <a href={'#'} onclick={deleteMethod} class="delete">DELETE Link</a>

  <a href={'#'} onclick={qsafDefault} class="qsaf-default">QSAF Defaults</a>
  <a href={'#'} onclick={qsafIndices} class="qsaf-indices">QSAF Indices</a>
  <a href={'#'} onclick={qsafBrackets} class="qsaf-brackets">QSAF Brackets</a>
  <a href={'#'} onclick={deleteQueryParam} class="delete-query-param">Delete Query Param</a>
</div>
