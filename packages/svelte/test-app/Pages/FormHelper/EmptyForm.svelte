<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  interface FormData {
    name: string
    email: string
  }

  const form = useForm<FormData>()

  const submit = () => {
    $form.transform(() => ({
      name: 'John Doe',
      email: 'john@example.com',
    }))
    $form.post('/dump/post')
  }
</script>

<div>
  <button on:click={submit}>Submit</button>
</div>
