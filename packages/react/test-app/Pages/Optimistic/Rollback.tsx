import { router } from '@inertiajs/react'

interface Contact {
  id: number
  name: string
  is_favorite: boolean
}

export default ({ contacts, errors }: { contacts: Contact[]; errors?: Record<string, string> }) => {
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

  return (
    <div>
      <h1>Optimistic Rollback</h1>

      <div id="contact-list">
        {contacts.map((contact) => (
          <div key={contact.id} className="contact-item">
            <span className="contact-name">{contact.name}</span>
            <span className="contact-status">{contact.is_favorite ? 'Favorite' : 'Not Favorite'}</span>
            <button className="toggle-btn" onClick={() => toggleFavorite(contact)}>
              Toggle
            </button>
            <button className="toggle-error-btn" onClick={() => toggleFavorite(contact, { error: true })}>
              Toggle (Error)
            </button>
            <button className="toggle-slow-btn" onClick={() => toggleFavorite(contact, { delay: 1000 })}>
              Toggle (Slow)
            </button>
            <button
              className="toggle-slow-error-btn"
              onClick={() => toggleFavorite(contact, { delay: 1000, error: true })}
            >
              Toggle (Slow Error)
            </button>
          </div>
        ))}
      </div>

      {errors?.toggle && <div id="error-message">{errors.toggle}</div>}

      <button id="reset-btn" onClick={reset}>
        Reset
      </button>
    </div>
  )
}
