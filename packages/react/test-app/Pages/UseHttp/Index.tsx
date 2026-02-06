import { useHttp } from '@inertiajs/react'
import { useState } from 'react'

interface SearchResponse {
  items: string[]
  total: number
  query: string | null
}

interface UserResponse {
  success: boolean
  id: number
  user: {
    name: string
    email: string
  }
}

interface ValidateResponse {
  success: boolean
}

interface DeleteResponse {
  success: boolean
  deleted: number
}

export default () => {
  const search = useHttp<{ query: string }, SearchResponse>({
    query: '',
  })

  const createUser = useHttp<{ name: string; email: string }, UserResponse>({
    name: '',
    email: '',
  })

  const validateUser = useHttp<{ name: string; email: string }, ValidateResponse>({
    name: '',
    email: '',
  })

  const deleteUser = useHttp<{ userId: number }, DeleteResponse>({
    userId: 0,
  })

  const optimisticForm = useHttp<{ name: string }, { success: boolean; id: number; name: string }>({
    name: '',
  })

  const optimisticInlineForm = useHttp<{ name: string }, { success: boolean; id: number; name: string }>({
    name: '',
  })

  const slowRequest = useHttp<Record<string, never>, { result: string }>({})

  const errorHttp = useHttp<Record<string, never>, never>({})

  const [lastGetResponse, setLastGetResponse] = useState<SearchResponse | null>(null)
  const [lastPostResponse, setLastPostResponse] = useState<UserResponse | null>(null)
  const [lastDeleteResponse, setLastDeleteResponse] = useState<DeleteResponse | null>(null)
  const [cancelledMessage, setCancelledMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const performSearch = async () => {
    try {
      const result = await search.get('/api/data')
      setLastGetResponse(result)
    } catch (e) {
      console.error('Search failed:', e)
    }
  }

  const performCreate = async () => {
    try {
      const result = await createUser.post('/api/users')
      setLastPostResponse(result)
    } catch (e) {
      console.error('Create failed:', e)
    }
  }

  const performValidation = async () => {
    try {
      await validateUser.post('/api/validate')
    } catch {
      // Errors are stored in validateUser.errors
    }
  }

  const performDelete = async () => {
    try {
      const result = await deleteUser.delete(`/api/users/${deleteUser.data.userId}`)
      setLastDeleteResponse(result)
    } catch (e) {
      console.error('Delete failed:', e)
    }
  }

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

  const performSlowRequest = async () => {
    setCancelledMessage('')
    try {
      await slowRequest.get('/api/slow')
    } catch (e: unknown) {
      if (e instanceof Error && (e.name === 'HttpCancelledError' || e.message?.includes('abort'))) {
        setCancelledMessage('Request was cancelled')
      }
    }
  }

  const cancelSlowRequest = () => {
    slowRequest.cancel()
  }

  const triggerServerError = async () => {
    setErrorMessage('')
    try {
      await errorHttp.post('/api/error')
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        const error = e as { response?: { status?: number } }
        if (error.response?.status === 500) {
          setErrorMessage('Server returned 500 error')
        }
      }
    }
  }

  return (
    <div>
      <h1>useHttp Test Page</h1>

      {/* GET Request Test */}
      <section id="get-test">
        <h2>GET Request</h2>
        <label>
          Search Query
          <input
            type="text"
            id="search-query"
            value={search.data.query}
            onChange={(e) => search.setData('query', e.target.value)}
          />
        </label>
        <button onClick={performSearch} id="search-button">
          Search
        </button>
        {search.processing && <div id="search-processing">Searching...</div>}
        {lastGetResponse && (
          <div id="search-result">
            Items: {lastGetResponse.items.join(', ')}
            <br />
            Total: {lastGetResponse.total}
            <br />
            Query: {lastGetResponse.query}
          </div>
        )}
        {search.response && <div id="search-response">Response stored: {search.response.total} items</div>}
      </section>

      {/* POST Request Test */}
      <section id="post-test">
        <h2>POST Request</h2>
        <label>
          Name
          <input
            type="text"
            id="create-name"
            value={createUser.data.name}
            onChange={(e) => createUser.setData('name', e.target.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            id="create-email"
            value={createUser.data.email}
            onChange={(e) => createUser.setData('email', e.target.value)}
          />
        </label>
        <button onClick={performCreate} id="create-button">
          Create User
        </button>
        {createUser.processing && <div id="create-processing">Creating...</div>}
        {createUser.wasSuccessful && <div id="create-success">User created successfully!</div>}
        {createUser.recentlySuccessful && <div id="create-recently-successful">Recently successful!</div>}
        {lastPostResponse && (
          <div id="create-result">
            Created user ID: {lastPostResponse.id}
            <br />
            Name: {lastPostResponse.user.name}
            <br />
            Email: {lastPostResponse.user.email}
          </div>
        )}
        {createUser.isDirty && <div id="create-dirty">Form has unsaved changes</div>}
      </section>

      {/* Validation Test */}
      <section id="validation-test">
        <h2>Validation Errors (422)</h2>
        <label>
          Name
          <input
            type="text"
            id="validate-name"
            value={validateUser.data.name}
            onChange={(e) => validateUser.setData('name', e.target.value)}
          />
        </label>
        {validateUser.errors.name && <span id="validate-name-error">{validateUser.errors.name}</span>}
        <label>
          Email
          <input
            type="email"
            id="validate-email"
            value={validateUser.data.email}
            onChange={(e) => validateUser.setData('email', e.target.value)}
          />
        </label>
        {validateUser.errors.email && <span id="validate-email-error">{validateUser.errors.email}</span>}
        <button onClick={performValidation} id="validate-button">
          Validate
        </button>
        {validateUser.hasErrors && <div id="validate-has-errors">Form has errors</div>}
        <button onClick={() => validateUser.clearErrors()} id="clear-errors-button">
          Clear Errors
        </button>
        <button onClick={() => validateUser.clearErrors('name')} id="clear-name-error-button">
          Clear Name Error
        </button>
        <button onClick={() => validateUser.setError('name', 'Manual name error')} id="set-name-error-button">
          Set Name Error
        </button>
        <button
          onClick={() => validateUser.setError({ name: 'Multi name error', email: 'Multi email error' })}
          id="set-multiple-errors-button"
        >
          Set Multiple Errors
        </button>
      </section>

      {/* DELETE Request Test */}
      <section id="delete-test">
        <h2>DELETE Request</h2>
        <label>
          User ID to delete
          <input
            type="number"
            id="delete-user-id"
            value={deleteUser.data.userId}
            onChange={(e) => deleteUser.setData('userId', parseInt(e.target.value) || 0)}
          />
        </label>
        <button onClick={performDelete} id="delete-button">
          Delete User
        </button>
        {lastDeleteResponse && <div id="delete-result">Deleted user ID: {lastDeleteResponse.deleted}</div>}
      </section>

      {/* Optimistic (fluent) Test */}
      <section id="optimistic-test">
        <h2>Optimistic (fluent)</h2>
        <input type="text" id="optimistic-name" value={optimisticForm.data.name} onChange={(e) => optimisticForm.setData('name', e.target.value)} />
        <button onClick={performOptimistic} id="optimistic-button">Submit</button>
        <div id="optimistic-current-name">Name: {optimisticForm.data.name}</div>
        {optimisticForm.processing && <div id="optimistic-processing">Processing...</div>}
        {optimisticForm.wasSuccessful && <div id="optimistic-success">Success!</div>}
        {optimisticForm.errors.name && <div id="optimistic-error">{optimisticForm.errors.name}</div>}
      </section>

      {/* Optimistic (inline) Test */}
      <section id="optimistic-inline-test">
        <h2>Optimistic (inline)</h2>
        <input type="text" id="optimistic-inline-name" value={optimisticInlineForm.data.name} onChange={(e) => optimisticInlineForm.setData('name', e.target.value)} />
        <button onClick={performOptimisticInline} id="optimistic-inline-button">Submit</button>
        <div id="optimistic-inline-current-name">Name: {optimisticInlineForm.data.name}</div>
        {optimisticInlineForm.processing && <div id="optimistic-inline-processing">Processing...</div>}
        {optimisticInlineForm.wasSuccessful && <div id="optimistic-inline-success">Success!</div>}
        {optimisticInlineForm.errors.name && <div id="optimistic-inline-error">{optimisticInlineForm.errors.name}</div>}
      </section>

      {/* Cancel Request Test */}
      <section id="cancel-test">
        <h2>Cancel Request</h2>
        <button onClick={performSlowRequest} id="slow-request-button">
          Start Slow Request
        </button>
        <button onClick={cancelSlowRequest} id="cancel-button">
          Cancel Request
        </button>
        {slowRequest.processing && <div id="slow-processing">Request in progress...</div>}
        {cancelledMessage && <div id="cancelled-message">{cancelledMessage}</div>}
      </section>

      {/* Server Error Test */}
      <section id="error-test">
        <h2>Server Error (500)</h2>
        <button onClick={triggerServerError} id="error-button">
          Trigger Server Error
        </button>
        {errorMessage && <div id="error-message">{errorMessage}</div>}
      </section>

      {/* Reset Test */}
      <section id="reset-test">
        <h2>Reset &amp; Defaults</h2>
        <button onClick={() => createUser.reset()} id="reset-button">
          Reset Form
        </button>
        <button onClick={() => createUser.setDefaults()} id="defaults-button">
          Set Current as Defaults
        </button>
        <div id="reset-name-value">Current name: {createUser.data.name}</div>
      </section>
    </div>
  )
}
