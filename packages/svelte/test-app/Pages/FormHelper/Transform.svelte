<script>
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: 'foo',
    remember: false,
  })

  const postForm = () => {
    $form
      .transform((data) => ({
        ...data,
        name: 'bar',
      }))
      .post('/dump/post')
  }

  const putForm = () => {
    $form
      .transform((data) => ({
        ...data,
        name: 'baz',
      }))
      .put('/dump/put')
  }

  const patchForm = () => {
    $form
      .transform((data) => ({
        ...data,
        name: 'foo',
      }))
      .patch('/dump/patch')
  }

  const deleteForm = () => {
    $form
      .transform((data) => ({
        ...data,
        name: 'bar',
      }))
      .delete('/dump/delete')
  }
</script>

<div>
  <label>
    Full Name
    <input type="text" id="name" name="name" bind:value={$form.name} />
  </label>
  <label>
    Remember Me
    <input type="checkbox" id="remember" name="remember" bind:checked={$form.remember} />
  </label>

  <button on:click={postForm} class="post">POST form</button>
  <button on:click={putForm} class="put">PUT form</button>
  <button on:click={patchForm} class="patch">PATCH form</button>
  <button on:click={deleteForm} class="delete">DELETE form</button>
</div>
