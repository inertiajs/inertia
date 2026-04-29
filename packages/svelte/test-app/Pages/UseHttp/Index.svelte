<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

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

  const slowRequest = useHttp<Record<string, never>, { result: string }>({})

  const errorHttp = useHttp<Record<string, never>, never>({})
  const httpExceptionHttp = useHttp<Record<string, never>, never>({})
  const networkErrorHttp = useHttp<Record<string, never>, never>({})

  let lastGetResponse: SearchResponse | null = $state(null)
  let lastPostResponse: UserResponse | null = $state(null)
  let lastDeleteResponse: DeleteResponse | null = $state(null)
  let cancelledMessage = $state('')
  let errorMessage = $state('')
  let httpExceptionStatus: number | null = $state(null)
  let httpExceptionBody = $state('')
  let networkErrorMessage = $state('')

  const performSearch = async () => {
    try {
      const result = await search.get('/api/data')
      lastGetResponse = result
    } catch (e) {
      console.error('Search failed:', e)
    }
  }

  const performCreate = async () => {
    try {
      const result = await createUser.post('/api/users')
      lastPostResponse = result
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
      const result = await deleteUser.delete(`/api/users/${deleteUser.userId}`)
      lastDeleteResponse = result
    } catch (e) {
      console.error('Delete failed:', e)
    }
  }

  const performSlowRequest = async () => {
    cancelledMessage = ''
    try {
      await slowRequest.get('/api/slow')
    } catch (e: unknown) {
      if (e instanceof Error && (e.name === 'HttpCancelledError' || e.message?.includes('abort'))) {
        cancelledMessage = 'Request was cancelled'
      }
    }
  }

  const cancelSlowRequest = () => {
    slowRequest.cancel()
  }

  const triggerServerError = async () => {
    errorMessage = ''
    try {
      await errorHttp.post('/api/error')
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        const error = e as { response?: { status?: number } }
        if (error.response?.status === 500) {
          errorMessage = 'Server returned 500 error'
        }
      }
    }
  }

  const triggerHttpException = async () => {
    httpExceptionStatus = null
    httpExceptionBody = ''
    try {
      await httpExceptionHttp.post('/api/error', {
        onHttpException: (response) => {
          httpExceptionStatus = response.status
          httpExceptionBody = response.data
        },
      })
    } catch {
      // Expected
    }
  }

  const triggerNetworkError = async () => {
    networkErrorMessage = ''
    try {
      await networkErrorHttp.get('/api/network-error-test', {
        onNetworkError: (error) => {
          networkErrorMessage = error.message || 'Network error occurred'
        },
      })
    } catch {
      // Expected
    }
  }
</script>

