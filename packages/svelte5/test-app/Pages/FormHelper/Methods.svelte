<script lang="ts">
  import { useForm } from '@inertiajs/svelte5'

  const form = useForm({
    name: 'foo',
    remember: false,
  })

  const postForm = () => {
    form.post('/dump/post')
  }

  const putForm = () => {
    form.put('/dump/put')
  }

  const patchForm = () => {
    form.patch('/dump/patch')
  }

  const deleteForm = () => {
    form.delete('/dump/delete')
  }

  const submitForm = () => {
    form.submit('post', '/dump/post')
  }

  const submitFormObject = () => {
    form.submit('post', '/dump/post')
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

  <button on:click={postForm} class="post">POST form</button>
  <button on:click={putForm} class="put">PUT form</button>
  <button on:click={patchForm} class="patch">PATCH form</button>
  <button on:click={deleteForm} class="delete">DELETE form</button>
  <button on:click={submitForm} class="submit">SUBMIT form</button>
  <button on:click={submitFormObject} class="submit-object">SUBMIT OBJECT form</button>
</div>
