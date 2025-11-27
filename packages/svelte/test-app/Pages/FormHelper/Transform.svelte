<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: 'foo',
    remember: false,
  })

  const postForm = () => {
    form
      .transform((data) => ({
        ...data,
        name: 'bar',
      }))
      .post('/dump/post')
  }

  const putForm = () => {
    form
      .transform((data) => ({
        ...data,
        name: 'baz',
      }))
      .put('/dump/put')
  }

  const patchForm = () => {
    form
      .transform((data) => ({
        ...data,
        name: 'foo',
      }))
      .patch('/dump/patch')
  }

  const deleteForm = () => {
    form
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
    <input type="text" id="name" name="name" bind:value={form.name} />
  </label>
  <label>
    Remember Me
    <input type="checkbox" id="remember" name="remember" bind:checked={form.remember} />
  </label>

  <button onclick={postForm} class="post">POST form</button>
  <button onclick={putForm} class="put">PUT form</button>
  <button onclick={patchForm} class="patch">PATCH form</button>
  <button onclick={deleteForm} class="delete">DELETE form</button>
</div>
