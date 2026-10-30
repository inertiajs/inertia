import { useHttp } from '@inertiajs/react'
import { useState } from 'react'

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

export default () => {
  const updateUser = useHttp<{ name: string; email: string }, UserResponse>({
    name: '',
    email: '',
  })

  const searchUsers = useHttp<{ name: string }, SearchResponse>({
    name: '',
  })

  const [lastPutResponse, setLastPutResponse] = useState<UserResponse | null>(null)
  const [lastPatchResponse, setLastPatchResponse] = useState<UserResponse | null>(null)
  const [lastQueryResponse, setLastQueryResponse] = useState<SearchResponse | null>(null)

  const performPut = async () => {
    try {
      const result = await updateUser.put('/api/users/1')
      setLastPutResponse(result)
    } catch (e) {
      console.error('PUT failed:', e)
    }
  }

  const performPatch = async () => {
    try {
      const result = await updateUser.patch('/api/users/1')
      setLastPatchResponse(result)
    } catch (e) {
      console.error('PATCH failed:', e)
    }
  }

  const performQuery = async () => {
    try {
      const result = await searchUsers.query('/api/users/search')
      setLastQueryResponse(result)
    } catch (e) {
      console.error('QUERY failed:', e)
    }
  }

  return (
    <div>
      <h1>useHttp Methods Test</h1>

      {/* PUT Request Test */}
      <section id="put-test">
        <h2>PUT Request</h2>
        <label>
          Name
          <input
            type="text"
            id="put-name"
            value={updateUser.data.name}
            onChange={(e) => updateUser.setData('name', e.target.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            id="put-email"
            value={updateUser.data.email}
            onChange={(e) => updateUser.setData('email', e.target.value)}
          />
        </label>
        <button onClick={performPut} id="put-button">
          Update User (PUT)
        </button>
        {updateUser.processing && <div id="put-processing">Updating...</div>}
        {lastPutResponse && (
          <div id="put-result">
            PUT Success - ID: {lastPutResponse.id}, Name: {lastPutResponse.user.name}, Email:{' '}
            {lastPutResponse.user.email}
          </div>
        )}
      </section>

      {/* PATCH Request Test */}
      <section id="patch-test">
        <h2>PATCH Request</h2>
        <button onClick={performPatch} id="patch-button">
          Update User (PATCH)
        </button>
        {lastPatchResponse && (
          <div id="patch-result">
            PATCH Success - ID: {lastPatchResponse.id}, Name: {lastPatchResponse.user.name}, Email:{' '}
            {lastPatchResponse.user.email}
          </div>
        )}
      </section>

      {/* QUERY Request Test */}
      <section id="query-test">
        <h2>QUERY Request</h2>
        <label>
          Name
          <input
            type="text"
            id="query-name"
            value={searchUsers.data.name}
            onChange={(e) => searchUsers.setData('name', e.target.value)}
          />
        </label>
        <button onClick={performQuery} id="query-button">
          Search Users (QUERY)
        </button>
        {lastQueryResponse && (
          <div id="query-result">
            {lastQueryResponse.method} Success - Name: {lastQueryResponse.name}, Query String:{' '}
            {JSON.stringify(lastQueryResponse.query)}
          </div>
        )}
      </section>
    </div>
  )
}
