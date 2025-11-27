<script lang="ts">
  import { router } from '@inertiajs/svelte'

  const formData = {
    file: new File([], 'example.jpg'),
    foo: 'bar',
  }

  const visitMethod = () => {
    router.visit('/dump/post', {
      method: 'post',
      data: formData,
    })
  }

  const postMethod = () => {
    router.post('/dump/post', formData)
  }

  const putMethod = () => {
    router.put('/dump/put', formData)
  }

  const patchMethod = () => {
    router.patch('/dump/patch', formData)
  }

  const deleteMethod = () => {
    router.delete('/dump/delete', {
      data: formData,
    })
  }
</script>

<div>
  <span class="text">
    This is the page that demonstrates automatic conversion of plain objects to form-data using manual visits
  </span>

  <a href={'#'} onclick={visitMethod} class="visit">Visit Link</a>
  <a href={'#'} onclick={postMethod} class="post">POST Link</a>
  <a href={'#'} onclick={putMethod} class="put">PUT Link</a>
  <a href={'#'} onclick={patchMethod} class="patch">PATCH Link</a>
  <a href={'#'} onclick={deleteMethod} class="delete">DELETE Link</a>
</div>
