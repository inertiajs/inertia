<!-- @migration-task Error while migrating Svelte code: Mixing old (on:change) and new syntaxes for event handling is not allowed. Use only the onchange syntax
https://svelte.dev/e/mixed_event_handler_syntaxes -->
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm<{
    name: string
    avatar: File | null
  }>({
    name: '',
    avatar: null,
  })
    .withPrecognition('post', '/precognition/files')
    .setValidationTimeout(100)

  let validateFiles = $state(false)

  $effect(() => {
    if (validateFiles && typeof form.validateFiles === 'function') {
      form.validateFiles()
    } else if (!validateFiles && typeof form.withoutFileValidation === 'function') {
      form.withoutFileValidation()
    }
  })

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    form.avatar = target.files?.[0] || null
  }
</script>

<div>
  <div>
    <input bind:value={form.name} name="name" placeholder="Name" onblur={() => form.validate('name')} />
    {#if form.invalid('name')}
      <p>
        {form.errors.name}
      </p>
    {/if}
    {#if form.valid('name')}<p>Name is valid!</p>{/if}
  </div>

  <div>
    <input type="file" name="avatar" id="avatar" onchange={handleFileChange} />
    {#if form.invalid('avatar')}
      <p>
        {form.errors.avatar}
      </p>
    {/if}
    {#if form.valid('avatar')}<p>Avatar is valid!</p>{/if}
  </div>

  {#if form.validating}<p>Validating...</p>{/if}

  <button type="button" onclick={() => (validateFiles = !validateFiles)}>
    Toggle Validate Files ({validateFiles ? 'enabled' : 'disabled'})
  </button>

  <button type="button" onclick={() => form.validate({ only: ['name', 'avatar'] })}>Validate Both</button>
</div>
