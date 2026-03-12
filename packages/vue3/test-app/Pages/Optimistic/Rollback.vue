<script setup lang="ts">
import { router } from '@inertiajs/vue3'

interface Contact {
  id: number
  name: string
  is_favorite: boolean
}

defineProps<{
  contacts: Contact[]
  errors?: Record<string, string>
}>()

const toggleFavorite = (contact: Contact, { delay = 500, error = false }: { delay?: number; error?: boolean } = {}) => {
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

<template>
  <div>
    <h1>Optimistic Rollback</h1>

    <div id="contact-list">
      <div v-for="contact in contacts" :key="contact.id" class="contact-item">
        <span class="contact-name">{{ contact.name }}</span>
        <span class="contact-status">{{ contact.is_favorite ? 'Favorite' : 'Not Favorite' }}</span>
        <button class="toggle-btn" @click="toggleFavorite(contact)">Toggle</button>
        <button class="toggle-error-btn" @click="toggleFavorite(contact, { error: true })">Toggle (Error)</button>
        <button class="toggle-slow-btn" @click="toggleFavorite(contact, { delay: 1000 })">Toggle (Slow)</button>
        <button class="toggle-slow-error-btn" @click="toggleFavorite(contact, { delay: 1000, error: true })">
          Toggle (Slow Error)
        </button>
      </div>
    </div>

    <div v-if="errors?.toggle" id="error-message">{{ errors.toggle }}</div>

    <button id="reset-btn" @click="reset">Reset</button>
  </div>
</template>
