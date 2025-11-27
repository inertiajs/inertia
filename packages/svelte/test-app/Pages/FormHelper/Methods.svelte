<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

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
    form.submit({
      method: 'post',
      url: '/dump/post',
    })
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
  <button onclick={submitForm} class="submit">SUBMIT form</button>
  <button onclick={submitFormObject} class="submit-object">SUBMIT OBJECT form</button>
</div>
