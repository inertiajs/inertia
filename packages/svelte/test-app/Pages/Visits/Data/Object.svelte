<script>
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
</script>

<div>
  <span class="text">This is the page that demonstrates manual visit data passing through plain objects</span>

  <a href="#" on:click={visitMethod} class="visit">Visit Link</a>
  <a href="#" on:click={getMethod} class="get">GET Link</a>
  <a href="#" on:click={postMethod} class="post">POST Link</a>
  <a href="#" on:click={putMethod} class="put">PUT Link</a>
  <a href="#" on:click={patchMethod} class="patch">PATCH Link</a>
  <a href="#" on:click={deleteMethod} class="delete">DELETE Link</a>

  <a href="#" on:click={qsafDefault} class="qsaf-default">QSAF Defaults</a>
  <a href="#" on:click={qsafIndices} class="qsaf-indices">QSAF Indices</a>
  <a href="#" on:click={qsafBrackets} class="qsaf-brackets">QSAF Brackets</a>
</div>
