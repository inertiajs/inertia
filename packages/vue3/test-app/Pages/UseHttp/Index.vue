<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'
import { ref } from 'vue'

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

const lastGetResponse = ref<SearchResponse | null>(null)
const lastPostResponse = ref<UserResponse | null>(null)
const lastDeleteResponse = ref<DeleteResponse | null>(null)
const cancelledMessage = ref('')
const errorMessage = ref('')
const httpExceptionStatus = ref<number | null>(null)
const httpExceptionBody = ref('')
const networkErrorMessage = ref('')

const performSearch = async () => {
  try {
    const result = await search.get('/api/data')
    lastGetResponse.value = result
  } catch (e) {
    console.error('Search failed:', e)
  }
}

const performCreate = async () => {
  try {
    const result = await createUser.post('/api/users')
    lastPostResponse.value = result
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
    lastDeleteResponse.value = result
  } catch (e) {
    console.error('Delete failed:', e)
  }
}

const performSlowRequest = async () => {
  cancelledMessage.value = ''
  try {
    await slowRequest.get('/api/slow')
  } catch (e: unknown) {
    if (e instanceof Error && (e.name === 'HttpCancelledError' || e.message?.includes('abort'))) {
      cancelledMessage.value = 'Request was cancelled'
    }
  }
}

const cancelSlowRequest = () => {
  slowRequest.cancel()
}

const triggerServerError = async () => {
  errorMessage.value = ''
  try {
    await errorHttp.post('/api/error')
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'response' in e) {
      const error = e as { response?: { status?: number } }
      if (error.response?.status === 500) {
        errorMessage.value = 'Server returned 500 error'
      }
    }
  }
}

const triggerHttpException = async () => {
  httpExceptionStatus.value = null
  httpExceptionBody.value = ''
  try {
    await httpExceptionHttp.post('/api/error', {
      onHttpException: (response) => {
        httpExceptionStatus.value = response.status
        httpExceptionBody.value = response.data
      },
    })
  } catch {
    // Expected
  }
}

const triggerNetworkError = async () => {
  networkErrorMessage.value = ''
  try {
    await networkErrorHttp.get('/api/network-error-test', {
      onNetworkError: (error) => {
        networkErrorMessage.value = error.message || 'Network error occurred'
      },
    })
  } catch {
    // Expected
  }
}
</script>

<template>
  <div>
    <h1>useHttp Test Page</h1>

    <!-- GET Request Test -->
    <section id="get-test">
      <h2>GET Request</h2>
      <label>
        Search Query
        <input type="text" id="search-query" v-model="search.query" />
      </label>
      <button @click="performSearch" id="search-button">Search</button>
      <div v-if="search.processing" id="search-processing">Searching...</div>
      <div v-if="lastGetResponse" id="search-result">
        Items: {{ lastGetResponse.items.join(', ') }}
        <br />
        Total: {{ lastGetResponse.total }}
        <br />
        Query: {{ lastGetResponse.query }}
      </div>
      <div v-if="search.response" id="search-response">Response stored: {{ search.response.total }} items</div>
    </section>

    <!-- POST Request Test -->
    <section id="post-test">
      <h2>POST Request</h2>
      <label>
        Name
        <input type="text" id="create-name" v-model="createUser.name" />
      </label>
      <label>
        Email
        <input type="email" id="create-email" v-model="createUser.email" />
      </label>
      <button @click="performCreate" id="create-button">Create User</button>
      <div v-if="createUser.processing" id="create-processing">Creating...</div>
      <div v-if="createUser.wasSuccessful" id="create-success">User created successfully!</div>
      <div v-if="createUser.recentlySuccessful" id="create-recently-successful">Recently successful!</div>
      <div v-if="lastPostResponse" id="create-result">
        Created user ID: {{ lastPostResponse.id }}
        <br />
        Name: {{ lastPostResponse.user.name }}
        <br />
        Email: {{ lastPostResponse.user.email }}
      </div>
      <div v-if="createUser.isDirty" id="create-dirty">Form has unsaved changes</div>
    </section>

    <!-- Validation Test -->
    <section id="validation-test">
      <h2>Validation Errors (422)</h2>
      <label>
        Name
        <input type="text" id="validate-name" v-model="validateUser.name" />
      </label>
      <span v-if="validateUser.errors.name" id="validate-name-error">{{ validateUser.errors.name }}</span>
      <label>
        Email
        <input type="email" id="validate-email" v-model="validateUser.email" />
      </label>
      <span v-if="validateUser.errors.email" id="validate-email-error">{{ validateUser.errors.email }}</span>
      <button @click="performValidation" id="validate-button">Validate</button>
      <div v-if="validateUser.hasErrors" id="validate-has-errors">Form has errors</div>
      <button @click="validateUser.clearErrors()" id="clear-errors-button">Clear Errors</button>
      <button @click="validateUser.clearErrors('name')" id="clear-name-error-button">Clear Name Error</button>
      <button @click="validateUser.setError('name', 'Manual name error')" id="set-name-error-button">
        Set Name Error
      </button>
      <button
        @click="validateUser.setError({ name: 'Multi name error', email: 'Multi email error' })"
        id="set-multiple-errors-button"
      >
        Set Multiple Errors
      </button>
    </section>

    <!-- DELETE Request Test -->
    <section id="delete-test">
      <h2>DELETE Request</h2>
      <label>
        User ID to delete
        <input type="number" id="delete-user-id" v-model="deleteUser.userId" />
      </label>
      <button @click="performDelete" id="delete-button">Delete User</button>
      <div v-if="lastDeleteResponse" id="delete-result">Deleted user ID: {{ lastDeleteResponse.deleted }}</div>
    </section>

    <!-- Cancel Request Test -->
    <section id="cancel-test">
      <h2>Cancel Request</h2>
      <button @click="performSlowRequest" id="slow-request-button">Start Slow Request</button>
      <button @click="cancelSlowRequest" id="cancel-button">Cancel Request</button>
      <div v-if="slowRequest.processing" id="slow-processing">Request in progress...</div>
      <div v-if="cancelledMessage" id="cancelled-message">{{ cancelledMessage }}</div>
    </section>

    <!-- Server Error Test -->
    <section id="error-test">
      <h2>Server Error (500)</h2>
      <button @click="triggerServerError" id="error-button">Trigger Server Error</button>
      <div v-if="errorMessage" id="error-message">{{ errorMessage }}</div>
    </section>

    <!-- HTTP Exception Callback Test -->
    <section id="http-exception-test">
      <h2>HTTP Exception Callback</h2>
      <button @click="triggerHttpException" id="http-exception-button">Trigger HTTP Exception</button>
      <div v-if="httpExceptionStatus" id="http-exception-status">Status: {{ httpExceptionStatus }}</div>
      <div v-if="httpExceptionBody" id="http-exception-body">Body: {{ httpExceptionBody }}</div>
    </section>

    <!-- Network Error Callback Test -->
    <section id="network-error-test">
      <h2>Network Error Callback</h2>
      <button @click="triggerNetworkError" id="network-error-button">Trigger Network Error</button>
      <div v-if="networkErrorMessage" id="network-error-message">{{ networkErrorMessage }}</div>
    </section>

    <!-- Reset Test -->
    <section id="reset-test">
      <h2>Reset &amp; Defaults</h2>
      <button @click="createUser.reset()" id="reset-button">Reset Form</button>
      <button @click="createUser.defaults()" id="defaults-button">Set Current as Defaults</button>
      <div id="reset-name-value">Current name: {{ createUser.name }}</div>
    </section>
  </div>
</template>
