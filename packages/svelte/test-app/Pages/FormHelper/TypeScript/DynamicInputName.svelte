<script lang="ts">
  // This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
  import { useForm } from '@inertiajs/svelte'

  interface ClientForm {
    name: string
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  const form = useForm<ClientForm>({
    name: '',
  })

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const { name, value } = target
    $form[name] = value
  }
</script>

<input name="name" type="text" value={$form.name} on:input={handleChange} />
