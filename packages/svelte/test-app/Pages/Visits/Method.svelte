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

  <a href={'#'} onclick={standardVisitMethod} class="visit-get">Standard visit Link</a>
  <a href={'#'} onclick={specificVisitMethod} class="visit-specific">Specific visit Link</a>
  <a href={'#'} onclick={getMethod} class="get">GET Link</a>
  <a href={'#'} onclick={postMethod} class="post">POST Link</a>
  <a href={'#'} onclick={putMethod} class="put">PUT Link</a>
  <a href={'#'} onclick={patchMethod} class="patch">PATCH Link</a>
  <a href={'#'} onclick={deleteMethod} class="delete">DELETE Link</a>
</div>
