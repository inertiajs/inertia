<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const standardVisitMethod = () => {
    router.visit('/dump/get')
  }

  const specificVisitMethod = () => {
    router.visit('/dump/patch', {
      method: 'patch',
    })
  }

  const getMethod = () => {
    router.get('/dump/get')
  }

  const postMethod = () => {
    router.post('/dump/post')
  }

  const putMethod = () => {
    router.put('/dump/put')
  }

  const patchMethod = () => {
    router.patch('/dump/patch')
  }

  const deleteMethod = () => {
    router.delete('/dump/delete')
  }
</script>

<div>
  <span class="text">This is the page that demonstrates manual visit methods</span>

  <a href={undefined} on:click={standardVisitMethod} class="visit-get">Standard visit Link</a>
  <a href={undefined} on:click={specificVisitMethod} class="visit-specific">Specific visit Link</a>
  <a href={undefined} on:click={getMethod} class="get">GET Link</a>
  <a href={undefined} on:click={postMethod} class="post">POST Link</a>
  <a href={undefined} on:click={putMethod} class="put">PUT Link</a>
  <a href={undefined} on:click={patchMethod} class="patch">PATCH Link</a>
  <a href={undefined} on:click={deleteMethod} class="delete">DELETE Link</a>
</div>
