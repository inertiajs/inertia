<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Contact {
    id: number
    name: string
    is_favorite: boolean
  }

  interface Props {
    contacts: Contact[]
    errors?: Record<string, string>
  }

  let { contacts, errors }: Props = $props()

  const toggleFavorite = (
    contact: Contact,
    { delay = 500, error = false }: { delay?: number; error?: boolean } = {},
  ) => {
    router
      .optimistic<{ contacts: Contact[] }>((props) => ({
        contacts: props.contacts.map((c) => (c.id === contact.id ? { ...c, is_favorite: !c.is_favorite } : c)),
      }))
      .post(
        `/optimistic/rollback/toggle/${contact.id}?delay=${delay}&error=${error ? '1' : '0'}`,
        {},
        { preserveScroll: true },
      )
  }

  const reset = () => {
    router.post('/optimistic/rollback/reset')
  }
</script>

<div>
  <h1>Optimistic Rollback</h1>

  <div id="contact-list">
    {#each contacts as contact (contact.id)}
      <div class="contact-item">
        <span class="contact-name">{contact.name}</span>
        <span class="contact-status">{contact.is_favorite ? 'Favorite' : 'Not Favorite'}</span>
        <button class="toggle-btn" onclick={() => toggleFavorite(contact)}>Toggle</button>
        <button class="toggle-error-btn" onclick={() => toggleFavorite(contact, { error: true })}>Toggle (Error)</button
        >
        <button class="toggle-slow-btn" onclick={() => toggleFavorite(contact, { delay: 1000 })}>Toggle (Slow)</button>
        <button class="toggle-slow-error-btn" onclick={() => toggleFavorite(contact, { delay: 1000, error: true })}
          >Toggle (Slow Error)</button
        >
      </div>
    {/each}
  </div>

  {#if errors?.toggle}
    <div id="error-message">{errors.toggle}</div>
  {/if}

  <button id="reset-btn" onclick={reset}>Reset</button>
</div>
