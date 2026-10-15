<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

  interface UserResponse {
    success: boolean
    id: number
    user: {
      name: string
      email: string
    }
  }

  interface SearchResponse {
    method: string
    name: string
    query: Record<string, string>
  }

  const updateUser = useHttp<{ name: string; email: string }, UserResponse>({
    name: '',
    email: '',
  })

  const searchUsers = useHttp<{ name: string }, SearchResponse>({
    name: '',
  })

  let lastPutResponse: UserResponse | null = $state(null)
  let lastPatchResponse: UserResponse | null = $state(null)
  let lastQueryResponse: SearchResponse | null = $state(null)

  const performPut = async () => {
    try {
      const result = await updateUser.put('/api/users/1')
      lastPutResponse = result
    } catch (e) {
      console.error('PUT failed:', e)
    }
  }

  const performPatch = async () => {
    try {
      const result = await updateUser.patch('/api/users/1')
      lastPatchResponse = result
    } catch (e) {
      console.error('PATCH failed:', e)
    }
  }

  const performQuery = async () => {
    try {
      const result = await searchUsers.query('/api/users/search')
      lastQueryResponse = result
    } catch (e) {
      console.error('QUERY failed:', e)
    }
  }
</script>

<div>
  <h1>useHttp HTTP Methods Test</h1>

  <!-- PUT Request Test -->
  <section id="put-test">
    <h2>PUT Request</h2>
    <label>
      Name
      <input type="text" id="put-name" bind:value={updateUser.name} />
    </label>
    <label>
      Email
      <input type="email" id="put-email" bind:value={updateUser.email} />
    </label>
    <button onclick={performPut} id="put-button">Update User (PUT)</button>
    {#if updateUser.processing}
      <div id="put-processing">Updating...</div>
    {/if}
    {#if lastPutResponse}
      <div id="put-result">
        PUT Success - ID: {lastPutResponse.id}, Name: {lastPutResponse.user.name}, Email: {lastPutResponse.user.email}
      </div>
    {/if}
  </section>

  <!-- PATCH Request Test -->
  <section id="patch-test">
    <h2>PATCH Request</h2>
    <button onclick={performPatch} id="patch-button">Update User (PATCH)</button>
    {#if lastPatchResponse}
      <div id="patch-result">
        PATCH Success - ID: {lastPatchResponse.id}, Name: {lastPatchResponse.user.name}, Email: {lastPatchResponse.user
          .email}
      </div>
    {/if}
  </section>

  <!-- QUERY Request Test -->
  <section id="query-test">
    <h2>QUERY Request</h2>
    <label>
      Name
      <input type="text" id="query-name" bind:value={searchUsers.name} />
    </label>
    <button onclick={performQuery} id="query-button">Search Users (QUERY)</button>
    {#if lastQueryResponse}
      <div id="query-result">
        {lastQueryResponse.method} Success - Name: {lastQueryResponse.name}, Query String: {JSON.stringify(
          lastQueryResponse.query,
        )}
      </div>
    {/if}
  </section>
</div>
