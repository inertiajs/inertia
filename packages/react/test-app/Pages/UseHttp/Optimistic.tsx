import { useHttp } from '@inertiajs/react'

export default () => {
  const optimisticForm = useHttp<{ name: string }, { success: boolean; id: number; name: string }>({
    name: '',
  })

  const optimisticInlineForm = useHttp<{ name: string }, { success: boolean; id: number; name: string }>({
    name: '',
  })

  const performOptimistic = async () => {
    try {
      await optimisticForm
        .optimistic((data) => ({ ...data, name: data.name + ' (saving...)' }))
        .post('/api/optimistic-todo')
    } catch {
      // Errors stored in form
    }
  }

  const performOptimisticInline = async () => {
    try {
      await optimisticInlineForm.post('/api/optimistic-todo', {
        optimistic: (data) => ({ ...data, name: data.name + ' (saving...)' }),
      })
    } catch {
      // Errors stored in form
    }
  }

  return (
    <div>
      <h1>useHttp Optimistic</h1>

      {/* Optimistic (fluent) Test */}
      <section id="optimistic-test">
        <h2>Optimistic (fluent)</h2>
        <input
          type="text"
          id="optimistic-name"
          value={optimisticForm.data.name}
          onChange={(e) => optimisticForm.setData('name', e.target.value)}
        />
        <button onClick={performOptimistic} id="optimistic-button">
          Submit
        </button>
        <div id="optimistic-current-name">Name: {optimisticForm.data.name}</div>
        {optimisticForm.processing && <div id="optimistic-processing">Processing...</div>}
        {optimisticForm.wasSuccessful && <div id="optimistic-success">Success!</div>}
        {optimisticForm.errors.name && <div id="optimistic-error">{optimisticForm.errors.name}</div>}
      </section>

      {/* Optimistic (inline) Test */}
      <section id="optimistic-inline-test">
        <h2>Optimistic (inline)</h2>
        <input
          type="text"
          id="optimistic-inline-name"
          value={optimisticInlineForm.data.name}
          onChange={(e) => optimisticInlineForm.setData('name', e.target.value)}
        />
        <button onClick={performOptimisticInline} id="optimistic-inline-button">
          Submit
        </button>
        <div id="optimistic-inline-current-name">Name: {optimisticInlineForm.data.name}</div>
        {optimisticInlineForm.processing && <div id="optimistic-inline-processing">Processing...</div>}
        {optimisticInlineForm.wasSuccessful && <div id="optimistic-inline-success">Success!</div>}
        {optimisticInlineForm.errors.name && <div id="optimistic-inline-error">{optimisticInlineForm.errors.name}</div>}
      </section>
    </div>
  )
}