<div>
  <h1>useHttp Test Page</h1>

  <!-- GET Request Test -->
  <section id="get-test">
    <h2>GET Request</h2>
    <label>
      Search Query
      <input type="text" id="search-query" bind:value={search.query} />
    </label>
    <button onclick={performSearch} id="search-button">Search</button>
    {#if search.processing}
      <div id="search-processing">Searching...</div>
    {/if}
    {#if lastGetResponse}
      <div id="search-result">
        Items: {lastGetResponse.items.join(', ')}
        <br />
        Total: {lastGetResponse.total}
        <br />
        Query: {lastGetResponse.query}
      </div>
    {/if}
    {#if search.response}
      <div id="search-response">Response stored: {search.response.total} items</div>
    {/if}
  </section>

  <!-- POST Request Test -->
  <section id="post-test">
    <h2>POST Request</h2>
    <label>
      Name
      <input type="text" id="create-name" bind:value={createUser.name} />
    </label>
    <label>
      Email
      <input type="email" id="create-email" bind:value={createUser.email} />
    </label>
    <button onclick={performCreate} id="create-button">Create User</button>
    {#if createUser.processing}
      <div id="create-processing">Creating...</div>
    {/if}
    {#if createUser.wasSuccessful}
      <div id="create-success">User created successfully!</div>
    {/if}
    {#if createUser.recentlySuccessful}
      <div id="create-recently-successful">Recently successful!</div>
    {/if}
    {#if lastPostResponse}
      <div id="create-result">
        Created user ID: {lastPostResponse.id}
        <br />
        Name: {lastPostResponse.user.name}
        <br />
        Email: {lastPostResponse.user.email}
      </div>
    {/if}
    {#if createUser.isDirty}
      <div id="create-dirty">Form has unsaved changes</div>
    {/if}
  </section>

  <!-- Validation Test -->
  <section id="validation-test">
    <h2>Validation Errors (422)</h2>
    <label>
      Name
      <input type="text" id="validate-name" bind:value={validateUser.name} />
    </label>
    {#if validateUser.errors.name}
      <span id="validate-name-error">{validateUser.errors.name}</span>
    {/if}
    <label>
      Email
      <input type="email" id="validate-email" bind:value={validateUser.email} />
    </label>
    {#if validateUser.errors.email}
      <span id="validate-email-error">{validateUser.errors.email}</span>
    {/if}
    <button onclick={performValidation} id="validate-button">Validate</button>
    {#if validateUser.hasErrors}
      <div id="validate-has-errors">Form has errors</div>
    {/if}
    <button onclick={() => validateUser.clearErrors()} id="clear-errors-button">Clear Errors</button>
    <button onclick={() => validateUser.clearErrors('name')} id="clear-name-error-button">Clear Name Error</button>
    <button onclick={() => validateUser.setError('name', 'Manual name error')} id="set-name-error-button"
      >Set Name Error</button
    >
    <button
      onclick={() => validateUser.setError({ name: 'Multi name error', email: 'Multi email error' })}
      id="set-multiple-errors-button">Set Multiple Errors</button
    >
  </section>

  <!-- DELETE Request Test -->
  <section id="delete-test">
    <h2>DELETE Request</h2>
    <label>
      User ID to delete
      <input type="number" id="delete-user-id" bind:value={deleteUser.userId} />
    </label>
    <button onclick={performDelete} id="delete-button">Delete User</button>
    {#if lastDeleteResponse}
      <div id="delete-result">Deleted user ID: {lastDeleteResponse.deleted}</div>
    {/if}
  </section>

  <!-- Cancel Request Test -->
  <section id="cancel-test">
    <h2>Cancel Request</h2>
    <button onclick={performSlowRequest} id="slow-request-button">Start Slow Request</button>
    <button onclick={cancelSlowRequest} id="cancel-button">Cancel Request</button>
    {#if slowRequest.processing}
      <div id="slow-processing">Request in progress...</div>
    {/if}
    {#if cancelledMessage}
      <div id="cancelled-message">{cancelledMessage}</div>
    {/if}
  </section>

  <!-- Server Error Test -->
  <section id="error-test">
    <h2>Server Error (500)</h2>
    <button onclick={triggerServerError} id="error-button">Trigger Server Error</button>
    {#if errorMessage}
      <div id="error-message">{errorMessage}</div>
    {/if}
  </section>

  <!-- HTTP Exception Callback Test -->
  <section id="http-exception-test">
    <h2>HTTP Exception Callback</h2>
    <button onclick={triggerHttpException} id="http-exception-button">Trigger HTTP Exception</button>
    {#if httpExceptionStatus}
      <div id="http-exception-status">Status: {httpExceptionStatus}</div>
    {/if}
    {#if httpExceptionBody}
      <div id="http-exception-body">Body: {httpExceptionBody}</div>
    {/if}
  </section>

  <!-- Network Error Callback Test -->
  <section id="network-error-test">
    <h2>Network Error Callback</h2>
    <button onclick={triggerNetworkError} id="network-error-button">Trigger Network Error</button>
    {#if networkErrorMessage}
      <div id="network-error-message">{networkErrorMessage}</div>
    {/if}
  </section>

  <!-- Reset Test -->
  <section id="reset-test">
    <h2>Reset &amp; Defaults</h2>
    <button onclick={() => createUser.reset()} id="reset-button">Reset Form</button>
    <button onclick={() => createUser.defaults()} id="defaults-button">Set Current as Defaults</button>
    <div id="reset-name-value">Current name: {createUser.name}</div>
  </section>
</div>
