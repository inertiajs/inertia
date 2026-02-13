<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const defaultHeadersMethod = () => {
    router.visit('/dump/get')
  }

  const visitWithCustomHeaders = () => {
    router.visit('/dump/get', {
      headers: {
        foo: 'bar',
      },
    })
  }

  const getMethod = () => {
    router.get(
      '/dump/get',
      {},
      {
        headers: {
          bar: 'baz',
        },
      },
    )
  }

  const postMethod = () => {
    router.post(
      '/dump/post',
      {},
      {
        headers: {
          baz: 'foo',
        },
      },
    )
  }

  const putMethod = () => {
    router.put(
      '/dump/put',
      {},
      {
        headers: {
          foo: 'bar',
        },
      },
    )
  }

  const patchMethod = () => {
    router.patch(
      '/dump/patch',
      {},
      {
        headers: {
          bar: 'baz',
        },
      },
    )
  }

  const deleteMethod = () => {
    router.delete('/dump/delete', {
      headers: {
        baz: 'foo',
      },
    })
  }

  const overridden = () => {
    router.post(
      '/dump/post',
      {},
      {
        headers: {
          bar: 'baz',
          'X-Requested-With': 'custom',
        },
      },
    )
  }
</script>

<div>
  <span class="text">This is the page that demonstrates passing custom headers through manual visits</span>

  <a href={'#'} on:click|preventDefault={defaultHeadersMethod} class="default">Standard visit Link</a>

  <a href={'#'} on:click|preventDefault={visitWithCustomHeaders} class="visit">Specific visit Link</a>
  <a href={'#'} on:click|preventDefault={getMethod} class="get">GET Link</a>
  <a href={'#'} on:click|preventDefault={postMethod} class="post">POST Link</a>
  <a href={'#'} on:click|preventDefault={putMethod} class="put">PUT Link</a>
  <a href={'#'} on:click|preventDefault={patchMethod} class="patch">PATCH Link</a>
  <a href={'#'} on:click|preventDefault={deleteMethod} class="delete">DELETE Link</a>

  <a href={'#'} on:click|preventDefault={overridden} class="overridden">Overriden Link</a>
</div>
