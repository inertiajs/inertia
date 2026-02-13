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

  <a href={'#'} on:click|preventDefault={visitMethod} class="visit">Visit Link</a>
  <a href={'#'} on:click|preventDefault={getMethod} class="get">GET Link</a>
  <a href={'#'} on:click|preventDefault={postMethod} class="post">POST Link</a>
  <a href={'#'} on:click|preventDefault={putMethod} class="put">PUT Link</a>
  <a href={'#'} on:click|preventDefault={patchMethod} class="patch">PATCH Link</a>
  <a href={'#'} on:click|preventDefault={deleteMethod} class="delete">DELETE Link</a>

  <a href={'#'} on:click|preventDefault={qsafDefault} class="qsaf-default">QSAF Defaults</a>
  <a href={'#'} on:click|preventDefault={qsafIndices} class="qsaf-indices">QSAF Indices</a>
  <a href={'#'} on:click|preventDefault={qsafBrackets} class="qsaf-brackets">QSAF Brackets</a>
  <a href={'#'} on:click|preventDefault={deleteQueryParam} class="delete-query-param">Delete Query Param</a>
</div>
